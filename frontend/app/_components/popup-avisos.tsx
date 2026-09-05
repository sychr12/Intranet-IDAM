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
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Bell,
  CheckCircle,
} from "lucide-react";

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

const POLL_INTERVAL_MS = 10000;
const AVISOS_ENDPOINT = "/api/avisos?public=true";

// ============================================================
// TIPOS
// ============================================================

type Priority = "urgente" | "importante" | "normal";

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
  link?: string;
  linkText?: string;
};

type PriorityConfig = {
  label: string;
  bgLight: string;
  borderColor: string;
  headerBg: string;
  shadowColor: string;
  alertIcon: ReactNode;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  hoverBg: string;
};

// ============================================================
// CONFIGURAÇÕES DE PRIORIDADE
// ============================================================

const PRIORITY_CONFIGS: Record<Priority, PriorityConfig> = {
  urgente: {
    label: "Urgente",
    bgLight: "bg-red-50/80",
    borderColor: "border-red-500",
    headerBg: "bg-red-700",
    shadowColor: "rgba(185,28,28,0.15)",
    alertIcon: <AlertTriangle className="size-5" strokeWidth={1.75} />,
    dotColor: "bg-red-600",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    hoverBg: "hover:bg-red-50",
  },
  importante: {
    label: "Importante",
    bgLight: "bg-amber-50/80",
    borderColor: "border-amber-500",
    headerBg: "bg-amber-700",
    shadowColor: "rgba(180,83,9,0.15)",
    alertIcon: <AlertCircle className="size-5" strokeWidth={1.75} />,
    dotColor: "bg-amber-600",
    badgeBg: "bg-amber-600",
    badgeText: "text-white",
    hoverBg: "hover:bg-amber-50",
  },
  normal: {
    label: "Informativo",
    bgLight: "bg-blue-50/80",
    borderColor: "border-blue-500",
    headerBg: "bg-blue-700",
    shadowColor: "rgba(29,78,216,0.15)",
    alertIcon: <Info className="size-5" strokeWidth={1.75} />,
    dotColor: "bg-blue-600",
    badgeBg: "bg-blue-600",
    badgeText: "text-white",
    hoverBg: "hover:bg-blue-50",
  },
};

// ============================================================
// VALIDAR AVISO
// ============================================================

