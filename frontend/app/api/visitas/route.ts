import { timingSafeEqual } from "node:crypto";
import { reverse } from "node:dns/promises";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Visita = {
  primeiraVez: string;
  ultimaVez: string;
  pagina?: string;
  navegador?: string;
  nome?: string;
  departamento?: string;
  ip?: string;
  maquina?: string;
  ultimaAtividade?: string;
};

type Visitas = Record<string, Visita>;
const dataFile = path.join(process.cwd(), process.env.INTRANET_DATA_DIR || "data", "visitas.json");
const onlineThresholdMs = 2 * 60 * 1000;
const reverseDnsTimeoutMs = 300;
const reverseDnsCacheTtlMs = 6 * 60 * 60 * 1000;
const reverseDnsFailureCacheTtlMs = 5 * 60 * 1000;
const reverseDnsCacheMaxEntries = 500;

type ReverseDnsCacheEntry = {
  maquina?: string;
  expiresAt: number;
  pending?: Promise<void>;
};

const reverseDnsCache = new Map<string, ReverseDnsCacheEntry>();
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

function isValidToken(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const actual = Buffer.from(provided);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

async function readVisitas(): Promise<Visitas> {
  try { return JSON.parse(await readFile(dataFile, "utf8")) as Visitas; }
  catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}; throw error; }
}

