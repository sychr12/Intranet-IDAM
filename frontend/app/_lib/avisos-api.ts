import { normalizePriority, parseAvisoDate, safeLink } from "./aviso-contract";
import { timingSafeEqual } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  NextRequest,
  NextResponse,
} from "next/server";

// ============================================================
// NEXT.JS
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// TIPOS
// ============================================================

export type Priority =
  | "urgente"
  | "importante"
  | "normal";

export type Aviso = {
  id: number;

  title: string;

  message: string;

  priority: Priority;
  criticality?: string;
  link?: string;

  imageUrl?: string;
  imageMimeType?: string;

  imageAlt?: string;

  publishedDate?: string;

  expirationDate?: string;

  createdAt: string;

  active: boolean;

  model?: string;

  size?: string;

  icon?: string;

  showDates?: boolean;

  backgroundColor?: string;

  textColor?: string;

  highlightColor?: string;

  pageCentral?: boolean;

  pageLogin?: boolean;

  pageHelpdesk?: boolean;

  closable?: boolean;
};

// ============================================================
// CAMINHOS
// ============================================================

const dataFile = path.join(
  process.cwd(),
  process.env.INTRANET_DATA_DIR || "data",
  "avisos.json"
);

export const uploadsDir = path.join(
  process.cwd(),
  "public",
  "uploads",
  "avisos"
);

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const MAX_IMAGE_BYTES =
  25 * 1024 * 1024;

const imageExtensions: Record<
  string,
  string
> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

// ============================================================
// FILA DE ESCRITA
// ============================================================

let writeQueue: Promise<void> =
  Promise.resolve();