function isAviso(value: unknown): value is Aviso {
  if (!value || typeof value !== "object") return false;
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
  if (!value) return null;
  const texto = value.trim();
  if (!texto) return null;

  const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/;
  const matchData = texto.match(somenteData);
  if (matchData) {
    const date = new Date(
      Number(matchData[1]),
      Number(matchData[2]) - 1,
      Number(matchData[3]),
      0, 0, 0, 0
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dataHoraLocal =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
  const matchDataHora = texto.match(dataHoraLocal);
  if (matchDataHora) {
    const date = new Date(
      Number(matchDataHora[1]),
      Number(matchDataHora[2]) - 1,
      Number(matchDataHora[3]),
      Number(matchDataHora[4]),
      Number(matchDataHora[5]),
      Number(matchDataHora[6] || "0"),
      Number((matchDataHora[7] || "0").padEnd(3, "0"))
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(texto);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ============================================================
// EXPIRAÇÃO / PUBLICAÇÃO
// ============================================================

function isAvisoExpirado(aviso: Aviso): boolean {
  const expiration = parseDate(aviso.expirationDate);
  if (!expiration) return false;
  return Date.now() >= expiration.getTime();
}

function isAvisoNaoPublicado(aviso: Aviso): boolean {
  const published = parseDate(aviso.publishedDate);
  if (!published) return false;
  return Date.now() < published.getTime();
}

// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(value?: string): string {
  if (!value) return "";
  const texto = value.trim();
  if (!texto) return "";

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
  if (Number.isNaN(date.getTime())) return texto;
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
// COMPONENTE DE IMAGEM
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
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <img
        src={imageUrl}
        alt={imageAlt}
        className="h-auto max-h-80 w-full object-contain"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      {caption && (
        <div className="border-t border-gray-200 bg-gray-50/80 px-3 py-1.5 text-xs text-gray-500">
          {caption}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function PopupAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const avisosFechadosRef = useRef<Set<number>>(new Set());
  const avisosRef = useRef<Aviso[]>([]);
  const currentIndexRef = useRef(0);
  const buscandoRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    avisosRef.current = avisos;
  }, [avisos]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // ==========================================================
  // CARREGAR AVISOS
  // ==========================================================

  const carregarAviso = useCallback(async () => {
    if (buscandoRef.current) return;
    buscandoRef.current = true;

    try {
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
        console.error("Erro HTTP ao buscar avisos:", response.status);
        return;
      }

      const value: unknown = await response.json();

      if (!Array.isArray(value)) {
        console.error("A API /api/avisos não retornou um array:", value);
        setAvisos([]);
        setIsVisible(false);
        setCurrentIndex(0);
        return;
      }

      const avisosDisponiveis = value
        .filter(isAviso)
        .filter((item) => item.active !== false)
        .filter((item) => !isAvisoNaoPublicado(item))
        .filter((item) => !isAvisoExpirado(item))
        .filter((item) => !avisosFechadosRef.current.has(item.id));

      const avisosOrdenados = [...avisosDisponiveis].sort((a, b) => {
        const dataA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dataB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dataB - dataA;
      });

      if (avisosOrdenados.length === 0) {
        setAvisos([]);
        setIsVisible(false);
        setCurrentIndex(0);
        return;
      }

      const idsAnteriores = avisosRef.current.map((item) => item.id);
      const idsNovos = avisosOrdenados.map((item) => item.id);
      const listaMudou =
        idsAnteriores.length !== idsNovos.length ||
        idsAnteriores.some((id, index) => id !== idsNovos[index]);

      setAvisos(avisosOrdenados);

      if (!listaMudou) {
        return;
      }

      const idAtual = avisosRef.current[currentIndexRef.current]?.id;
      const novaPosicao = avisosOrdenados.findIndex(
        (item) => item.id === idAtual
      );

      setCurrentIndex(novaPosicao >= 0 ? novaPosicao : 0);
      setIsVisible(true);
    } catch (error) {
      console.error("Erro ao carregar popup:", error);
    } finally {
      buscandoRef.current = false;
    }
  }, []);

  // ==========================================================
  // POLLING
  // ==========================================================

  useEffect(() => {
    let intervalId: number | undefined;

    const start = () => {
      if (intervalId !== undefined) return;
      void carregarAviso();
      intervalId = window.setInterval(() => {
        void carregarAviso();
      }, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalId === undefined) return;
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [carregarAviso]);

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================

  const irParaAnterior = useCallback(() => {
    setCurrentIndex((indexAtual) => {
      if (avisosRef.current.length === 0) return indexAtual;
      return (
        (indexAtual - 1 + avisosRef.current.length) %
        avisosRef.current.length
      );
    });
  }, []);

  const irParaProximo = useCallback(() => {
    setCurrentIndex((indexAtual) => {
      if (avisosRef.current.length === 0) return indexAtual;
      return (indexAtual + 1) % avisosRef.current.length;
    });
  }, []);

  // ==========================================================
  // FECHAR
  // ==========================================================

  const fecharPopup = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    const avisoAtual = avisosRef.current[currentIndexRef.current];
    if (!avisoAtual || avisoAtual.closable === false) return;

    avisosFechadosRef.current.add(avisoAtual.id);

    setAvisos((avisosAnteriores) => {
      const restantes = avisosAnteriores.filter(
        (item) => item.id !== avisoAtual.id
      );

      if (restantes.length === 0) {
        setIsVisible(false);
        setCurrentIndex(0);
      } else {
        setCurrentIndex((indexAnterior) =>
          Math.min(indexAnterior, restantes.length - 1)
        );
      }

      return restantes;
    });
  }, []);

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  useEffect(() => {
    if (!isVisible) return;

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        fecharPopup();
        return;
      }

      if (avisosRef.current.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        irParaAnterior();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        irParaProximo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, fecharPopup, irParaAnterior, irParaProximo]);

  const aviso = avisos[currentIndex] ?? null;
  const temMultiplosAvisos = avisos.length > 1;

  // ==========================================================
  // RENDER MENSAGEM
  // ==========================================================

  const renderMessageWithImage = () => {
    if (!aviso) return null;

    const { message, imageUrl } = aviso;
    const imageAlt = aviso.imageAlt || aviso.title || "Imagem do aviso";

    // Se não tem imagem, mostra só a mensagem
    if (!imageUrl) {
      return (
        <p className="break-words text-sm leading-relaxed text-gray-700">
          {message}
        </p>
      );
    }

    const imageMarker = /\[IMAGEM\]|\[FOTO\]|\[IMAGE\]/i;

    // Se tem marcador, processa
    if (imageMarker.test(message)) {
      const [before = "", ...rest] = message.split(imageMarker);
      const after = rest.join("").trim();

      return (
        <>
          {before.trim() && (
            <p className="break-words text-sm leading-relaxed text-gray-700">
              {before.trim()}
            </p>
          )}

          <AvisoImage
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            caption={aviso.imageAlt}
          />

          {after && (
            <p className="break-words text-sm leading-relaxed text-gray-700">
              {after}
            </p>
          )}
        </>
      );
    }

    // Layout padrão: texto em cima, imagem embaixo
    return (
      <>
        <p className="break-words text-sm leading-relaxed text-gray-700">
          {message}
        </p>
        <AvisoImage
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          caption={aviso.imageAlt}
        />
      </>
    );
  };

  // ==========================================================
  // SEM AVISO
  // ==========================================================

  if (!aviso || !isVisible) return null;

  const config = PRIORITY_CONFIGS[aviso.priority];
  const isClosable = aviso.closable !== false;

  // ==========================================================
  // POPUP
  // ==========================================================

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aviso-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && isClosable) {
              fecharPopup();
            }
          }}
        >
          <motion.section
            key={aviso.id}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -20 }
            }
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
            style={{
              boxShadow: `0 20px 60px -12px ${config.shadowColor}`,
            }}
          >
            {/* TOP BAR - PRIORITY */}
            <div className={`h-1 w-full ${config.headerBg}`} />

            {/* INDICADOR DE POSIÇÃO COM SETAS */}
            {temMultiplosAvisos && (
              <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
                <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-sm ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={irParaAnterior}
                    className={`group rounded-full p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 ${config.hoverBg}`}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="size-4" strokeWidth={2.5} />
                  </button>

                  <span className="min-w-[48px] text-center text-xs font-medium text-gray-600">
                    <span className="font-bold text-gray-800">{currentIndex + 1}</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-500">{avisos.length}</span>
                  </span>

                  <button
                    type="button"
                    onClick={irParaProximo}
                    className={`group rounded-full p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 ${config.hoverBg}`}
                    aria-label="Próximo"
                  >
                    <ChevronRight className="size-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* CABEÇALHO */}
            <div className={`${config.headerBg} px-6 pb-4 pt-10`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded bg-white/10 text-white">
                    <Building2 className="size-4" strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2
                      id="aviso-title"
                      className="truncate text-base font-semibold text-white"
                    >
                      {aviso.title}
                    </h2>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded ${config.badgeBg} px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config.badgeText}`}
                      >
                        {config.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/60">
                        <CheckCircle className="size-3" strokeWidth={1.5} />
                        <span>Ativo</span>
                      </span>
                    </div>
                  </div>
                </div>

                {isClosable && (
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={fecharPopup}
                    className="shrink-0 rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Fechar"
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* CONTEÚDO */}
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div
                className={`rounded border-l-4 ${config.borderColor} ${config.bgLight} p-4`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0 text-gray-500">
                    {config.alertIcon}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    {renderMessageWithImage()}

                    {aviso.link && (
                      <a
                        href={aviso.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        {aviso.linkText || "Saiba mais"}
                        <ExternalLink className="size-3.5" strokeWidth={1.75} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* DATAS */}
              {(aviso.publishedDate || aviso.expirationDate) && (
                <div className="mt-3 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                  {aviso.publishedDate && (
                    <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5">
                      <Calendar className="size-3.5 shrink-0 text-gray-400" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          Publicado
                        </span>
                        <span className="truncate text-sm text-gray-700">
                          {formatarData(aviso.publishedDate)}
                        </span>
                      </div>
                    </div>
                  )}

                  {aviso.expirationDate && (
                    <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5">
                      <Clock className="size-3.5 shrink-0 text-gray-400" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          Expira
                        </span>
                        <span className="truncate text-sm text-gray-700">
                          {formatarData(aviso.expirationDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RODAPÉ */}
              <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-3">
                {isClosable && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>

            {/* DOTS */}
            {temMultiplosAvisos && (
              <div className="flex justify-center gap-1.5 px-6 pb-3">
                {avisos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === currentIndex
                        ? `w-5 ${config.dotColor}`
                        : "w-1.5 bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Ir para comunicado ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
