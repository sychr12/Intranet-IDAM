import { timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Visitas = Record<string, { primeiraVez: string; ultimaVez: string }>;
const dataFile = path.join(process.cwd(), "data", "visitas.json");
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
  let body: { sessionId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 100) return NextResponse.json({ error: "sessionId inválido." }, { status: 400 });
  try {
    await enqueue(async () => {
      const visitas = await readVisitas();
      const now = new Date().toISOString();
      visitas[sessionId] = { primeiraVez: visitas[sessionId]?.primeiraVez ?? now, ultimaVez: now };
      await saveVisitas(visitas);
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Não foi possível registrar a visita." }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  const token = process.env.INTRANET_AVISOS_TOKEN;
  if (token && !isValidToken(request.headers.get("x-intranet-token"), token)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const visitas = await readVisitas();
    const now = Date.now();
    const today = new Date().toDateString();
    const sessions = Object.values(visitas);
    const ultimaConexao = sessions.map(({ ultimaVez }) => ultimaVez).sort().at(-1) ?? null;
    return NextResponse.json({
      onlineAgora: sessions.filter(({ ultimaVez }) => now - new Date(ultimaVez).getTime() <= onlineThresholdMs).length,
      acessosHoje: sessions.filter(({ ultimaVez }) => new Date(ultimaVez).toDateString() === today).length,
      totalVisitantes: sessions.length,
      ultimaConexao,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível ler as estatísticas." }, { status: 500 }); }
}
