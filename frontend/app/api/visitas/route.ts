import { timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Visitas = Record<string, { primeiraVez: string; ultimaVez: string; pagina?: string; navegador?: string; nome?: string; departamento?: string }>;
const dataFile = path.join(process.cwd(), process.env.INTRANET_DATA_DIR || "data", "visitas.json");
const onlineThresholdMs = 2 * 60 * 1000;
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
      const now = new Date().toISOString();
      const usuarioAutenticado = obterUsuarioAutenticado(request);
      visitas[sessionId] = {
        primeiraVez: visitas[sessionId]?.primeiraVez ?? now,
        ultimaVez: now,
        pagina: typeof body.pagina === "string" ? body.pagina.slice(0, 200) : "/",
        navegador: identificarNavegador(typeof body.navegador === "string" ? body.navegador : ""),
        nome: usuarioAutenticado || (typeof body.nome === "string" ? body.nome.slice(0, 80) : "Visitante"),
        departamento: typeof body.departamento === "string" ? body.departamento.slice(0, 80) : "Não informado",
      };
      await saveVisitas(visitas);
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Não foi possível registrar a visita." }, { status: 500 }); }
}

// O navegador não expõe o usuário do sistema operacional. Em produção, um
// proxy com SSO pode repassar o usuário autenticado por um destes cabeçalhos.
function obterUsuarioAutenticado(request: NextRequest): string | undefined {
  const value = request.headers.get("x-auth-user")
    || request.headers.get("x-remote-user")
    || request.headers.get("remote-user");
  if (!value) return undefined;
  const nome = value.trim().replace(/^.*[\\/]/, "");
  return nome && nome.length <= 80 ? nome : undefined;
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
    const ultimaConexao = sessions.map(({ ultimaVez }) => ultimaVez).sort().at(-1) ?? null;
    return NextResponse.json({
      onlineAgora: sessions.filter(({ ultimaVez }) => now - new Date(ultimaVez).getTime() <= onlineThresholdMs).length,
      acessosHoje: sessions.filter(({ ultimaVez }) => dayKey(new Date(ultimaVez)) === today).length,
      totalVisitantes: sessions.length,
      ultimaConexao,
      visitantes: sessions.filter(({ ultimaVez }) => now - Date.parse(ultimaVez) <= onlineThresholdMs).map(p => ({ nome: p.nome || "Visitante", departamento: p.departamento || "Não informado", pagina: p.pagina || "/", tempo: Math.floor((now - Date.parse(p.primeiraVez)) / 60000) + " min", navegador: p.navegador || "Não informado" })),
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
