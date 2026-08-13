"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    const storageKey = "idam-intranet-session";
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(storageKey, sessionId);
    }
    const register = () => {
      void fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      });
    };
    register();
    const timer = window.setInterval(register, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
