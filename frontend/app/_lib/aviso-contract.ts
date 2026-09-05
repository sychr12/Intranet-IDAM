export type Priority = "urgente" | "importante" | "normal";
export function normalizePriority(value: unknown): Priority | null {
  if (value == null || value === "") return "normal";
  if (typeof value !== "string") return null;
  switch (value.toLowerCase()) {
    case "urgent": case "immediate": case "urgente": case "imediata": return "urgente";
    case "high": case "alta": case "importante": return "importante";
    case "low": case "baixa": case "normal": return "normal";
    default: return null;
  }
}
// A Central envia horário local sem offset. A referência é a mesma no servidor e navegador.
export function parseAvisoDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  let text = value.trim();
  const local = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/);
  if (local) {
    const [, y, m, d, h = "00", min = "00", sec = "00"] = local;
    const check = new Date(Date.UTC(+y, +m - 1, +d));
    if (check.getUTCFullYear() !== +y || check.getUTCMonth() !== +m - 1 || check.getUTCDate() !== +d || +h > 23 || +min > 59 || +sec > 59) return null;
    text = text.length === 10 ? text + "T00:00:00-03:00" : text + "-03:00";
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function safeLink(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
