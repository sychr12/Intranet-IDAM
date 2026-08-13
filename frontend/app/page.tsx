"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { MiniCalendar, Notices } from "./_components/calendar-widgets";
import { DailyMessageCard } from "./_components/daily-message-card";
import { Footer } from "./_components/footer";
import {
  BannerCarousel,
  DepartmentHub,
  QuickAccess,
} from "./_components/home-dashboard";
import { Header, Sidebar } from "./_components/navigation";
import type { DepartmentKey } from "./_data/home";
import { useHolidays } from "./_hooks/use-holidays";

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

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

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex gap-3 lg:gap-4"
      >
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Conteúdo principal: atalhos, banners, áreas internas e calendário. */}
        <main className="min-w-0 flex-1 px-0 py-4 pr-3 sm:px-0 sm:pr-4 sm:py-5 xl:px-0 xl:pr-5">
          <div className="grid w-full gap-4">
            <div className="grid min-w-0 gap-4">
              <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2.3fr)_minmax(360px,1fr)]">
                <div className="grid min-w-0 content-start gap-4 xl:gap-5">
                  <QuickAccess />
                  <div className="flex min-w-0 items-center">
                    <BannerCarousel />
                  </div>
                </div>
                <div className="grid gap-4">
                  <DailyMessageCard />
                  <DepartmentHub
                    selectedDept={selectedDept}
                    setSelectedDept={setSelectedDept}
                  />
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                <MiniCalendar
                  today={now}
                  loading={false}
                  holidays={calendarHolidayState.holidays}
                  holidaysLoading={calendarHolidayState.loading}
                  onYearChange={setCalendarYear}
                />
                <div className="grid gap-4">
                  <Notices
                    today={now}
                    holidays={noticeHolidayState.holidays}
                    loading={noticeHolidayState.loading}
                    unavailable={noticeHolidayState.unavailable}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </motion.div>

      <Footer />
    </div>
  );
}
