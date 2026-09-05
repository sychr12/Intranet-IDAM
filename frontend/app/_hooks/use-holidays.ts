"use client";

import { useEffect, useState } from "react";
import type { Holiday } from "../_lib/holidays";

interface HolidayResponse {
  holidays: Holiday[];
}

// Carrega um ou mais anos em paralelo e cancela requisições ao trocar de período.
export function useHolidays(startYear: number, endYear = startYear) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHolidays() {
      setLoading(true);
      setUnavailable(false);
      setHolidays([]);

      try {
        const years = Array.from(
          { length: endYear - startYear + 1 },
          (_, index) => startYear + index,
        );
        // A rota interna protege o navegador de detalhes e falhas da API externa.
        const responses = await Promise.all(
          years.map(async (year) => {
            const response = await fetch(`/api/holidays?year=${year}`, {
              signal: controller.signal,
            });

            if (!response.ok) throw new Error(`Feriados indisponíveis para ${year}`);
            return (await response.json()) as HolidayResponse;
          }),
        );

        setHolidays(
          responses
            .flatMap((response) => response.holidays)
            .sort((a, b) => a.date.localeCompare(b.date)),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Erro ao carregar feriados:", error);
        setUnavailable(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHolidays();
    return () => controller.abort();
  }, [startYear, endYear]);

  return { holidays, loading, unavailable };
}