export function enqueue<T>(
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

export function jsonNoCache(
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

export function jsonError(
  error: string,
  status: number
) {
  return jsonNoCache(
    {
      error,
    },
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
    Buffer.from(
      provided
    );

  const secret =
    Buffer.from(
      expected
    );

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

export function checkAuth(
  request: NextRequest
): boolean {

  const expectedToken =
    process.env.AVISOS_API_TOKEN || process.env.INTRANET_AVISOS_TOKEN;

  /*
   * Sem token configurado:
   * permite acesso.
   */
  if (
    !expectedToken ||
    expectedToken.trim() === ""
  ) {
    return true;
  }

  /*
   * Aceita:
   *
   * Authorization: Bearer TOKEN
   *
   * x-api-token: TOKEN
   *
   * x-intranet-token: TOKEN
   */

  const authorization =
    request.headers.get(
      "authorization"
    );

  const apiToken =
    request.headers.get(
      "x-api-token"
    );

  const intranetToken =
    request.headers.get(
      "x-intranet-token"
    );

  let providedToken:
    | string
    | null = null;

  if (authorization) {

    providedToken =
      authorization.replace(
        /^Bearer\s+/i,
        ""
      );
  }

  if (!providedToken) {
    providedToken =
      apiToken;
  }

  if (!providedToken) {
    providedToken =
      intranetToken;
  }

  return isValidToken(
    providedToken,
    expectedToken
  );
}

// ============================================================
// DATA
// ============================================================

const parseDate = parseAvisoDate;

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

export async function readAvisos(): Promise<
  Aviso[]
> {

  try {

    const content =
      await readFile(
        dataFile,
        "utf8"
      );

    const cleanContent =
      content
        .replace(
          /^\uFEFF/,
          ""
        )
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
      throw new Error("Arquivo de avisos deve conter uma lista.");
    }

    /*
     * Normaliza avisos antigos.
     */

    return data.map((value: unknown): Aviso => {
      if (!value || typeof value !== "object") throw new Error("Aviso inválido no arquivo.");
      const item = value as Record<string, unknown>;
      const id = Number(item.id);
      if (!Number.isSafeInteger(id) || id <= 0) throw new Error("ID inválido no arquivo de avisos.");
      return { ...item, id, title: String(item.title ?? item.titulo ?? ""), message: String(item.message ?? item.mensagem ?? ""), priority: normalizePriority(item.priority) ?? "normal", createdAt: String(item.createdAt ?? "1970-01-01T00:00:00Z"), active: item.active !== false, link: safeLink(item.link) } as Aviso;
    });

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

    throw error;
  }
}

// ============================================================
// SALVAR
// ============================================================

export async function saveAvisos(
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
// ID
// ============================================================

function generateId(
  avisos: Aviso[]
): number {

  if (
    avisos.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...avisos.map(
        (aviso) =>
          Number(
            aviso.id
          ) || 0
      )
    ) + 1
  );
}

// ============================================================
// GET
// ============================================================

export async function GET(
  request: NextRequest
) {

  try {

    const avisos =
      await readAvisos();

    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    const active =
      searchParams.get(
        "active"
      );

    const publicOnly =
      searchParams.get(
        "public"
      );

    let resultado =
      avisos;

    /*
     * ?active=true
     */

    if (
      active === "true"
    ) {

      resultado =
        resultado.filter(
          (
            aviso
          ) =>
            aviso.active !==
            false
        );
    }

    /*
     * ?public=true
     *
     * Somente o que deve
     * aparecer na intranet.
     */

    if (
      publicOnly === "true"
    ) {

      resultado =
        resultado.filter(
          (
            aviso
          ) =>
            aviso.active !==
              false &&
            !isAvisoNaoPublicado(
              aviso
            ) &&
            !isAvisoExpirado(
              aviso
            )
        );
    }

    /*
     * Mais recentes primeiro.
     */

    resultado =
      [...resultado].sort(
        (
          a,
          b
        ) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );

    return jsonNoCache(
      resultado
    );

  } catch (
    error
  ) {

    console.error(
      "Erro no GET /api/avisos:",
      error
    );

    return jsonError(
      "Erro ao carregar os avisos.",
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

  if (
    !checkAuth(
      request
    )
  ) {

    return jsonError(
      "Não autorizado.",
      401
    );
  }

  try {

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return jsonError("JSON inválido.", 400);

    const title =
      typeof body.title ===
      "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message ===
      "string"
        ? body.message.trim()
        : "";

    const priority = normalizePriority(body.priority);

    if (!title) {

      return jsonError(
        "O título é obrigatório.",
        400
      );
    }

    if (!message) {

      return jsonError(
        "A mensagem é obrigatória.",
        400
      );
    }

    if (
      priority !==
        "urgente" &&
      priority !==
        "importante" &&
      priority !==
        "normal"
    ) {

      return jsonError(
        "Prioridade inválida.",
        400
      );
    }

    const publishedDate =
      typeof body.publishedDate ===
      "string"
        ? body.publishedDate.trim()
        : undefined;

    const expirationDate =
      typeof body.expirationDate ===
      "string"
        ? body.expirationDate.trim()
        : undefined;

    if (
      publishedDate &&
      !parseDate(
        publishedDate
      )
    ) {

      return jsonError(
        "Data de publicação inválida.",
        400
      );
    }

    if (
      expirationDate &&
      !parseDate(
        expirationDate
      )
    ) {

      return jsonError(
        "Data de expiração inválida.",
        400
      );
    }

    if (
      publishedDate &&
      expirationDate
    ) {

      const published =
        parseDate(
          publishedDate
        );

      const expiration =
        parseDate(
          expirationDate
        );

      if (
        published &&
        expiration &&
        expiration.getTime() <=
          published.getTime()
      ) {

        return jsonError(
          "A data de expiração deve ser posterior à publicação.",
          400
        );
      }
    }

    return await enqueue(async () => {
    const avisos =
      await readAvisos();

    let imageUrl:
      | string
      | undefined;

    /*
     * ========================================================
     * IMAGEM BASE64
     * ========================================================
     */

    if (
      typeof body.imageBase64 ===
      "string" &&
      body.imageBase64.trim()
    ) {

      const base64 =
        body.imageBase64
          .trim();

      const mimeType =
        typeof body.imageMimeType ===
        "string"
          ? body.imageMimeType
          : "";

      const extension =
        imageExtensions[
          mimeType
        ];

      if (!extension) {

        return jsonError(
          "Formato de imagem não suportado.",
          400
        );
      }

      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0 || base64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) return jsonError("Arquivo inválido ou maior que 25 MB.", 400);
      let buffer: Buffer;

      try {

        buffer =
          Buffer.from(
            base64,
            "base64"
          );

      } catch {

        return jsonError(
          "Imagem inválida.",
          400
        );
      }

      if (
        buffer.length >
        MAX_IMAGE_BYTES
      ) {

        return jsonError(
          "Arquivo excede o tamanho máximo de 25 MB.",
          400
        );
      }

      await mkdir(
        uploadsDir,
        {
          recursive: true,
        }
      );

      const filename =
        `${Date.now()}-${generateId(avisos)}.${extension}`;

      const imagePath =
        path.join(
          uploadsDir,
          filename
        );

      await writeFile(
        imagePath,
        buffer
      );

      imageUrl =
        `/uploads/avisos/${filename}`;
    }

    /*
     * ========================================================
     * NOVO AVISO
     * ========================================================
     */

    const novoAviso: Aviso = {

      id:
        generateId(
          avisos
        ),

      title,

      message,

      priority,
      criticality: typeof body.criticality === "string" ? body.criticality : "informative",
      link: safeLink(body.link),

      imageUrl,
      imageMimeType: typeof body.imageMimeType === "string" ? body.imageMimeType : undefined,

      imageAlt:
        typeof body.imageAlt ===
        "string"
          ? body.imageAlt.trim()
          : undefined,

      publishedDate,

      expirationDate,

      createdAt:
        new Date()
          .toISOString(),

      active:
        body.active !== false,

      model:
        typeof body.model ===
        "string"
          ? body.model
          : "Problema",

      size:
        typeof body.size ===
        "string"
          ? body.size
          : "Médio",

      icon:
        typeof body.icon ===
        "string"
          ? body.icon
          : "❕",

      showDates:
        Boolean(
          body.showDates
        ),

      backgroundColor:
        typeof body.backgroundColor ===
        "string"
          ? body.backgroundColor
          : "0xffffffff",

      textColor:
        typeof body.textColor ===
        "string"
          ? body.textColor
          : "0x20242aff",

      highlightColor:
        typeof body.highlightColor ===
        "string"
          ? body.highlightColor
          : "0xf0b90bff",

      pageCentral:
        body.pageCentral !==
        false,

      pageLogin:
        body.pageLogin !==
        false,

      pageHelpdesk:
        body.pageHelpdesk !==
        false,

      closable:
        body.closable !==
        false,
    };

    avisos.push(
      novoAviso
    );

    await saveAvisos(avisos);

    console.log(
      "Popup criado:",
      novoAviso.id,
      novoAviso.title
    );

    return jsonNoCache(
      novoAviso,
      201
    );

    });

  } catch (
    error
  ) {

    if (error instanceof SyntaxError) return jsonError("JSON inválido.", 400);
    console.error(
      "Erro no POST /api/avisos:",
      error
    );

    return jsonError(
      "Erro ao criar o aviso.",
      500
    );
  }
}

// ============================================================
// PATCH
// ============================================================

export async function PATCH(
  request: NextRequest
) {

  if (
    !checkAuth(
      request
    )
  ) {

    return jsonError(
      "Não autorizado.",
      401
    );
  }

  try {

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return jsonError("JSON inválido.", 400);

    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    const idFromUrl =
      searchParams.get(
        "id"
      );

    const id =
      Number(
        body.id ??
        idFromUrl
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return jsonError(
        "ID do aviso inválido.",
        400
      );
    }

    if (
      typeof body.active !==
      "boolean"
    ) {

      return jsonError(
        "O campo 'active' deve ser true ou false.",
        400
      );
    }

    return await enqueue(async () => {
    const avisos =
      await readAvisos();

    const index =
      avisos.findIndex(
        (
          aviso
        ) =>
          Number(
            aviso.id
          ) === id
      );

    if (
      index === -1
    ) {

      return jsonError(
        "Aviso não encontrado.",
        404
      );
    }

    avisos[index] = {
      ...avisos[index],
      active:
        body.active,
    };

    await saveAvisos(avisos);

    return jsonNoCache(
      avisos[index]
    );

    });

  } catch (
    error
  ) {

    if (error instanceof SyntaxError) return jsonError("JSON inválido.", 400);
    console.error(
      "Erro no PATCH /api/avisos:",
      error
    );

    return jsonError(
      "Erro ao atualizar o aviso.",
      500
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request: NextRequest
) {

  if (
    !checkAuth(
      request
    )
  ) {

    return jsonError(
      "Não autorizado.",
      401
    );
  }

  try {

    const {
      searchParams,
    } =
      new URL(
        request.url
      );

    let id =
      Number(
        searchParams.get(
          "id"
        )
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      try {

        const body =
          await request.json();

        id =
          Number(
            body.id
          );

      } catch {
        // ignora
      }
    }

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return jsonError(
        "ID do aviso inválido.",
        400
      );
    }

    return await enqueue(async () => {
    const avisos =
      await readAvisos();

    const aviso =
      avisos.find(
        (
          item
        ) =>
          Number(
            item.id
          ) === id
      );

    if (!aviso) {

      return jsonError(
        "Aviso não encontrado.",
        404
      );
    }

    const novosAvisos =
      avisos.filter(
        (
          item
        ) =>
          Number(
            item.id
          ) !== id
      );

    await saveAvisos(novosAvisos);

    if (
      aviso.imageUrl &&
      aviso.imageUrl.startsWith(
        "/uploads/avisos/"
      )
    ) {

      const filename =
        path.basename(
          aviso.imageUrl
        );

      const imagePath =
        path.join(
          uploadsDir,
          filename
        );

      try {

        await unlink(
          imagePath
        );

      } catch {
        // imagem já removida
      }
    }

    return jsonNoCache({
      success: true,

      message:
        "Aviso excluído permanentemente.",

      id,
    });

    });

  } catch (
    error
  ) {

    if (error instanceof SyntaxError) return jsonError("JSON inválido.", 400);
    console.error(
      "Erro no DELETE /api/avisos:",
      error
    );

    return jsonError(
      "Erro ao excluir o aviso.",
      500
    );
  }
}
