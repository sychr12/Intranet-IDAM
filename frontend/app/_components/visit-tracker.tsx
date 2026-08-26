"use client";

import { useEffect } from "react";

const sessionStorageKey = "idam-intranet-visit-session";

export function VisitTracker() {
  useEffect(() => {
    let sessionId = window.sessionStorage.getItem(sessionStorageKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window.sessionStorage.setItem(sessionStorageKey, sessionId);
    }

    void fetch("/api/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      keepalive: true,
    });
  }, []);

  return null;
}
