import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type Aviso = {
  id: string;
  title: string;
  message: string;
  priority: "normal" | "important" | "urgent" | string;
  criticality: "informative" | "low" | "moderate" | "high" | "critical" | string;
  link?: string | null;
  publishedDate?: string | null;
  expirationDate?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  active: boolean;
  closable: boolean;
  createdAt: string;
};

const dataDirectory = join(process.cwd(), ".data");
const storageFile = join(dataDirectory, "avisos.json");

async function readAvisos(): Promise<Aviso[]> {
  try {
    const content = await readFile(storageFile, "utf-8");
    const avisos: unknown = JSON.parse(content);
    return Array.isArray(avisos) ? avisos as Aviso[] : [];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveAvisos(avisos: Aviso[]) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${storageFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(avisos, null, 2), "utf-8");
  await rename(temporaryFile, storageFile);
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalDate(value: unknown, field: string) {
  const date = stringOrNull(value);
  if (date && Number.isNaN(Date.parse(date))) {
    throw new Error(`${field} inválida.`);
  }
  return date;
}

export async function listarAvisos() {
  return readAvisos();
}

export async function criarAviso(input: Record<string, unknown>) {
  const title = stringOrNull(input.title);
  const message = stringOrNull(input.message);
  if (!title || !message) throw new Error("Título e mensagem são obrigatórios.");

  const publishedDate = optionalDate(input.publishedDate, "Data de publicação");
  const expirationDate = optionalDate(input.expirationDate, "Data de expiração");
  if (publishedDate && expirationDate && Date.parse(expirationDate) <= Date.parse(publishedDate)) {
    throw new Error("A expiração deve ser posterior à publicação.");
  }

  const aviso: Aviso = {
    id: crypto.randomUUID(),
    title,
    message,
    priority: stringOrNull(input.priority) ?? "normal",
    criticality: stringOrNull(input.criticality) ?? "informative",
    link: stringOrNull(input.link),
    publishedDate,
    expirationDate,
    imageBase64: stringOrNull(input.imageBase64),
    imageMimeType: stringOrNull(input.imageMimeType),
    active: input.active !== false,
    closable: input.closable !== false,
    createdAt: new Date().toISOString(),
  };

  const avisos = await readAvisos();
  avisos.unshift(aviso);
  await saveAvisos(avisos);
  return aviso;
}

export async function atualizarAviso(id: string, input: Record<string, unknown>) {
  const avisos = await readAvisos();
  const index = avisos.findIndex((aviso) => aviso.id === id);
  if (index < 0) return null;

  if (typeof input.active === "boolean") avisos[index].active = input.active;
  await saveAvisos(avisos);
  return avisos[index];
}

export async function excluirAviso(id: string) {
  const avisos = await readAvisos();
  const remaining = avisos.filter((aviso) => aviso.id !== id);
  if (remaining.length === avisos.length) return false;
  await saveAvisos(remaining);
  return true;
}
