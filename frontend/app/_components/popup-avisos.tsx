"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  Flame,
  X,
  Building2,
} from "lucide-react";

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

const POLL_INTERVAL_MS = 10000;

const AVISOS_ENDPOINT = "/api/avisos?public=true";

// ============================================================
// TIPOS
// ============================================================

type Priority =
  | "urgente"
  | "importante"
  | "normal";

/**
 * Reflete apenas os campos que a Central de Avisos envia hoje.
 * Se novos campos (cores, ícone, tamanho, páginas etc.) voltarem
 * a ser suportados no formulário de envio, adicione-os aqui também.
 */
type Aviso = {
  id: number;
  title: string;
  message: string;
  priority: Priority;

  imageUrl?: string;
  imageAlt?: string;

  publishedDate?: string;
  expirationDate?: string;

  createdAt?: string;

  active?: boolean;

  closable?: boolean;
};

type PriorityConfig = {
  label: string;
  icon: ReactNode;
  bgColor: string;
  badgeColor: string;
  badgeText: string;
  headerGradient: string;
  shadowColor: string;
  alertIcon: ReactNode;
};

// ============================================================
// CONFIGURAÇÕES DE PRIORIDADE
//
// Fora do componente: são estáticas e não precisam ser
// recriadas (nem seus elementos JSX) a cada renderização.
// ============================================================

const PRIORITY_CONFIGS: Record<Priority, PriorityConfig> = {
  urgente: {
    label: "URGENTE",
    icon: <Flame className="size-5" strokeWidth={2.5} />,
    bgColor: "bg-red-50",
    badgeColor: "bg-red-600",
    badgeText: "text-white",
    headerGradient: "from-red-700 to-red-800",
    shadowColor: "rgba(185,28,28,0.3)",
    alertIcon: <AlertTriangle className="size-6" strokeWidth={2} />,
  },

  importante: {
    label: "IMPORTANTE",
    icon: <AlertCircle className="size-5" strokeWidth={2.5} />,
    bgColor: "bg-amber-50",
    badgeColor: "bg-amber-600",
    badgeText: "text-white",
    headerGradient: "from-amber-700 to-amber-800",
    shadowColor: "rgba(180,83,9,0.3)",
    alertIcon: <AlertCircle className="size-6" strokeWidth={2} />,
  },

  normal: {
    label: "INFORMATIVO",
    icon: <Info className="size-5" strokeWidth={2.5} />,
    bgColor: "bg-blue-50",
    badgeColor: "bg-blue-600",
    badgeText: "text-white",
    headerGradient: "from-blue-700 to-blue-800",
    shadowColor: "rgba(29,78,216,0.3)",
    alertIcon: <Info className="size-6" strokeWidth={2} />,
  },
};

// ============================================================
// VALIDAR AVISO
// ============================================================

function isAviso(value: unknown): value is Aviso {
  if (!value || typeof value !== "object") {
    return false;
  }

  const aviso = value as Record<string, unknown>;

  return (
    typeof aviso.id === "number" &&
    typeof aviso.title === "string" &&
    typeof aviso.message === "string" &&
    (aviso.priority === "urgente" ||
      aviso.priority === "importante" ||
      aviso.priority === "normal")
  );
}

// ============================================================
// PARSE DE DATA
// ============================================================

function parseDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const texto = value.trim();

  if (!texto) {
    return null;
  }

  // YYYY-MM-DD
  const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/;

  const matchData = texto.match(somenteData);

  if (matchData) {
    const ano = Number(matchData[1]);
    const mes = Number(matchData[2]);
    const dia = Number(matchData[3]);

    const date = new Date(ano, mes - 1, dia, 0, 0, 0, 0);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  // YYYY-MM-DDTHH:mm
  // YYYY-MM-DDTHH:mm:ss
  const dataHoraLocal =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

  const matchDataHora = texto.match(dataHoraLocal);

  if (matchDataHora) {
    const ano = Number(matchDataHora[1]);
    const mes = Number(matchDataHora[2]);
    const dia = Number(matchDataHora[3]);
    const hora = Number(matchDataHora[4]);
    const minuto = Number(matchDataHora[5]);
    const segundo = Number(matchDataHora[6] || "0");

    const milissegundo = Number(
      (matchDataHora[7] || "0").padEnd(3, "0")
    );

    const date = new Date(
      ano,
      mes - 1,
      dia,
      hora,
      minuto,
      segundo,
      milissegundo
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Datas com timezone
  const date = new Date(texto);

  return Number.isNaN(date.getTime()) ? null : date;
}

// ============================================================
// EXPIRAÇÃO / PUBLICAÇÃO
// ============================================================

function isAvisoExpirado(aviso: Aviso): boolean {
  const expiration = parseDate(aviso.expirationDate);

  if (!expiration) {
    return false;
  }

  return Date.now() >= expiration.getTime();
}

function isAvisoNaoPublicado(aviso: Aviso): boolean {
  const published = parseDate(aviso.publishedDate);

  if (!published) {
    return false;
  }

  return Date.now() < published.getTime();
}

// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(value?: string): string {
  if (!value) {
    return "";
  }

  const texto = value.trim();

  if (!texto) {
    return "";
  }

  const somenteData = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (somenteData) {
    return `${somenteData[3]}/${somenteData[2]}/${somenteData[1]}`;
  }

  const dataHora = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );

  if (dataHora) {
    return `${dataHora[3]}/${dataHora[2]}/${dataHora[1]} ${dataHora[4]}:${dataHora[5]}`;
  }

  const date = new Date(texto);

  if (Number.isNaN(date.getTime())) {
    return texto;
  }

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// BLOCO DE IMAGEM (evita duplicar o mesmo JSX duas vezes)
// ============================================================

function AvisoImage({
  imageUrl,
  imageAlt,
  caption,
}: {
  imageUrl: string;
  imageAlt: string;
  caption?: string;
}) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-md">
      <img
        src={imageUrl}
        alt={imageAlt}
        className="h-auto max-h-80 w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      {caption && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
          {caption}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE
// ============================================================

export function PopupAvisos() {
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const avisoAtualIdRef = useRef<number | null>(null);

  const avisoFechadoIdRef = useRef<number | null>(null);

  const buscandoRef = useRef(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // ==========================================================
  // CARREGAR AVISO
  // ==========================================================

  const carregarAviso = useCallback(async () => {
    if (buscandoRef.current) {
      return;
    }

    buscandoRef.current = true;

    try {
      /*
       * IMPORTANTE:
       *
       * A rota retorna ARRAY.
       *
       * Usamos ?public=true para o backend já devolver
       * somente avisos que podem aparecer.
       */

      const response = await fetch(
        `${AVISOS_ENDPOINT}&_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Erro HTTP ao buscar avisos:",
          response.status
        );

        return;
      }

      const value: unknown = await response.json();

      // ==================================================
      // A ROTA RETORNA ARRAY
      // ==================================================

      if (!Array.isArray(value)) {
        console.error(
          "A API /api/avisos não retornou um array:",
          value
        );

        setAviso(null);
        setIsVisible(false);

        return;
      }

      // ==================================================
      // FILTRAR: válidos → ativos → publicados → não expirados
      // ==================================================

      const avisosDisponiveis = value
        .filter(isAviso)
        .filter((item) => item.active !== false)
        .filter((item) => !isAvisoNaoPublicado(item))
        .filter((item) => !isAvisoExpirado(item));

      // ==================================================
      // NENHUM AVISO
      // ==================================================

      if (avisosDisponiveis.length === 0) {
        setAviso(null);
        setIsVisible(false);

        avisoAtualIdRef.current = null;

        return;
      }

      // ==================================================
      // ORDENAR — mais recente primeiro — e pegar o topo
      // ==================================================

      const novoAviso = [...avisosDisponiveis].sort((a, b) => {
        const dataA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dataB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dataB - dataA;
      })[0];

      // ==================================================
      // AVISO JÁ FOI FECHADO PELO USUÁRIO NESTA SESSÃO
      // ==================================================

      if (avisoFechadoIdRef.current === novoAviso.id) {
        setAviso(novoAviso);
        setIsVisible(false);

        avisoAtualIdRef.current = novoAviso.id;

        return;
      }

      // ==================================================
      // MESMO AVISO JÁ EXIBIDO — nada a fazer
      // ==================================================

      if (avisoAtualIdRef.current === novoAviso.id) {
        return;
      }

      // ==================================================
      // NOVO AVISO
      // ==================================================

      avisoAtualIdRef.current = novoAviso.id;

      avisoFechadoIdRef.current = null;

      setAviso(novoAviso);

      setIsVisible(true);
    } catch (error) {
      console.error("Erro ao carregar popup:", error);
    } finally {
      buscandoRef.current = false;
    }
  }, []);

  // ==========================================================
  // POLLING — pausa quando a aba não está visível, para não
  // gastar requisições e bateria em segundo plano.
  // ==========================================================

  useEffect(() => {
    let intervalId: number | undefined;

    const start = () => {
      if (intervalId !== undefined) {
        return;
      }

      void carregarAviso();

      intervalId = window.setInterval(() => {
        void carregarAviso();
      }, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalId === undefined) {
        return;
      }

      window.clearInterval(intervalId);

      intervalId = undefined;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      stop();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [carregarAviso]);

  // ==========================================================
  // FECHAR
  // ==========================================================

  const handleClose = useCallback(() => {
    if (!aviso || aviso.closable === false) {
      return;
    }

    avisoFechadoIdRef.current = aviso.id;

    setIsVisible(false);
  }, [aviso]);

  // ==========================================================
  // ESC PARA FECHAR + FOCO NO BOTÃO AO ABRIR
  // ==========================================================

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  // ==========================================================
  // MENSAGEM + IMAGEM
  // ==========================================================

  const renderMessageWithImage = () => {
    if (!aviso) {
      return null;
    }

    const { message, imageUrl } = aviso;

    const imageAlt = aviso.imageAlt || aviso.title || "Imagem do aviso";

    if (!imageUrl) {
      return (
        <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-700">
          {message}
        </p>
      );
    }

    const imageMarker = /\[IMAGEM\]|\[FOTO\]|\[IMAGE\]/i;

    if (!imageMarker.test(message)) {
      return (
        <>
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-700">
            {message}
          </p>

          <AvisoImage
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            caption={aviso.imageAlt}
          />
        </>
      );
    }

    const [before = "", ...rest] = message.split(imageMarker);

    const after = rest.join("").trim();

    return (
      <>
        {before.trim() && (
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-700">
            {before.trim()}
          </p>
        )}

        <AvisoImage
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          caption={aviso.imageAlt}
        />

        {after && (
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-700">
            {after}
          </p>
        )}
      </>
    );
  };

  // ==========================================================
  // SEM AVISO PARA MOSTRAR
  // ==========================================================

  if (!aviso || !isVisible) {
    return null;
  }

  const config = PRIORITY_CONFIGS[aviso.priority];

  const isClosable = aviso.closable !== false;

  // ==========================================================
  // POPUP
  // ==========================================================

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aviso-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && isClosable) {
              handleClose();
            }
          }}
        >
          <motion.section
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 30, scale: 0.98 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -30, scale: 0.98 }
            }
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl"
            style={{
              boxShadow: `0 30px 80px -12px ${config.shadowColor}`,
            }}
          >
            {/* CABEÇALHO */}

            <div
              className={`flex items-center justify-between bg-gradient-to-r ${config.headerGradient} px-8 py-5`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Building2 className="size-6" strokeWidth={2} />
                </div>

                <div className="flex min-w-0 items-center gap-4">
                  <h2
                    id="aviso-title"
                    className="truncate text-xl font-bold uppercase tracking-wide text-white"
                  >
                    {aviso.title}
                  </h2>

                  <span
                    className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1 text-sm font-bold uppercase tracking-wider ${config.badgeColor} ${config.badgeText}`}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                </div>
              </div>

              {isClosable && (
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleClose}
                  className="ml-4 shrink-0 rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label="Fechar aviso"
                >
                  <X className="size-6" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* CONTEÚDO */}

            <div className="max-h-[75vh] overflow-y-auto p-8">
              <div className={`rounded-xl ${config.bgColor} border-l-4 p-6`}>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 shrink-0 text-2xl text-gray-600">
                    {config.alertIcon}
                  </span>

                  <div className="min-w-0 flex-1">
                    {renderMessageWithImage()}
                  </div>
                </div>
              </div>

              {/* DATAS */}

              {(aviso.publishedDate || aviso.expirationDate) && (
                <div className="mt-5 grid gap-3 text-sm text-gray-500 sm:grid-cols-2">
                  {aviso.publishedDate && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <span className="block font-semibold text-gray-700">
                        Publicado em
                      </span>

                      <span>{formatarData(aviso.publishedDate)}</span>
                    </div>
                  )}

                  {aviso.expirationDate && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <span className="block font-semibold text-gray-700">
                        Expira em
                      </span>

                      <span>{formatarData(aviso.expirationDate)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* BOTÃO */}

              {isClosable && (
                <div className="mt-6 flex justify-end border-t border-gray-200 pt-5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>

            {/* INDICADOR */}

            <div className={`h-1.5 w-full ${config.badgeColor}`} />
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}