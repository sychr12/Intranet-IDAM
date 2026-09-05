import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
import { checkAuth } from "../../_lib/avisos-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const filePath = path.join(process.cwd(), process.env.INTRANET_DATA_DIR || "data", "daily-message.json");
function readMessages(): string[] {
  if (!existsSync(filePath)) return [];
  const data: unknown = JSON.parse(readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  const messages = Array.isArray(data) ? data : data && typeof data === "object" && "messages" in data ? data.messages : null;
  if (!Array.isArray(messages) || messages.some(item => typeof item !== "string")) throw new Error("Arquivo de mensagens inválido; original preservado.");
  return messages;
}
function saveMessages(messages: string[]) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath + ".tmp", JSON.stringify(messages, null, 2), "utf8");
  renameSync(filePath + ".tmp", filePath);
}
function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } }); }
export function GET() {
  try {
    const messages = readMessages();
    return json({ messages, message: messages[Math.floor(Math.random() * messages.length)] || "Tenha um excelente dia!" });
  } catch { return json({ error: "Não foi possível ler as mensagens." }, 500); }
}
async function mutate(request: NextRequest, remove: boolean) {
  if (!checkAuth(request)) return json({ error: "Não autorizado." }, 401);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400); }
  const value = typeof body === "string" ? body : body && typeof body === "object" && "message" in body ? body.message : null;
  if (typeof value !== "string" || !value.trim()) return json({ error: "Mensagem não informada." }, 400);
  const message = value.trim();
  try {
    const messages = readMessages();
    if (remove) {
      const index = messages.indexOf(message);
      if (index < 0) return json({ error: "Mensagem não encontrada." }, 404);
      messages.splice(index, 1);
    } else messages.push(message);
    saveMessages(messages);
    return json({ success: true, message, messages }, remove ? 200 : 201);
  } catch { return json({ error: "Não foi possível salvar as mensagens." }, 500); }
}
export function POST(request: NextRequest) { return mutate(request, false); }
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return json({ error: "Não autorizado." }, 401);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400); }
  const dados = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const antigo = typeof dados.oldMessage === "string" ? dados.oldMessage.trim() : "";
  const novo = typeof dados.message === "string" ? dados.message.trim() : "";
  if (!antigo || !novo) return json({ error: "Mensagem antiga e nova são obrigatórias." }, 400);
  try {
    const messages = readMessages();
    const index = messages.indexOf(antigo);
    if (index < 0) return json({ error: "Mensagem não encontrada." }, 404);
    messages[index] = novo;
    saveMessages(messages);
    return json({ success: true, message: novo, messages });
  } catch { return json({ error: "Não foi possível editar a mensagem." }, 500); }
}
export function DELETE(request: NextRequest) { return mutate(request, true); }
