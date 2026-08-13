"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Flame,
  X,
  ExternalLink,
  Bell,
  Building2,
} from "lucide-react";

type Aviso = {
  id: number;
  title: string;
  message: string;
  priority: "urgente" | "importante" | "normal";
  link?: string;
  author?: string;
  department?: string;
  imageUrl?: string;
  imageAlt?: string;
};

type PriorityConfig = {
  label: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  badgeText: string;
  headerGradient: string;
  shadowColor: string;
  alertIcon: React.ReactNode;
};

export function PopupAvisos() {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/avisos", { cache: "no-store" });
        const value: unknown = await response.json();

        if (!value || typeof value !== "object") return;

        const current = value as Aviso;

        if (
          typeof current.id !== "number" ||
          typeof current.title !== "string" ||
          typeof current.message !== "string"
        ) {
          return;
        }

        const lastAvisoId = localStorage.getItem("idam-last-aviso");
        const seenAvisos = JSON.parse(localStorage.getItem("idam-seen-avisos") || "[]");

        if (!seenAvisos.includes(current.id) && lastAvisoId !== String(current.id)) {
          setAviso(current);
          setIsVisible(true);
        }
      } catch {
        // A intranet continua utilizável se a API estiver indisponível.
      }
    };

    void load();

    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const close = () => {
    if (!aviso) return;

    const seenAvisos = JSON.parse(localStorage.getItem("idam-seen-avisos") || "[]");
    if (!seenAvisos.includes(aviso.id)) {
      seenAvisos.push(aviso.id);
      localStorage.setItem("idam-seen-avisos", JSON.stringify(seenAvisos));
    }

    localStorage.setItem("idam-last-aviso", String(aviso.id));
    setIsVisible(false);

    setTimeout(() => {
      setAviso(null);
    }, 300);
  };

  if (!aviso) return null;

  const priorityConfigs: Record<"urgente" | "importante" | "normal", PriorityConfig> = {
    urgente: {
      label: "URGENTE",
      icon: <Flame className="size-5" strokeWidth={2.5} />,
      borderColor: "border-red-600",
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
      borderColor: "border-amber-600",
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
      borderColor: "border-blue-600",
      bgColor: "bg-blue-50",
      badgeColor: "bg-blue-600",
      badgeText: "text-white",
      headerGradient: "from-blue-700 to-blue-800",
      shadowColor: "rgba(29,78,216,0.3)",
      alertIcon: <Info className="size-6" strokeWidth={2} />,
    },
  };

  const config = priorityConfigs[aviso.priority];

  // Função para renderizar a mensagem com a imagem no meio
  const renderMessageWithImage = () => {
    const message = aviso.message;
    const imageUrl = aviso.imageUrl;
    const imageAlt = aviso.imageAlt || aviso.title || "Imagem do aviso";

    if (!imageUrl) {
      return (
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {message}
        </p>
      );
    }

    // Procura por marcadores especiais
    const imageMarker = /\[IMAGEM\]|\[FOTO\]|\[IMAGE\]/i;
    const match = message.match(imageMarker);

    if (match) {
      const parts = message.split(imageMarker);
      const before = parts[0]?.trim() || "";
      const after = parts[1]?.trim() || "";

      return (
        <>
          {before && (
            <span className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
              {before}
            </span>
          )}
          
          <div className="my-4 overflow-hidden rounded-lg border-2 border-gray-200 shadow-md">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-auto object-cover max-h-80"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {aviso.imageAlt && (
              <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
                {aviso.imageAlt}
              </div>
            )}
          </div>
          
          {after && (
            <span className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
              {after}
            </span>
          )}
        </>
      );
    }

    // Sem marcador: insere a imagem no meio do texto automaticamente
    const words = message.split(" ");
    const midPoint = Math.floor(words.length / 2);
    const before = words.slice(0, midPoint).join(" ");
    const after = words.slice(midPoint).join(" ");

    return (
      <>
        <span className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {before}
        </span>
        
        <div className="my-4 overflow-hidden rounded-lg border-2 border-gray-200 shadow-md">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-auto object-cover max-h-80"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {aviso.imageAlt && (
            <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
              {aviso.imageAlt}
            </div>
          )}
        </div>
        
        <span className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {after}
        </span>
      </>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aviso-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 bg-white shadow-2xl"
            style={{
              borderColor: config.borderColor.replace("border-", ""),
              boxShadow: `0 30px 80px -12px ${config.shadowColor}`,
            }}
          >
            {/* CABEÇALHO CORPORATIVO - MAIOR */}
            <div
              className={`bg-gradient-to-r ${config.headerGradient} px-8 py-5 flex items-center justify-between`}
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Building2 className="size-6" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-4">
                  <h2
                    id="aviso-title"
                    className="text-xl font-bold uppercase tracking-wide text-white"
                  >
                    {aviso.title}
                  </h2>
                  <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-bold uppercase tracking-wider ${config.badgeColor} ${config.badgeText}`}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fechar aviso"
              >
                <X className="size-6" strokeWidth={2} />
              </button>
            </div>

            {/* CONTEÚDO CORPORATIVO - MAIOR */}
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              <div className={`rounded-xl ${config.bgColor} p-6 border-l-4`}
                style={{ borderLeftColor: config.borderColor.replace("border-", "") }}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-2xl text-gray-600 shrink-0">
                    {config.alertIcon}
                  </span>
                  <div className="flex-1 text-base">
                    {renderMessageWithImage()}
                  </div>
                </div>
              </div>

              {/* METADADOS CORPORATIVOS - MAIOR */}
              {(aviso.author || aviso.department) && (
                <div className="mt-5 flex items-center gap-6 text-sm text-gray-500">
                  {aviso.author && (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">Por:</span>
                      {aviso.author}
                    </span>
                  )}
                  {aviso.department && (
                    <span className="flex items-center gap-2">
                      <span className="font-medium">Setor:</span>
                      {aviso.department}
                    </span>
                  )}
                </div>
              )}

              {/* BOTÕES DE AÇÃO CORPORATIVOS - MAIORES */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Fechar
                </button>

                {aviso.link && (
                  <a
                    href={aviso.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={close}
                    className={`inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r ${config.headerGradient} px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg`}
                  >
                    Ver comunicado
                    <ExternalLink className="size-4.5" strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>

            {/* BARRA DE INDICADOR DE PRIORIDADE - MAIOR */}
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: config.borderColor.replace("border-", "") }}
            />
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}