"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleHeart, RefreshCcw } from "lucide-react";

export function DailyMessageCard() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  // Busca uma nova frase e troca diretamente no card, sem abrir popup.
  const loadMessage = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError("");
    try {
      const response = await fetch("/api/daily-message", { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar a mensagem. Tente novamente.");
      const data = await response.json();
      setMessage((current) => {
        // Sorteia entre as frases diferentes da atual para o botão sempre trocar a mensagem.
        const options = Array.isArray(data.messages)
          ? data.messages.filter((item: unknown) => typeof item === "string" && item !== current)
          : [];
        if (options.length) return options[Math.floor(Math.random() * options.length)];
        return typeof data.message === "string" ? data.message : "Tenha um excelente dia!";
      });
    } catch (error) { setError(error instanceof Error ? error.message : "Falha ao carregar a mensagem."); }
    finally { busy.current = false; setLoading(false); }
  }, []);

  useEffect(() => {
    void loadMessage();
  }, [loadMessage]);

  return (
    <>
      {/* =======================================================
          CARD
      ======================================================= */}

      <section
        id="mensagens"
        className="
          overflow-hidden
          rounded-[16px]
          border
          border-[#D7E1DE]
          bg-white
          flex
          h-full
          flex-col
          p-4
          shadow-[0_12px_30px_rgba(11,63,67,0.07)]
          sm:p-5
        "
      >
        <div
          className="
            mb-3
            flex
            items-center
            gap-2.5
            border-b
            border-[#D7E1DE]
            pb-3
          "
        >
          <span
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#0D675D]
              text-[#DFF2EC]
            "
          >
            <MessageCircleHeart
              className="size-4.5"
              strokeWidth={2}
            />
          </span>

          <h2
            className="
              text-[17px]
              font-black
              uppercase
              tracking-[0.03em]
              text-[#173849]
            "
          >
            Mensagem do dia
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div
            className="relative flex min-h-[152px] flex-1 items-center justify-center overflow-hidden rounded-[14px] border border-[#D7E1DE] bg-[linear-gradient(135deg,#F8FAF9_0%,#DCEEE9_100%)] p-4"
            aria-live="polite"
            aria-busy={loading}
          >
            <AnimatePresence mode="wait">
              {error && !message ? (
                <motion.p
                  key="daily-message-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[15px] leading-relaxed text-[#6F858C]"
                >
                  {error}
                </motion.p>
              ) : message ? (
                <motion.blockquote
                  key={message}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: loading ? 0.45 : 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full px-5 py-3 text-center"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-1 -top-5 font-serif text-[64px] leading-none text-[#0F897A]/45"
                  >
                    “
                  </span>
                  <p className="whitespace-pre-line text-[15px] font-semibold italic leading-relaxed text-[#173849]">
                    {message}
                  </p>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-9 -right-1 font-serif text-[64px] leading-none text-[#0F897A]/45"
                  >
                    ”
                  </span>
                </motion.blockquote>
              ) : (
                <motion.div
                  key="daily-message-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-[280px] animate-pulse space-y-2.5"
                  aria-label="Carregando a mensagem do dia"
                >
                  <span className="mx-auto block h-3.5 w-full rounded bg-white/80" />
                  <span className="mx-auto block h-3.5 w-3/4 rounded bg-white/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && message ? (
            <p className="text-center text-[13px] text-[#8A4B12]">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={() => void loadMessage()}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#14786C] px-4 text-[14px] font-bold text-white transition hover:bg-[#0D675D] disabled:cursor-wait disabled:opacity-80"
          >
            <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2} aria-hidden="true" />
            Ver outra mensagem
          </button>
        </div>
      </section>
    </>
  );
}
