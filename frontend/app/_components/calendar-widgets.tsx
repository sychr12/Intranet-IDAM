"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { NEWS_URL, months, weekdays } from "../_data/home";
import {
  holidayScopeLabels,
  parseHolidayDate,
  toHolidayDateKey,
  type Holiday,
} from "../_lib/holidays";
import { ShellCard } from "./shell-card";

interface MiniCalendarProps {
  today: Date;
  loading: boolean;
  holidays: Holiday[];
  holidaysLoading: boolean;
  onYearChange: (year: number) => void;
}

// Curva de easing reutilizada — tipada como tupla para o TS aceitar em `Variants`.
const easeOut = [0.22, 1, 0.36, 1] as const;

// Entrada suave do card inteiro ao montar.
const cardEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

// Slide + fade do mês inteiro, parametrizado pela direção da navegação.
// IMPORTANTE: o pai precisa animar por "label" (initial="hidden" animate="show"),
// não por objeto solto — só assim os filhos com `variants` herdam a animação.
const dayGridVariants: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 24 : -24, scale: 0.985 }),
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.24, ease: easeOut, staggerChildren: 0.008 },
  },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -24 : 24, scale: 0.985 }),
};

const dayCellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.18 } },
};

// Calendário mensal com navegação, marcação do dia atual e feriados locais.
export function MiniCalendar({
  today,
  loading,
  holidays,
  holidaysLoading,
  onYearChange,
}: MiniCalendarProps) {
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCursor(currentMonth);
    onYearChange(currentMonth.getFullYear());
  }, [today, onYearChange]);

  const updateCursor = (date: Date, dir = 0) => {
    setDirection(dir);
    setCursor(date);
    onYearChange(date.getFullYear());
  };

  // Mantém seis semanas fixas para evitar mudanças de altura entre os meses.
  const calendarDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const calendarStart = new Date(year, month, 1 - firstDayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);

      return {
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
      };
    });
  }, [cursor]);

  const holidaysByDate = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.date, holiday])),
    [holidays],
  );

  const isToday = (date: Date) =>
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear();

  const isViewingCurrentMonth =
    today.getMonth() === cursor.getMonth() &&
    today.getFullYear() === cursor.getFullYear();

  return (
    <motion.div variants={cardEntranceVariants} initial="hidden" animate="show">
      <ShellCard className="min-h-[252px] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[17px] font-black text-[#0b3a22]">
            <motion.span
              className="flex size-9 items-center justify-center rounded-[10px] bg-[#e8f5d8] text-[#0b6a20]"
              whileHover={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.5 }}
            >
              <CalendarDays className="size-5.5" />
            </motion.span>
            Calendário
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileHover={!isViewingCurrentMonth ? { scale: 1.03 } : undefined}
              whileTap={!isViewingCurrentMonth ? { scale: 0.96 } : undefined}
              onClick={() =>
                updateCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              }
              disabled={isViewingCurrentMonth}
              className="h-12 rounded-[10px] border border-[#dce6d8] px-4 text-[17px] font-bold text-[#47722b] transition hover:bg-[#edf7df] disabled:cursor-default disabled:bg-[#f2f6ee] disabled:text-[#9aa895]"
            >
              Hoje
            </motion.button>
            <div className="flex h-12 items-center overflow-hidden rounded-[11px] border border-[#dce6d8] bg-[#f8faf6] text-[17px] font-bold text-[#121d16] shadow-[0_3px_10px_rgba(11,52,36,0.05)]">
              <motion.button
                whileHover={{ backgroundColor: "#eaf5de" }}
                whileTap={{ scale: 0.88 }}
                className="flex size-12 items-center justify-center border-r border-[#e2e9de]"
                onClick={() =>
                  updateCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                    -1,
                  )
                }
                aria-label="Mês anterior"
              >
                <motion.span
                  initial={false}
                  whileHover={{ x: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex"
                >
                  <ChevronLeft className="size-5" />
                </motion.span>
              </motion.button>
              <span className="relative min-w-[166px] overflow-hidden px-3 text-center sm:min-w-[188px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.span
                    key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction >= 0 ? 14 : -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction >= 0 ? -14 : 14 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    {months[cursor.getMonth()]} de {cursor.getFullYear()}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.button
                whileHover={{ backgroundColor: "#eaf5de" }}
                whileTap={{ scale: 0.88 }}
                className="flex size-12 items-center justify-center border-l border-[#e2e9de]"
                onClick={() =>
                  updateCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                    1,
                  )
                }
                aria-label="Próximo mês"
              >
                <motion.span
                  initial={false}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex"
                >
                  <ChevronRight className="size-5" />
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[#e2e9de] bg-[#fbfcfa]">
          <div className="grid grid-cols-7 bg-[#f1f6ed] px-2 py-2 text-center">
            {weekdays.map((day, index) => (
              <span
                key={day}
                className={`text-[17px] font-black ${index > 4 ? "text-[#6d8e4d]" : "text-[#456452]"}`}
              >
                {day}
              </span>
            ))}
          </div>
          {loading ? (
            <div
              className="grid grid-cols-7 gap-x-1 gap-y-1.5 px-2 py-2.5"
              aria-label="Carregando calendário"
            >
              {Array.from({ length: 42 }, (_, index) => (
                <motion.span
                  key={index}
                  className="mx-auto size-9 rounded-full bg-[#eef2eb] sm:size-10"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (index % 7) * 0.04,
                  }}
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
                custom={direction}
                variants={dayGridVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid grid-cols-7 gap-x-1 gap-y-1.5 px-2 py-2.5 text-center"
              >
                {calendarDays.map(({ date, day, isCurrentMonth }, index) => {
                  const holiday = holidaysByDate.get(toHolidayDateKey(date));
                  const todayDate = isToday(date);
                  const rowIndex = Math.floor(index / 7);
                  const tooltipBelow = rowIndex < 5;
                  const colIndex = index % 7;
                  const tooltipAlign =
                    colIndex === 0 ? "left" : colIndex === 6 ? "right" : "center";

                  return (
                    <motion.time
                      key={date.toISOString()}
                      variants={dayCellVariants}
                      whileHover={holiday || isCurrentMonth ? { scale: 1.1 } : undefined}
                      whileTap={holiday || isCurrentMonth ? { scale: 0.94 } : undefined}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      dateTime={toHolidayDateKey(date)}
                      tabIndex={holiday ? 0 : undefined}
                      aria-label={
                        holiday
                          ? `${holiday.name} - ${holidayScopeLabels[holiday.scope]}`
                          : undefined
                      }
                      className={`group relative z-0 mx-auto flex size-9 items-center justify-center rounded-full text-[17px] outline-none hover:z-30 focus-visible:z-30 sm:size-10 ${
                        todayDate
                          ? "bg-[#0c711f] font-black text-white ring-4 ring-[#dff0cf] shadow-[0_5px_12px_rgba(12,113,31,0.24)]"
                          : holiday && isCurrentMonth
                            ? "bg-[#fff5cf] font-black text-[#6c5100] ring-1 ring-[#e7c963] hover:bg-[#ffedaa]"
                            : isCurrentMonth
                              ? index % 7 > 4
                                ? "text-[#466b31] hover:bg-[#eaf5de]"
                                : "text-[#1b2a20] hover:bg-[#eaf5de]"
                              : "text-[#b8c1b8]"
                      }`}
                    >
                      {todayDate && (
                        <motion.span
                          className="absolute inset-0 rounded-full ring-4 ring-[#dff0cf]"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">{day}</span>
                      {holiday && (
                        <>
                          <span
                            className={`absolute bottom-0.5 size-1 rounded-full ${todayDate ? "bg-white" : "bg-[#d09900]"}`}
                            aria-hidden="true"
                          />
                          <span
                            role="tooltip"
                            className={`pointer-events-none absolute z-20 w-max max-w-[180px] rounded-[8px] bg-[#0b3a22] px-2.5 py-1.5 text-center text-[13px] font-semibold leading-snug text-white opacity-0 shadow-[0_6px_16px_rgba(11,58,34,0.35)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                              tooltipBelow ? "top-full mt-2" : "bottom-full mb-2"
                            } ${
                              tooltipAlign === "center"
                                ? "left-1/2 -translate-x-1/2"
                                : tooltipAlign === "left"
                                  ? "left-0"
                                  : "right-0"
                            }`}
                          >
                            {holiday.name}
                            <span className="block text-[11px] font-normal text-[#cfe4c9]">
                              {holidayScopeLabels[holiday.scope]}
                            </span>
                            <span
                              className={`absolute border-4 border-transparent ${
                                tooltipBelow
                                  ? "bottom-full border-b-[#0b3a22]"
                                  : "top-full border-t-[#0b3a22]"
                              } ${
                                tooltipAlign === "center"
                                  ? "left-1/2 -translate-x-1/2"
                                  : tooltipAlign === "left"
                                    ? "left-4"
                                    : "right-4"
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                        </>
                      )}
                    </motion.time>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[17px] font-semibold text-[#647067]">
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-[#0c711f]" /> Hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-[#e0b226] ring-2 ring-[#fff2bd]" />
            Feriado
          </span>
          <AnimatePresence>
            {holidaysLoading && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="ml-auto text-[#79906f]"
              >
                Atualizando feriados...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </ShellCard>
    </motion.div>
  );
}

interface NoticesProps {
  today: Date;
  holidays: Holiday[];
  loading: boolean;
  unavailable: boolean;
}

// Resumo do próximo feriado, da próxima data comemorativa e acesso às notícias institucionais.
export function Notices({ today, holidays, loading, unavailable }: NoticesProps) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isUpcoming = (holiday: Holiday) =>
    parseHolidayDate(holiday.date).getTime() >= todayStart.getTime();

  const nextHoliday = holidays.find((holiday) => holiday.isDayOff && isUpcoming(holiday));
  const nextCommemorative = holidays.find(
    (holiday) => holiday.scope === "commemorative" && isUpcoming(holiday),
  );

  const daysUntil = (holiday: Holiday) =>
    Math.round(
      (parseHolidayDate(holiday.date).getTime() - todayStart.getTime()) / 86400000,
    );

  const dateLabel = (holiday: Holiday) =>
    parseHolidayDate(holiday.date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  return (
    <ShellCard className="flex min-h-[236px] flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-[#e7ece4] pb-3">
        <h2 className="text-[17px] font-black text-[#0a2d1e]">Avisos</h2>
      </div>

      {loading ? (
        <div className="flex-1 space-y-4">
          <div className="animate-pulse space-y-2" aria-label="Carregando avisos">
            <span className="block h-4 w-36 rounded bg-[#e8ede5]" />
            <span className="block h-3 w-48 max-w-full rounded bg-[#eef2eb]" />
          </div>
          <div className="animate-pulse space-y-2">
            <span className="block h-4 w-36 rounded bg-[#e8ede5]" />
            <span className="block h-3 w-48 max-w-full rounded bg-[#eef2eb]" />
          </div>
        </div>
      ) : nextHoliday || nextCommemorative ? (
        <div className="flex-1 divide-y divide-[#eef1ea]">
          {nextHoliday && (
            <div className="flex items-center gap-4 py-3 first:pt-0">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-[#fff5cf] text-[#9b7000]">
                <CalendarDays className="size-7" />
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#fff4c9] px-2.5 py-1 text-[13px] font-bold uppercase text-[#806000]">
                    Feriado
                  </span>
                  <span className="text-[13px] font-bold uppercase text-[#8a6800]">
                    {daysUntil(nextHoliday) === 0
                      ? "Hoje"
                      : daysUntil(nextHoliday) === 1
                        ? "Amanhã"
                        : `Faltam ${daysUntil(nextHoliday)} dias`}
                  </span>
                </div>
                <h3 className="mb-0.5 text-[17px] font-black leading-tight text-[#153924]">
                  {nextHoliday.name}
                </h3>
                <p className="text-[17px] capitalize leading-relaxed text-[#617067]">
                  {dateLabel(nextHoliday)}
                </p>
              </div>
            </div>
          )}

          {nextCommemorative && (
            <div className="flex items-center gap-4 py-3 last:pb-0">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-[#e8f5d8] text-[#3f6b12]">
                <CalendarDays className="size-7" />
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#edf7df] px-2.5 py-1 text-[13px] font-bold uppercase text-[#4a7509]">
                    Data comemorativa
                  </span>
                  <span className="text-[13px] font-bold uppercase text-[#5f8317]">
                    {daysUntil(nextCommemorative) === 0
                      ? "Hoje"
                      : daysUntil(nextCommemorative) === 1
                        ? "Amanhã"
                        : `Faltam ${daysUntil(nextCommemorative)} dias`}
                  </span>
                </div>
                <h3 className="mb-0.5 text-[17px] font-black leading-tight text-[#153924]">
                  {nextCommemorative.name}
                </h3>
                <p className="text-[17px] capitalize leading-relaxed text-[#617067]">
                  {dateLabel(nextCommemorative)}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center">
          <div className="min-w-0">
            <h3 className="mb-1 text-[17px] font-bold text-[#153924]">
              Calendário atualizado
            </h3>
            <p className="text-[17px] leading-relaxed text-[#617067]">
              {unavailable
                ? "Não foi possível consultar os feriados agora."
                : "Não há feriado ou data comemorativa cadastrada neste período."}
            </p>
          </div>
        </div>
      )}

      <motion.a
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        href={NEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-[54px] items-center justify-center gap-2 self-start rounded-[10px] bg-[linear-gradient(135deg,#78b313,#559806)] px-6 py-3 text-[17px] font-black text-white shadow-[0_8px_16px_rgba(82,145,6,0.2)] transition-shadow hover:brightness-105"
      >
        Ver comunicados
        <ChevronRight className="size-5" />
      </motion.a>
    </ShellCard>
  );
}