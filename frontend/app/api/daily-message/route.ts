import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "daily-message.json"
);

function readMessages(): string[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf-8");

    if (!content.trim()) {
      return [];
    }

    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data.filter(
        (item): item is string => typeof item === "string"
      );
    }

    if (Array.isArray(data.messages)) {
      return data.messages.filter(
        (item: unknown): item is string => typeof item === "string"
      );
    }

    return [];
  } catch (error) {
    console.error("Erro ao ler daily-message.json:", error);
    return [];
  }
}

function saveMessages(messages: string[]) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(messages, null, 2),
    {
      encoding: "utf-8",
      flag: "w",
    }
  );
}

export async function GET() {
  const messages = readMessages();

  return NextResponse.json({
    messages,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body === "string"
        ? body.trim()
        : typeof body?.message === "string"
          ? body.message.trim()
          : "";

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem não informada." },
        { status: 400 }
      );
    }

    const messages = readMessages();

    messages.push(message);

    saveMessages(messages);

    return NextResponse.json(
      {
        success: true,
        message,
        messages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);

    return NextResponse.json(
      { error: "Não foi possível adicionar a mensagem." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body === "string"
        ? body.trim()
        : typeof body?.message === "string"
          ? body.message.trim()
          : "";

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem não informada." },
        { status: 400 }
      );
    }

    const messages = readMessages();

    const index = messages.findIndex(
      (item) => item.trim() === message
    );

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Mensagem não encontrada.",
          message,
          messages,
        },
        { status: 404 }
      );
    }

    // Remove exatamente a mensagem encontrada
    messages.splice(index, 1);

    // Regrava o JSON já sem a mensagem removida
    saveMessages(messages);

    // Confirma que o arquivo realmente foi atualizado
    const updatedMessages = readMessages();

    return NextResponse.json({
      success: true,
      deleted: message,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Erro ao remover mensagem:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível remover a mensagem.",
      },
      { status: 500 }
    );
  }
}