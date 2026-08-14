import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

// ============================================================
// CONFIGURAÇÃO NEXT.JS
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// TIPOS
// ============================================================

type Priority =
  | "urgente"
  | "importante"
  | "normal";

type Aviso = {
  id: number;
  title: string;
  message: string;
  priority: Priority;

  imageUrl?: string;
  imageAlt?: string;

  publishedDate?: string;
  expirationDate?: string;

  createdAt: string;
};

// ============================================================
// CAMINHOS
// ============================================================

const dataFile = path.join(
  process.cwd(),
  "data",
  "avisos.json"
);

const uploadsDir = path.join(
  process.cwd(),
  "public",
  "uploads",
  "avisos"
);

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const MAX_IMAGE_BYTES =
  5 * 1024 * 1024;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

// ============================================================
// FILA DE ESCRITA
// ============================================================

let writeQueue: Promise<void> =
  Promise.resolve();

function enqueue<T>(
  task: () => Promise<T>
): Promise<T> {
  const result =
    writeQueue.then(
      task,
      task
    );

  writeQueue =
    result.then(
      () => undefined,
      () => undefined
    );

  return result;
}

// ============================================================
// RESPOSTA SEM CACHE
// ============================================================

function jsonNoCache(
  data: unknown,
  status = 200
) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// ============================================================
// ERRO
// ============================================================

function jsonError(
  error: string,
  status: number
) {
  return jsonNoCache(
    { error },
    status
  );
}

// ============================================================
// TOKEN
// ============================================================

function isValidToken(
  provided: string | null,
  expected: string
): boolean {
  if (!provided) {
    return false;
  }

  const actual =
    Buffer.from(provided);

  const secret =
    Buffer.from(expected);

  if (
    actual.length !==
    secret.length
  ) {
    return false;
  }

  return timingSafeEqual(
    actual,
    secret
  );
}

// ============================================================
// DATA
// ============================================================

/*
 * Converte uma data recebida pelo formulário.
 *
 * IMPORTANTE:
 *
 * Se o frontend enviar:
 *
 * 2026-08-13T23:59
 *
 * NÃO usamos diretamente:
 *
 * new Date("2026-08-13T23:59")
 *
 * porque queremos controlar explicitamente
 * o fuso horário.
 *
 * O sistema usa America/Sao_Paulo.
 */

