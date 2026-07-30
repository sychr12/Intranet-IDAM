"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { getDailyMessage } from "../_lib/daily-message";

// Card isolado que revela a mensagem do dia sob demanda.
export function DailyMessageCard() {
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const deviceSource = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setMessage(getDailyMessage(new Date(), deviceSource).message);
  }, []);

  return (
    <section id="mensagens" className="overflow-hidden rounded-[16px] border border-[#e3e9df] bg-white p-4 shadow-[0_12px_30px_rgba(11,52,36,0.07)] sm:p-5">
      <div className="mb-3 flex items-center gap-2.5 border-b border-[#e7ece7] pb-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0a4b2b] text-[#b6dc25]">
          <MessageCircleHeart className="size-4.5" strokeWidth={2} />
        </span>
        <h2 className="text-[17px] font-black uppercase tracking-[0.03em] text-[#0a2d1e]">
          Mensagem do dia
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.p
            key="message"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-[16px] leading-relaxed text-[#173425]"
          >
            {message}
          </motion.p>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setRevealed(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#073821] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(8,48,35,0.18)] transition hover:bg-[#0a4b2b]"
          >
            <Sparkles className="size-4" strokeWidth={2} />
            Revelar mensagem do dia
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}