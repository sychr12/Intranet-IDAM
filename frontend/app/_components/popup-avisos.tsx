/* eslint-disable @next/next/no-img-element -- Uploaded media is served directly without Next image optimization. */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { parseAvisoDate, safeLink } from "../_lib/aviso-contract";
import { useModalFocus } from "../_hooks/use-modal-focus";
import { createPortal } from "react-dom";
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
  CheckCircle,
} from "lucide-react";

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

const POLL_INTERVAL_MS = 10000;
const AVISOS_ENDPOINT = "/api/avisos?public=true";

function enviarNotificacao(aviso: Pick<Aviso, "id" | "title" | "message">) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const notification = new Notification(aviso.title || "Novo aviso da Intranet", {
      body: aviso.message || "Você recebeu uma nova comunicação.",
      tag: `intranet-aviso-${aviso.id}`,
      icon: "/favicon.ico",
      requireInteraction: true,
    });
    notification.onclick = () => { window.focus(); notification.close(); };
  } catch (error) {
    console.error("Não foi possível enviar a notificação do Windows:", error);
  }
}

// ============================================================
// TIPOS
// ============================================================

type Priority = "urgente" | "importante" | "normal";

type Aviso = {
  id: number;
  title: string;
  message: string;
  priority: Priority;
  criticality?: string;
  imageUrl?: string;
  imageMimeType?: string;
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

function priorityForAviso(aviso: Aviso): Priority {
  const criticality = (aviso.criticality || "").toLowerCase();
  if (["crítica", "critica", "critical"].includes(criticality)) return "urgente";
  if (["alta", "high", "moderada", "moderate"].includes(criticality)) return "importante";
  if (["baixa", "low", "informativa", "informative"].includes(criticality)) return "normal";
  return aviso.priority;
}

function configForAviso(aviso: Aviso): PriorityConfig {
  const criticality = (aviso.criticality || "").toLowerCase();
  const base = PRIORITY_CONFIGS[priorityForAviso(aviso)];
  if (["baixa", "low"].includes(criticality)) {
    return { ...base, bgLight: "bg-emerald-50/80", borderColor: "border-emerald-600", headerBg: "bg-emerald-700", shadowColor: "rgba(22,112,71,0.15)", dotColor: "bg-emerald-600", badgeBg: "bg-emerald-600", hoverBg: "hover:bg-emerald-50" };
  }
  if (["moderada", "moderate"].includes(criticality)) {
    return { ...base, bgLight: "bg-amber-50/80", borderColor: "border-amber-600", headerBg: "bg-amber-700", shadowColor: "rgba(148,98,0,0.15)", dotColor: "bg-amber-700", badgeBg: "bg-amber-700", hoverBg: "hover:bg-amber-50" };
  }
  if (["alta", "high"].includes(criticality)) {
    return { ...base, bgLight: "bg-orange-50/80", borderColor: "border-orange-600", headerBg: "bg-orange-700", shadowColor: "rgba(180,83,9,0.15)", dotColor: "bg-orange-600", badgeBg: "bg-orange-600", hoverBg: "hover:bg-orange-50" };
  }
  return base;
}

function textoCriticidade(value?: string): string {
  const normalizado = (value || "informativa").toLowerCase();
  const labels: Record<string, string> = {
    informative: "Informativa", informativa: "Informativa", low: "Baixa", baixa: "Baixa",
    moderate: "Moderada", moderada: "Moderada", high: "Alta", alta: "Alta",
    critical: "Crítica", critica: "Crítica", "crítica": "Crítica",
  };
  return labels[normalizado] || "Informativa";
}

function textoPrioridade(value: Priority): string {
  return value === "urgente" ? "Urgente" : value === "importante" ? "Alta" : "Normal";
}

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

const parseDate = parseAvisoDate;

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
  imageMimeType,
  imageAlt,
  caption,
}: {
  imageUrl: string;
  imageMimeType?: string;
  imageAlt: string;
  caption?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return <p className="text-sm text-gray-500">Não foi possível carregar o anexo.</p>;
  const mediaType = imageUrl.toLowerCase();
  const mime = (imageMimeType || "").toLowerCase();
  if (mime === "application/pdf" || imageUrl.startsWith("data:application/pdf") || mediaType.includes(".pdf")) return <iframe title={imageAlt} src={imageUrl} className="h-[60vh] min-h-80 w-full rounded border-0" />;
  if (mime.startsWith("video/") || /\.(mp4|webm|ogv|mov)(\?|$)/i.test(mediaType) || imageUrl.startsWith("data:video/")) return <video className="max-h-[60vh] w-full rounded bg-black" controls playsInline preload="metadata" onError={() => setHasError(true)}><source src={imageUrl} type={imageMimeType} /></video>;
  if (mime.startsWith("audio/") || /\.(mp3|ogg|wav)(\?|$)/i.test(mediaType) || imageUrl.startsWith("data:audio/")) return <audio className="w-full" controls preload="metadata" onError={() => setHasError(true)}><source src={imageUrl} type={imageMimeType} /></audio>;

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
  const notificacoesInicializadasRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
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
        // Mesmo sem avisos, a página já foi sincronizada. Assim, o próximo
        // aviso criado será reconhecido como novo e disparará a notificação.
        notificacoesInicializadasRef.current = true;
        return;
      }

      const idsAnteriores = avisosRef.current.map((item) => item.id);
      const idsNovos = avisosOrdenados.map((item) => item.id);
      const listaMudou =
        idsAnteriores.length !== idsNovos.length ||
        idsAnteriores.some((id, index) => id !== idsNovos[index]);

      setAvisos(avisosOrdenados);

      // O primeiro carregamento apenas sincroniza os avisos existentes. Depois
      // disso, cada aviso novo também gera uma notificação nativa do Windows
      // pelo Chrome/Edge, desde que o usuário tenha concedido permissão.
      if (notificacoesInicializadasRef.current) {
        const idsAnterioresSet = new Set(idsAnteriores);
        const novos = avisosOrdenados.filter((item) => !idsAnterioresSet.has(item.id));
        novos.forEach(enviarNotificacao);
      }
      notificacoesInicializadasRef.current = true;

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

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "default") return;
    const solicitar = () => { void Notification.requestPermission(); };
    window.addEventListener("pointerdown", solicitar, { once: true });
    return () => window.removeEventListener("pointerdown", solicitar);
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

    const handleKeyDown = (event: KeyboardEvent) => {

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
  }, [isVisible, handleClose, irParaAnterior, irParaProximo]);

  useModalFocus(isVisible && avisos.length > 0, dialogRef, handleClose);

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
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
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
            imageMimeType={aviso.imageMimeType}
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
          imageMimeType={aviso.imageMimeType}
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

  const config = configForAviso(aviso);
  const isClosable = aviso.closable !== false;

  // ==========================================================
  // POPUP
  // ==========================================================

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          ref={dialogRef}
          tabIndex={-1}
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
            className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
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
                        {textoCriticidade(aviso.criticality)} - {textoPrioridade(aviso.priority)}
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
                    onClick={handleClose}
                    className="popup-close shrink-0 rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
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

                    {safeLink(aviso.link) && (
                      <a
                        href={safeLink(aviso.link)}
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
    </AnimatePresence>, document.body
  );
}
