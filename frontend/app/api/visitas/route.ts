import { NextRequest, NextResponse } from "next/server";
import { obterEstatisticasVisitas, registrarVisita } from "../../_lib/visitas";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await obterEstatisticasVisitas(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const sessionId = typeof (body as { sessionId?: unknown } | null)?.sessionId === "string"
    ? (body as { sessionId: string }).sessionId.trim()
    : "";

  if (!sessionId || sessionId.length > 128) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  }

  await registrarVisita(sessionId);
  return new NextResponse(null, { status: 204 });
}
