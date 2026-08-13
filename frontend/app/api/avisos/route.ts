import { randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Priority = "urgente" | "importante" | "normal";
type Aviso = {
  id: number;
  title: string;
  message: string;
  priority: Priority;
  link?: string;
  imageUrl?: string;
  createdAt: string;
};

const dataFile = path.join(process.cwd(), "data", "avisos.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads", "avisos");
const maxImageBytes = 5 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
};
let lastId = 0;
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isValidToken(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const actual = Buffer.from(provided);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

async function readAvisos(): Promise<Aviso[]> {
  try {
    const data: unknown = JSON.parse(await readFile(dataFile, "utf8"));
    return Array.isArray(data) ? data as Aviso[] : [];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveAvisos(avisos: Aviso[]) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.tmp`;
  await writeFile(temporary, JSON.stringify(avisos, null, 2), "utf8");
  await rename(temporary, dataFile);
}

async function saveImage(base64: string, mimeType: string): Promise<string> {
  const extension = imageExtensions[mimeType.trim().toLowerCase()];
  if (!extension) throw new Error("Tipo de imagem não suportado. Use JPG, PNG, GIF ou WEBP.");
  const normalized = base64.trim();
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error("Imagem em formato inválido.");
  }
  const image = Buffer.from(normalized, "base64");
  if (!image.length || image.byteLength > maxImageBytes) throw new Error("Imagem inválida ou maior que 5 MB.");
  await mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadsDir, fileName), image);
  return `/uploads/avisos/${fileName}`;
}

export async function GET() {
  try {
    const avisos = await readAvisos();
    return NextResponse.json(avisos.at(-1) ?? null, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Não foi possível ler os avisos.", 500);
  }
}

export async function POST(request: NextRequest) {
  const token = process.env.INTRANET_AVISOS_TOKEN;
  if (token && !isValidToken(request.headers.get("x-intranet-token"), token)) return jsonError("Não autorizado.", 401);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return jsonError("JSON inválido.", 400); }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const link = typeof body.link === "string" ? body.link.trim() : "";
  if (!title || !message || title.length > 120 || message.length > 1000) return jsonError("Título ou mensagem inválidos.", 400);
  if (link && !/^https?:\/\//i.test(link)) return jsonError("O link precisa iniciar com http:// ou https://.", 400);

  let imageUrl: string | undefined;
  if (typeof body.imageBase64 === "string" || typeof body.imageMimeType === "string") {
    if (typeof body.imageBase64 !== "string" || typeof body.imageMimeType !== "string") return jsonError("Dados da imagem incompletos.", 400);
    try { imageUrl = await saveImage(body.imageBase64, body.imageMimeType); } catch (error) { return jsonError(error instanceof Error ? error.message : "Imagem inválida.", 400); }
  }
  const value = body.priority;
  const priority: Priority = value === "urgente" || value === "importante" || value === "normal" ? value : "normal";
  const now = Date.now();
  lastId = Math.max(lastId + 1, now);
  const aviso: Aviso = { id: lastId, title, message, priority, createdAt: new Date().toISOString(), ...(link && { link }), ...(imageUrl && { imageUrl }) };

  try {
    return await enqueue(async () => {
      const avisos = await readAvisos();
      await saveAvisos([...avisos, aviso].slice(-50));
      return NextResponse.json(aviso, { status: 201 });
    });
  } catch {
    return jsonError("Não foi possível salvar o aviso.", 500);
  }
}
