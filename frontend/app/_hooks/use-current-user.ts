"use client";

import { useEffect, useState } from "react";

interface CurrentUser {
  authenticated: boolean;
  displayName: string | null;
  firstName: string | null;
}

const anonymousUser: CurrentUser = {
  authenticated: false,
  displayName: null,
  firstName: null,
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/me", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível identificar o usuário.");
        return (await response.json()) as CurrentUser;
      })
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setUser(anonymousUser);
      });

    return () => controller.abort();
  }, []);

  return user;
}
