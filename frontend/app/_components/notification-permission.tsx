"use client";

import { useEffect, useState } from "react";

export function NotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("Notification" in window)) { setStatus("unsupported"); return; }
    setStatus(Notification.permission);
    setVisible(Notification.permission !== "granted");
  }, []);

  async function enable() {
    setError("");
    if (!("Notification" in window)) { setStatus("unsupported"); setVisible(true); setError("Este navegador não oferece notificações."); return; }
    if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      setError("Notificações do Windows exigem HTTPS ou localhost.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);
      setVisible(permission !== "granted");
      if (permission === "granted") {
        new Notification("Notificações ativadas", { body: "Você receberá avisos novos da Intranet neste computador.", icon: "/favicon.ico" });
      } else if (permission === "denied") {
        setError("O navegador bloqueou. Clique no cadeado da barra de endereço e permita Notificações.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "O navegador recusou a notificação.");
    }
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={enable}
      className="fixed bottom-4 right-4 z-[70] rounded-xl bg-[#087A42] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#056633]"
      title={status === "denied" ? "Notificações bloqueadas. Clique e permita nas configurações do navegador." : undefined}
    >
      {error || (status === "denied" ? "Notificações bloqueadas — liberar" : status === "unsupported" ? "Navegador sem notificações" : "Ativar notificações da Intranet")}
    </button>
  );
}
