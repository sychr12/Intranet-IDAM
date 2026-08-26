import { NextRequest, NextResponse } from "next/server";
import { atualizarAviso, criarAviso, excluirAviso, listarAvisos } from "../../_lib/avisos";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listarAvisos(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const aviso = await criarAviso(await request.json());
    return NextResponse.json(aviso, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar o aviso." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID do aviso é obrigatório." }, { status: 400 });

  const aviso = await atualizarAviso(id, await request.json());
  return aviso
    ? NextResponse.json(aviso)
    : NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID do aviso é obrigatório." }, { status: 400 });

  return await excluirAviso(id)
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
}