function parseDate(
  value: unknown
): Date | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  // ----------------------------------------------------------
  // FORMATO LOCAL DO INPUT
  // YYYY-MM-DDTHH:mm
  // ----------------------------------------------------------

  const localMatch =
    trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
    );

  if (localMatch) {
    const year =
      Number(localMatch[1]);

    const month =
      Number(localMatch[2]);

    const day =
      Number(localMatch[3]);

    const hour =
      Number(localMatch[4]);

    const minute =
      Number(localMatch[5]);

    const second =
      Number(localMatch[6] ?? "0");

    /*
     * Brasilia é UTC-3.
     *
     * Exemplo:
     *
     * 13/08/2026 23:59
     *
     * vira:
     *
     * 2026-08-14T02:59:00.000Z
     *
     * Isso é CORRETO internamente.
     *
     * O ponto importante é que a tela deve
     * continuar mostrando 13/08/2026 23:59
     * quando convertida novamente para Brasília.
     */

    const utcTimestamp =
      Date.UTC(
        year,
        month - 1,
        day,
        hour + 3,
        minute,
        second
      );

    const date =
      new Date(
        utcTimestamp
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  }

  // ----------------------------------------------------------
  // DATA ISO COM FUSO
  // ----------------------------------------------------------

  const date =
    new Date(trimmed);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

// ============================================================
// FORMATAR DATA PARA BRASÍLIA
// ============================================================

function formatDateBrazil(
  date: Date
): string {
  const formatter =
    new Intl.DateTimeFormat(
      "sv-SE",
      {
        timeZone:
          "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    );

  return formatter.format(date);
}

// ============================================================
// EXPIRAÇÃO
// ============================================================

function isAvisoExpirado(
  aviso: Aviso
): boolean {
  if (
    !aviso.expirationDate
  ) {
    return false;
  }

  const expiration =
    parseDate(
      aviso.expirationDate
    );

  if (!expiration) {
    return false;
  }

  /*
   * >= é importante.
   *
   * Quando chegar exatamente no horário
   * da expiração, o aviso já está expirado.
   */

  return (
    Date.now() >=
    expiration.getTime()
  );
}

// ============================================================
// PUBLICAÇÃO
// ============================================================

function isAvisoNaoPublicado(
  aviso: Aviso
): boolean {
  if (
    !aviso.publishedDate
  ) {
    return false;
  }

  const published =
    parseDate(
      aviso.publishedDate
    );

  if (!published) {
    return false;
  }

  return (
    Date.now() <
    published.getTime()
  );
}

// ============================================================
// LER AVISOS
// ============================================================

async function readAvisos(): Promise<Aviso[]> {
  try {
    const content =
      await readFile(
        dataFile,
        "utf8"
      );

    const cleanContent =
      content
        .replace(/^\uFEFF/, "")
        .trim();

    if (
      !cleanContent ||
      cleanContent === "[]"
    ) {
      return [];
    }

    const data: unknown =
      JSON.parse(
        cleanContent
      );

    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    return data as Aviso[];
  } catch (
    error: unknown
  ) {
    const fileError =
      error as NodeJS.ErrnoException;

    if (
      fileError.code ===
      "ENOENT"
    ) {
      return [];
    }

    console.error(
      "Erro ao ler avisos:",
      error
    );

    return [];
  }
}

// ============================================================
// SALVAR AVISOS
// ============================================================

async function saveAvisos(
  avisos: Aviso[]
): Promise<void> {
  await mkdir(
    path.dirname(
      dataFile
    ),
    {
      recursive: true,
    }
  );

  const temporary =
    `${dataFile}.tmp`;

  await writeFile(
    temporary,
    JSON.stringify(
      avisos,
      null,
      2
    ),
    "utf8"
  );

  await rename(
    temporary,
    dataFile
  );
}

// ============================================================
// SALVAR IMAGEM
// ============================================================

async function saveImage(
  base64: string,
  mimeType: string
): Promise<string> {
  const mime =
    mimeType
      .trim()
      .toLowerCase()
      .split(";")[0];

  const extension =
    imageExtensions[mime];

  if (!extension) {
    throw new Error(
      "Tipo de imagem não suportado. Use JPG, PNG, GIF ou WEBP."
    );
  }

  let normalized =
    base64.trim();

  if (
    normalized.startsWith(
      "data:"
    )
  ) {
    const separator =
      normalized.indexOf(",");

    if (
      separator === -1
    ) {
      throw new Error(
        "Imagem em formato inválido."
      );
    }

    normalized =
      normalized.substring(
        separator + 1
      );
  }

  normalized =
    normalized.replace(
      /\s/g,
      ""
    );

  if (!normalized) {
    throw new Error(
      "Imagem vazia."
    );
  }

  if (
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      normalized
    )
  ) {
    throw new Error(
      "Imagem em formato Base64 inválido."
    );
  }

  if (
    normalized.length % 4 !==
    0
  ) {
    throw new Error(
      "Imagem em formato Base64 inválido."
    );
  }

  let image: Buffer;

  try {
    image =
      Buffer.from(
        normalized,
        "base64"
      );
  } catch {
    throw new Error(
      "Não foi possível processar a imagem."
    );
  }

  if (
    image.length === 0
  ) {
    throw new Error(
      "A imagem está vazia."
    );
  }

  if (
    image.byteLength >
    MAX_IMAGE_BYTES
  ) {
    throw new Error(
      "A imagem não pode ter mais de 5 MB."
    );
  }

  await mkdir(
    uploadsDir,
    {
      recursive: true,
    }
  );

  const fileName =
    `${Date.now()}-${randomUUID()}.${extension}`;

  const filePath =
    path.join(
      uploadsDir,
      fileName
    );

  await writeFile(
    filePath,
    image
  );

  return `/uploads/avisos/${fileName}`;
}

// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    const avisos =
      await readAvisos();

    if (
      avisos.length === 0
    ) {
      return jsonNoCache(
        null
      );
    }

    const avisosAtivos =
      avisos.filter(
        (aviso) => {
          if (
            isAvisoNaoPublicado(
              aviso
            )
          ) {
            return false;
          }

          if (
            isAvisoExpirado(
              aviso
            )
          ) {
            return false;
          }

          return true;
        }
      );

    if (
      avisosAtivos.length ===
      0
    ) {
      return jsonNoCache(
        null
      );
    }

    const aviso =
      avisosAtivos[
        avisosAtivos.length - 1
      ];

    return jsonNoCache(
      aviso
    );
  } catch (
    error
  ) {
    console.error(
      "Erro ao buscar aviso:",
      error
    );

    return jsonError(
      "Não foi possível ler os avisos.",
      500
    );
  }
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest
) {
  // ==========================================================
  // TOKEN
  // ==========================================================

  const token =
    process.env
      .INTRANET_AVISOS_TOKEN;

  if (
    token &&
    !isValidToken(
      request.headers.get(
        "x-intranet-token"
      ),
      token
    )
  ) {
    return jsonError(
      "Não autorizado.",
      401
    );
  }

  // ==========================================================
  // JSON
  // ==========================================================

  let body: Record<
    string,
    unknown
  >;

  try {
    body =
      (await request.json()) as Record<
        string,
        unknown
      >;
  } catch {
    return jsonError(
      "JSON inválido.",
      400
    );
  }

  // ==========================================================
  // TÍTULO
  // ==========================================================

  const title =
    typeof body.title ===
    "string"
      ? body.title.trim()
      : "";

  if (!title) {
    return jsonError(
      "O título é obrigatório.",
      400
    );
  }

  if (
    title.length > 120
  ) {
    return jsonError(
      "O título pode ter no máximo 120 caracteres.",
      400
    );
  }

  // ==========================================================
  // MENSAGEM
  // ==========================================================

  const message =
    typeof body.message ===
    "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return jsonError(
      "A mensagem é obrigatória.",
      400
    );
  }

  if (
    message.length > 1000
  ) {
    return jsonError(
      "A mensagem pode ter no máximo 1000 caracteres.",
      400
    );
  }

  // ==========================================================
  // PRIORIDADE
  // ==========================================================

  const priorityValue =
    body.priority;

  const priority: Priority =
    priorityValue ===
      "urgente" ||
    priorityValue ===
      "importante" ||
    priorityValue ===
      "normal"
      ? priorityValue
      : "normal";

  // ==========================================================
  // ALT DA IMAGEM
  // ==========================================================

  const imageAlt =
    typeof body.imageAlt ===
    "string"
      ? body.imageAlt.trim()
      : undefined;

  // ==========================================================
  // DATA DE PUBLICAÇÃO
  // ==========================================================

  let publishedDate:
    | string
    | undefined;

  if (
    typeof body.publishedDate ===
      "string" &&
    body.publishedDate.trim()
  ) {
    const date =
      parseDate(
        body.publishedDate
      );

    if (!date) {
      return jsonError(
        "Data de publicação inválida.",
        400
      );
    }

    publishedDate =
      date.toISOString();
  }

  // ==========================================================
  // DATA DE EXPIRAÇÃO
  // ==========================================================

  let expirationDate:
    | string
    | undefined;

  if (
    typeof body.expirationDate ===
      "string" &&
    body.expirationDate.trim()
  ) {
    const date =
      parseDate(
        body.expirationDate
      );

    if (!date) {
      return jsonError(
        "Data de expiração inválida.",
        400
      );
    }

    expirationDate =
      date.toISOString();
  }

  // ==========================================================
  // CRIAÇÃO
  // ==========================================================

  const createdAt =
    new Date();

  // ==========================================================
  // PUBLICAÇÃO PADRÃO
  // ==========================================================

  if (
    !publishedDate
  ) {
    publishedDate =
      createdAt.toISOString();
  }

  // ==========================================================
  // EXPIRAÇÃO PADRÃO
  // ==========================================================

  /*
   * Se nenhuma expiração for enviada,
   * o aviso ficará ativo por 24 horas.
   */

  if (
    !expirationDate
  ) {
    const automaticExpiration =
      new Date(
        createdAt.getTime() +
          24 *
            60 *
            60 *
            1000
      );

    expirationDate =
      automaticExpiration.toISOString();
  }

  // ==========================================================
  // VALIDAR DATAS
  // ==========================================================

  const published =
    parseDate(
      publishedDate
    );

  const expiration =
    parseDate(
      expirationDate
    );

  if (
    !published ||
    !expiration
  ) {
    return jsonError(
      "Não foi possível processar as datas do aviso.",
      400
    );
  }

  if (
    expiration.getTime() <=
    published.getTime()
  ) {
    return jsonError(
      "A data de expiração deve ser posterior à data de publicação.",
      400
    );
  }

  // ==========================================================
  // IMAGEM
  // ==========================================================

  let imageUrl:
    | string
    | undefined;

  const imageBase64 =
    typeof body.imageBase64 ===
    "string"
      ? body.imageBase64.trim()
      : "";

  const imageMimeType =
    typeof body.imageMimeType ===
    "string"
      ? body.imageMimeType.trim()
      : "";

  if (
    imageBase64 ||
    imageMimeType
  ) {
    if (
      !imageBase64 ||
      !imageMimeType
    ) {
      return jsonError(
        "Dados da imagem incompletos.",
        400
      );
    }

    try {
      imageUrl =
        await saveImage(
          imageBase64,
          imageMimeType
        );
    } catch (
      error
    ) {
      console.error(
        "Erro ao salvar imagem:",
        error
      );

      return jsonError(
        error instanceof Error
          ? error.message
          : "Imagem inválida.",
        400
      );
    }
  }

  // ==========================================================
  // CRIAR AVISO
  // ==========================================================

  const aviso: Aviso = {
    id: Date.now(),

    title,

    message,

    priority,

    createdAt:
      createdAt.toISOString(),

    publishedDate,

    expirationDate,

    ...(imageUrl
      ? {
          imageUrl,
        }
      : {}),

    ...(imageAlt
      ? {
          imageAlt,
        }
      : {}),
  };

  // ==========================================================
  // LOG DE DEBUG
  // ==========================================================

  console.log(
    "========================================"
  );

  console.log(
    "AVISO RECEBIDO"
  );

  console.log(
    "Título:",
    aviso.title
  );

  console.log(
    "Publicado ISO:",
    aviso.publishedDate
  );

  console.log(
    "Expiração ISO:",
    aviso.expirationDate
  );

  console.log(
    "Publicado Brasil:",
    published
      ? formatDateBrazil(
          published
        )
      : null
  );

  console.log(
    "Expiração Brasil:",
    expiration
      ? formatDateBrazil(
          expiration
        )
      : null
  );

  console.log(
    "========================================"
  );

  // ==========================================================
  // SALVAR
  // ==========================================================

  try {
    return await enqueue(
      async () => {
        const avisos =
          await readAvisos();

        const novosAvisos =
          [
            ...avisos,
            aviso,
          ].slice(-50);

        await saveAvisos(
          novosAvisos
        );

        console.log(
          "Aviso salvo:",
          {
            id: aviso.id,
            title: aviso.title,
            publishedDate:
              aviso.publishedDate,
            expirationDate:
              aviso.expirationDate,
          }
        );

        return jsonNoCache(
          aviso,
          201
        );
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Erro ao salvar aviso:",
      error
    );

    return jsonError(
      "Não foi possível salvar o aviso.",
      500
    );
  }
}