import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mimeTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".ogv": "video/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

const uploadsDirectory = path.resolve(process.cwd(), "public", "uploads", "avisos");

function resolveAttachment(filenameValue: string): { filePath: string; mimeType: string } | null {
  let filename: string;
  try {
    filename = decodeURIComponent(filenameValue);
  } catch {
    return null;
  }

  if (
    !filename ||
    filename.length > 255 ||
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\") ||
    path.basename(filename) !== filename ||
    !/^[A-Za-z0-9._-]+$/.test(filename)
  ) {
    return null;
  }

  const mimeType = mimeTypes[path.extname(filename).toLowerCase()];
  if (!mimeType) return null;

  const filePath = path.resolve(uploadsDirectory, filename);
  if (!filePath.startsWith(`${uploadsDirectory}${path.sep}`)) return null;
  return { filePath, mimeType };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const attachment = resolveAttachment(filename);
  if (!attachment) {
    return NextResponse.json({ error: "Anexo inválido." }, { status: 400 });
  }

  try {
    const file = await readFile(attachment.filePath);
    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Disposition": `inline; filename="${path.basename(attachment.filePath)}"`,
        "Content-Length": String(file.length),
        "Content-Type": attachment.mimeType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
    }
    console.error("Erro ao carregar anexo de aviso:", error);
    return NextResponse.json({ error: "Erro ao carregar o anexo." }, { status: 500 });
  }
}
