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

export default function Page() {
  // Estados das abas, da navegação responsiva e da integração com os serviços.
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>("PJ");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [now] = useState<Date>(new Date());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const calendarHolidayState = useHolidays(calendarYear);
  const noticeHolidayState = useHolidays(now.getFullYear(), now.getFullYear() + 1);

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
                <div className="grid min-w-0 content-start gap-4 xl:grid-rows-[auto_minmax(0,1fr)] xl:content-stretch xl:gap-5">
                  <QuickAccess />
                  <div className="flex min-w-0 items-center">
                    <BannerCarousel />
                  </div>
                </div>
                <DepartmentHub
                  selectedDept={selectedDept}
                  setSelectedDept={setSelectedDept}
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <MiniCalendar
                  today={now}
                  loading={false}
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

      <Footer />
    </div>
  );
}