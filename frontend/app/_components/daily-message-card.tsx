"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleHeart, RefreshCcw, X } from "lucide-react";
import { getDailyMessage } from "../_lib/daily-message";

export function DailyMessageCard() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadMessage = () => {
    setMessage(getDailyMessage(new Date()).message);
  };

  const openPopup = () => {
    loadMessage();
    setPopupOpen(true);
  };

  return (
    <>
      <section id="mensagens" className="overflow-hidden rounded-[16px] border border-[#e3e9df] bg-white p-4 shadow-[0_12px_30px_rgba(11,52,36,0.07)] sm:p-5">
        <div className="mb-3 flex items-center gap-2.5 border-b border-[#e7ece7] pb-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0a4b2b] text-[#b6dc25]">
            <MessageCircleHeart className="size-4.5" strokeWidth={2} />
          </span>
          <h2 className="text-[17px] font-black uppercase tracking-[0.03em] text-[#0a2d1e]">
            Mensagem do dia
          </h2>
        </div>

        <p className="text-[15px] leading-relaxed text-[#173425]">
          Abra a mensagem do dia no popup e use o botão de recarregar para ver outra frase.
        </p>

        <div className="mt-4">
          <button
            onClick={openPopup}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#073821] px-4 text-[14px] font-bold text-white transition hover:bg-[#0a4b2b]"
          >
            Abrir mensagem do dia
          </button>
        </div>
      </section>

      <AnimatePresence>
        {popupOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPopupOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="daily-message-title"
              className="w-full max-w-2xl overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_22px_56px_rgba(0,0,0,0.24)]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p id="daily-message-title" className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0a2d1e]">
                    Mensagem do dia
                  </p>
                  <p className="mt-1 text-[13px] text-[#5b6f58]">
                    Clique em fechar ou recarregar para atualizar.
                  </p>
                </div>
                <button
                  onClick={() => setPopupOpen(false)}
                  aria-label="Fechar popup da mensagem do dia"
                  className="rounded-full bg-[#eef5eb] p-2 text-[#0a2d1e] transition hover:bg-[#d9ebcf]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="min-h-[120px] whitespace-pre-line rounded-[14px] border border-[#e3e8dd] bg-[#f8faf5] p-5 text-[17px] leading-relaxed text-[#173425]">
                {message || "Carregando a mensagem do dia..."}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={loadMessage}
                  className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#073821] px-4 text-[14px] font-bold text-white transition hover:bg-[#0a4b2b]"
                >
                  <RefreshCcw className="size-4" strokeWidth={2} />
                  Recarregar
                </button>
                <button
                  onClick={() => setPopupOpen(false)}
                  className="flex h-11 items-center justify-center rounded-[10px] border border-[#d9e7d0] bg-[#f6fbf5] px-4 text-[14px] font-semibold text-[#184521] transition hover:bg-[#e6f1e1]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
