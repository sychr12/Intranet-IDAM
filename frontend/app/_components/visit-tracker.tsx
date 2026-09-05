"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    const storageKey = "idam-intranet-session";

    // ============================================================
    // GERAR ID DA SESSÃO
    // ============================================================

    const generateUUID = (): string => {
      const cryptoObject = globalThis.crypto;

      if (
        cryptoObject &&
        typeof cryptoObject.randomUUID === "function"
      ) {
        return cryptoObject.randomUUID();
      }

      if (
        cryptoObject &&
        typeof cryptoObject.getRandomValues === "function"
      ) {
        const bytes = new Uint8Array(16);

        cryptoObject.getRandomValues(bytes);

        bytes[6] =
          (bytes[6] & 0x0f) | 0x40;

        bytes[8] =
          (bytes[8] & 0x3f) | 0x80;

        const hex = Array.from(
          bytes as Uint8Array
        ).map(
          (byte: number) =>
            byte
              .toString(16)
              .padStart(2, "0")
        );

        return (
          `${hex.slice(0, 4).join("")}-` +
          `${hex.slice(4, 6).join("")}-` +
          `${hex.slice(6, 8).join("")}-` +
          `${hex.slice(8, 10).join("")}-` +
          `${hex.slice(10, 16).join("")}`
        );
      }

      // ==========================================================
      // FALLBACK
      // ==========================================================

      let timestamp = Date.now();

      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (character) => {
          const random =
            (timestamp +
              Math.random() * 16) %
              16 |
            0;

          timestamp =
            Math.floor(
              timestamp / 16
            );

          return (
            character === "x"
              ? random
              : (random & 0x3) | 0x8
          ).toString(16);
        }
      );
    };

    // ============================================================
    // RECUPERAR OU CRIAR SESSÃO
    // ============================================================

    let sessionId =
      localStorage.getItem(
        storageKey
      );

    if (!sessionId) {
      sessionId = generateUUID();

      localStorage.setItem(
        storageKey,
        sessionId
      );
    }

    // ============================================================
    // REGISTRAR VISITA
    // ============================================================

    const registerVisit = () => {
      void fetch("/api/visitas", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          sessionId,
        }),

        keepalive: true,
      }).catch(() => {
        // Não interrompe a intranet
        // caso a API esteja indisponível.
      });
    };

    // Registrar imediatamente
    registerVisit();

    // Atualizar a presença a cada 1 minuto
    const timer =
      window.setInterval(
        registerVisit,
        60_000
      );

    // ============================================================
    // LIMPEZA
    // ============================================================

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