async function saveVisitas(visitas: Visitas) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.tmp`;
  await writeFile(temporary, JSON.stringify(visitas, null, 2), "utf8");
  await rename(temporary, dataFile);
}

export async function POST(request: NextRequest) {
  let body: { sessionId?: unknown; pagina?: unknown; navegador?: unknown; nome?: unknown; departamento?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 100 || ["__proto__", "constructor", "prototype"].includes(sessionId)) return NextResponse.json({ error: "sessionId inválido." }, { status: 400 });
  try {
    await enqueue(async () => {
      const visitas = await readVisitas();
      const nowMs = Date.now();
      const now = new Date(nowMs).toISOString();
      const visitaAnterior = visitas[sessionId];
      const usuarioAutenticado = obterUsuarioAutenticado(request);
      const departamentoAutenticado = obterDepartamentoAutenticado(request);
      const ip = obterIpCliente(request);
      const maquinaInformada = obterMaquinaInformada(request);
      const maquinaResolvida = ip ? obterMaquinaResolvidaEmCache(ip) : undefined;
      const nome = usuarioAutenticado ?? obterTextoInformado(body.nome, 80, ["visitante"]);
      const departamento = departamentoAutenticado ?? obterTextoInformado(body.departamento, 80, ["não informado", "nao informado"]);

      visitas[sessionId] = {
        ...visitaAnterior,
        primeiraVez: sessaoEstaInativa(visitaAnterior, nowMs) ? now : visitaAnterior.primeiraVez,
        ultimaVez: now,
        ultimaAtividade: now,
        pagina: typeof body.pagina === "string" ? body.pagina.slice(0, 200) : "/",
        navegador: identificarNavegador(typeof body.navegador === "string" ? body.navegador : ""),
        ...(nome ? { nome } : {}),
        ...(departamento ? { departamento } : {}),
        ...(ip ? { ip } : {}),
        ...(maquinaInformada || maquinaResolvida ? { maquina: maquinaInformada ?? maquinaResolvida } : {}),
      };
      await saveVisitas(visitas);
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Não foi possível registrar a visita." }, { status: 500 }); }
}

// Estes cabeçalhos só são confiáveis quando o proxy/SSO remove valores enviados
// pelo cliente e define novamente a identidade validada antes de encaminhar a requisição.
function obterUsuarioAutenticado(request: NextRequest): string | undefined {
  const value = request.headers.get("x-auth-user")
    || request.headers.get("x-remote-user")
    || request.headers.get("remote-user");
  if (!value) return undefined;
  const nome = value.trim().replace(/^.*[\\/]/, "");
  return obterTextoInformado(nome, 80);
}

function obterDepartamentoAutenticado(request: NextRequest): string | undefined {
  return obterTextoInformado(
    request.headers.get("x-auth-department") || request.headers.get("x-user-department"),
    80,
  );
}

function obterMaquinaInformada(request: NextRequest): string | undefined {
  return obterTextoInformado(
    request.headers.get("x-client-hostname") || request.headers.get("x-machine-name"),
    255,
  );
}

function obterTextoInformado(value: unknown, maxLength: number, ignoredValues: string[] = []): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || /[\u0000-\u001f\u007f]/.test(normalized)) return undefined;
  if (ignoredValues.includes(normalized.toLocaleLowerCase("pt-BR"))) return undefined;
  return normalized.slice(0, maxLength);
}

function obterIpCliente(request: NextRequest): string | undefined {
  // O proxy confiável deve sobrescrever estes cabeçalhos; o primeiro endereço
  // de x-forwarded-for representa o cliente na configuração esperada.
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0];
  const candidates = [
    forwardedFor,
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
  ];

  for (const candidate of candidates) {
    const ip = normalizarIp(candidate);
    if (ip) return ip;
  }
  return undefined;
}

function normalizarIp(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  let candidate = value.trim().replace(/^"|"$/g, "");
  if (!candidate || candidate.toLowerCase() === "unknown") return undefined;

  if (candidate.startsWith("[")) {
    const closingBracket = candidate.indexOf("]");
    if (closingBracket > 0) candidate = candidate.slice(1, closingBracket);
  } else {
    const ipv4WithPort = candidate.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
    if (ipv4WithPort) candidate = ipv4WithPort[1];
  }

  if (candidate.startsWith("::ffff:") && isIP(candidate.slice(7)) === 4) candidate = candidate.slice(7);
  return isIP(candidate) ? candidate : undefined;
}

function obterMaquinaResolvidaEmCache(ip: string): string | undefined {
  const now = Date.now();
  const cached = reverseDnsCache.get(ip);
  if (cached && cached.expiresAt > now) return cached.maquina;
  if (cached?.pending) return cached.maquina;

  if (reverseDnsCache.size >= reverseDnsCacheMaxEntries) {
    const oldestKey = reverseDnsCache.keys().next().value;
    if (oldestKey) reverseDnsCache.delete(oldestKey);
  }

  const pending = resolverHostname(ip).then((maquina) => {
    reverseDnsCache.set(ip, {
      maquina,
      expiresAt: Date.now() + (maquina ? reverseDnsCacheTtlMs : reverseDnsFailureCacheTtlMs),
    });
  });

  reverseDnsCache.set(ip, { maquina: cached?.maquina, expiresAt: cached?.expiresAt ?? 0, pending });
  void pending;
  return cached?.maquina;
}

async function resolverHostname(ip: string): Promise<string | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<string[]>((resolve) => {
    timer = setTimeout(() => resolve([]), reverseDnsTimeoutMs);
    timer.unref?.();
  });

  try {
    const hostnames = await Promise.race([reverse(ip).catch(() => []), timeout]);
    return obterTextoInformado(hostnames[0], 255);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function obterUltimaAtividade(visita: Visita): string {
  return visita.ultimaAtividade || visita.ultimaVez;
}

function sessaoEstaInativa(visita: Visita | undefined, now: number): boolean {
  if (!visita) return true;
  const ultimaAtividade = Date.parse(obterUltimaAtividade(visita));
  return !Number.isFinite(ultimaAtividade) || now - ultimaAtividade > onlineThresholdMs;
}

export async function GET(request: NextRequest) {
  const token = process.env.INTRANET_AVISOS_TOKEN || process.env.AVISOS_API_TOKEN;
  if (token && !isValidToken(request.headers.get("x-intranet-token"), token)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const visitas = await readVisitas();
    const now = Date.now();
    const dayKey = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: "America/Manaus" });
    const today = dayKey(new Date());
    const sessions = Object.values(visitas);
    const ultimaConexao = sessions.map(obterUltimaAtividade).sort().at(-1) ?? null;
    return NextResponse.json({
      onlineAgora: sessions.filter(p => now - Date.parse(obterUltimaAtividade(p)) <= onlineThresholdMs).length,
      acessosHoje: sessions.filter(p => dayKey(new Date(obterUltimaAtividade(p))) === today).length,
      totalVisitantes: sessions.length,
      ultimaConexao,
      visitantes: sessions
        .filter(p => now - Date.parse(obterUltimaAtividade(p)) <= onlineThresholdMs)
        .map(p => ({
          nome: p.nome ?? null,
          departamento: p.departamento ?? null,
          pagina: p.pagina || "/",
          tempo: Math.max(0, Math.floor((now - Date.parse(p.primeiraVez)) / 60000)) + " min",
          navegador: p.navegador || "Não informado",
          ip: p.ip ?? null,
          maquina: p.maquina ?? null,
          ultimaAtividade: obterUltimaAtividade(p),
        })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível ler as estatísticas." }, { status: 500 }); }
}

function identificarNavegador(userAgent: string): string {
  if (!userAgent) return "Não informado";
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Firefox\//i.test(userAgent)) return "Mozilla Firefox";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  if (/Trident\//i.test(userAgent) || /MSIE /i.test(userAgent)) return "Internet Explorer";
  return "Outro navegador";
}
