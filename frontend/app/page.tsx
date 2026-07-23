"use client";

import { useEffect, useState } from "react";
import { MiniCalendar, Notices } from "./_components/calendar-widgets";
import { Footer } from "./_components/footer";
import {
  BannerCarousel,
  DepartmentHub,
  QuickAccess,
} from "./_components/home-dashboard";
import { Header, Sidebar } from "./_components/navigation";
import type { DepartmentKey } from "./_data/home";
import { useHolidays } from "./_hooks/use-holidays";

interface BackendHealthResponse {
  success: boolean;
  data?: {
    status?: string;
    timestamp?: string;
  };
}

export default function Page() {
  // Estados das abas, da navegação responsiva e da integração com os serviços.
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>("PJ");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [loadingDate, setLoadingDate] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const calendarHolidayState = useHolidays(calendarYear);
  const noticeHolidayState = useHolidays(now.getFullYear(), now.getFullYear() + 1);

  // Usa a data do servidor quando disponível e mantém a interface funcional offline.
  useEffect(() => {
    async function fetchBackendHealth() {
      setLoadingDate(true);

      try {
        const response = await fetch("/backend-api/health", { cache: "no-store" });
        if (!response.ok) throw new Error("Backend indisponível");

        const health: BackendHealthResponse = await response.json();
        const serverDate = new Date(health.data?.timestamp ?? "");

        if (!Number.isNaN(serverDate.getTime())) setNow(serverDate);
        setBackendOnline(health.success && health.data?.status === "UP");
      } catch (error) {
        console.error("Erro ao consultar o backend:", error);
        setBackendOnline(false);
      } finally {
        setLoadingDate(false);
      }
    }

    fetchBackendHealth();
  }, []);

  // Bloqueia a rolagem de fundo enquanto a gaveta móvel estiver aberta.
  useEffect(() => {
    if (!sidebarOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#111d16]">
      <Header
        onToggleMenu={() => {
          if (window.matchMedia("(min-width: 1024px)").matches) {
            setSidebarCollapsed((current) => !current);
          } else {
            setSidebarOpen(true);
          }
        }}
      />

      <button
        onClick={() => setSidebarOpen(false)}
        aria-label="Fechar menu"
        className={`fixed inset-0 z-[60] bg-[#001b10]/55 backdrop-blur-[2px] transition-opacity lg:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Conteúdo principal: atalhos, banners, áreas internas e calendário. */}
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5 xl:px-6">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 gap-4">
            <div className="grid min-w-0 gap-4">
              <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,2.35fr)_minmax(280px,0.95fr)]">
                <div className="grid min-w-0 content-start gap-4">
                  <QuickAccess />
                  <BannerCarousel />
                </div>
                <DepartmentHub
                  selectedDept={selectedDept}
                  setSelectedDept={setSelectedDept}
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <MiniCalendar
                  today={now}
                  loading={loadingDate}
                  holidays={calendarHolidayState.holidays}
                  holidaysLoading={calendarHolidayState.loading}
                  onYearChange={setCalendarYear}
                />
                <Notices
                  today={now}
                  holidays={noticeHolidayState.holidays}
                  loading={noticeHolidayState.loading}
                  unavailable={noticeHolidayState.unavailable}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer backendOnline={backendOnline} />
    </div>
  );
}
