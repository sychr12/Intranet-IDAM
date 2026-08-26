import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Visita = {
  sessionId: string;
  accessedAt: string;
};

const dataDirectory = join(process.cwd(), ".data");
const storageFile = join(dataDirectory, "visitas.json");
const onlineWindowMs = 5 * 60 * 1000;
const retentionMs = 90 * 24 * 60 * 60 * 1000;

async function readVisitas(): Promise<Visita[]> {
  try {
    const content = await readFile(storageFile, "utf-8");
    const visitas: unknown = JSON.parse(content);
    return Array.isArray(visitas) ? visitas as Visita[] : [];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveVisitas(visitas: Visita[]) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${storageFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(visitas, null, 2), "utf-8");
  await rename(temporaryFile, storageFile);
}

export async function registrarVisita(sessionId: string) {
  const now = new Date();
  const visitas = (await readVisitas()).filter(
    (visita) => now.getTime() - Date.parse(visita.accessedAt) < retentionMs,
  );

  const lastAccess = [...visitas].reverse().find((visita) => visita.sessionId === sessionId);
  if (!lastAccess || now.getTime() - Date.parse(lastAccess.accessedAt) > 60_000) {
    visitas.push({ sessionId, accessedAt: now.toISOString() });
    await saveVisitas(visitas);
  }
}

export async function obterEstatisticasVisitas() {
  const now = new Date();
  const visitas = await readVisitas();
  const inicioHoje = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const onlineSince = now.getTime() - onlineWindowMs;

  const onlineAgora = new Set(
    visitas.filter((visita) => Date.parse(visita.accessedAt) >= onlineSince).map((visita) => visita.sessionId),
  ).size;
  const acessosHoje = visitas.filter((visita) => Date.parse(visita.accessedAt) >= inicioHoje).length;
  const totalVisitantes = new Set(visitas.map((visita) => visita.sessionId)).size;
  const ultimaConexao = visitas.at(-1)?.accessedAt ?? null;

  return { onlineAgora, acessosHoje, totalVisitantes, ultimaConexao };
}
