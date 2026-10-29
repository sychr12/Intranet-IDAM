"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
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

  const holidaysByDate = useMemo(() => {
    const grouped = new Map<string, Holiday[]>();
    for (const holiday of holidays) {
      const entries = grouped.get(holiday.date) ?? [];
      entries.push(holiday);
      grouped.set(holiday.date, entries);
    }
    return grouped;
  }, [holidays]);

  const isToday = (date: Date) =>
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear();

  const isViewingCurrentMonth =
    today.getMonth() === cursor.getMonth() &&
    today.getFullYear() === cursor.getFullYear();

  return (
    <motion.div id="calendar" className="h-full" variants={cardEntranceVariants} initial="hidden" animate="show">
      <ShellCard className="flex h-full min-h-[252px] flex-col p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[17px] font-black text-[#14786C]">
            <motion.span
              className="flex size-9 items-center justify-center rounded-[10px] bg-[#DFF2EC] text-[#14786C]"
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
              className="h-12 rounded-[10px] bg-[#14786C] px-4 text-[17px] font-bold text-white transition hover:bg-[#0D675D] disabled:cursor-default disabled:bg-[#F7FAF9] disabled:text-[#8A9A9E]"
            >
              Hoje
            </motion.button>
            <div className="flex h-12 items-center overflow-hidden rounded-[11px] border border-[#D7E1DE] bg-[#F8FAF9] text-[17px] font-bold text-[#173849] shadow-[0_3px_10px_rgba(11,63,67,0.05)]">
              <motion.button
                whileHover={{ backgroundColor: "#DFF2EC" }}
                whileTap={{ scale: 0.88 }}
                className="flex size-12 items-center justify-center border-r border-[#D7E1DE]"
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
                whileHover={{ backgroundColor: "#DFF2EC" }}
                whileTap={{ scale: 0.88 }}
                className="flex size-12 items-center justify-center border-l border-[#D7E1DE]"
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

        <div className="flex flex-1 flex-col justify-center">
        <div className="overflow-visible rounded-[12px] border border-[#D7E1DE] bg-[#F8FAF9]">
          <div className="grid grid-cols-7 bg-[#F7FAF9] px-2 py-2 text-center">
            {weekdays.map((day, index) => (
              <span
                key={day}
                className={`text-[17px] font-black ${index > 4 ? "text-[#6F858C]" : "text-[#365563]"}`}
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
                  className="mx-auto size-9 rounded-full bg-[#EDF1F0] sm:size-10"
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
                className="overflow-visible grid grid-cols-7 gap-x-1 gap-y-1.5 px-2 py-2.5 text-center"
              >
                {calendarDays.map(({ date, day, isCurrentMonth }, index) => {
                  const holidaysOnDate = holidaysByDate.get(toHolidayDateKey(date)) ?? [];
                  const holiday = holidaysOnDate[0];
                  const hasCommemorative = holidaysOnDate.some(
                    (item) => item.scope === "commemorative",
                  );
                  const todayDate = isToday(date);
                  const rowIndex = Math.floor(index / 7);
                  const tooltipBelow = rowIndex < 5;
                  const colIndex = index % 7;
                  const tooltipAlign = colIndex <= 1 ? "left" : colIndex >= 5 ? "right" : "center";

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
                          ? holidaysOnDate
                              .map((item) => `${item.name} - ${holidayScopeLabels[item.scope]}`)
                              .join("; ")
                          : undefined
                      }
                      className={`group relative z-0 mx-auto flex size-9 items-center justify-center rounded-full text-[17px] outline-none hover:z-30 focus-visible:z-30 sm:size-10 ${
                        todayDate
                          ? "bg-[#14786C] font-black text-white ring-4 ring-[#DFF2EC] shadow-[0_5px_12px_rgba(20,120,108,0.24)]"
                          : holiday && isCurrentMonth
                            ? hasCommemorative
                              ? "bg-[#DFF2EC] font-black text-[#0D675D] ring-1 ring-[#0F897A] hover:bg-[#DFF2EC]"
                              : "bg-[#FBF3E8] font-black text-[#8A4B12] ring-1 ring-[#EDA100] hover:bg-[#FBF3E8]"
                            : isCurrentMonth
                              ? index % 7 > 4
                                ? "text-[#365563] hover:bg-[#DFF2EC]"
                                : "text-[#173849] hover:bg-[#DFF2EC]"
                              : "text-[#8A9A9E]"
                      }`}
                    >
                      {todayDate && (
                        <motion.span
                          className="absolute inset-0 rounded-full ring-4 ring-[#DFF2EC]"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">{day}</span>
                      {holiday && (
                        <>
                          <span
                            className={`absolute bottom-0.5 size-1 rounded-full ${todayDate ? "bg-white" : hasCommemorative ? "bg-[#14786C]" : "bg-[#EDA100]"}`}
                            aria-hidden="true"
                          />
                          <span
                            role="tooltip"
                            className={`pointer-events-none absolute z-20 w-max max-w-[150px] rounded-[8px] bg-[#14786C] px-2.5 py-1.5 text-center text-[13px] font-semibold leading-snug text-white opacity-0 shadow-[0_6px_16px_rgba(13,103,93,0.35)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-normal break-words ${
                              tooltipBelow ? "top-full mt-2" : "bottom-full mb-2"
                            } ${
                              tooltipAlign === "center"
                                ? "left-1/2 -translate-x-1/2"
                                : tooltipAlign === "left"
                                  ? "left-0"
                                  : "right-0"
                            }`}
                          >
                            {holidaysOnDate.map((item) => (
                              <span key={`${item.scope}-${item.name}`} className="block first:font-semibold text-left">
                                {item.name}
                                <span className="ml-1 text-[11px] font-normal text-[#DFF2EC]">
                                  {holidayScopeLabels[item.scope]}
                                </span>
                              </span>
                            ))}
                            <span
                              className={`absolute border-4 border-transparent ${
                                tooltipBelow
                                  ? "bottom-full border-b-[#14786C]"
                                  : "top-full border-t-[#14786C]"
                              } ${
                                tooltipAlign === "center"
                                  ? "left-1/2 -translate-x-1/2"
                                  : tooltipAlign === "left"
                                    ? "left-2"
                                    : "right-2"
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

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[17px] font-semibold text-[#6F858C]">
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-[#14786C]" /> Hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-[#EDA100] ring-2 ring-[#FBF3E8]" />
            Feriado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-[#0F897A] ring-2 ring-[#DFF2EC]" />
            Data comemorativa
          </span>
          <AnimatePresence>
            {holidaysLoading && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="ml-auto text-[#6F858C]"
              >
                Atualizando feriados...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
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
const noticeTones = {
  holiday: { label: "Feriado", soft: "bg-[#FBF3E8]", text: "text-[#8A4B12]", bar: "bg-[#C9853F]" },
  commemorative: { label: "Data comemorativa", soft: "bg-[#DFF2EC]", text: "text-[#0D675D]", bar: "bg-[#0F897A]" },
};

type NoticeTone = (typeof noticeTones)[keyof typeof noticeTones];

export function Notices({ today, holidays, loading, unavailable }: NoticesProps) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isUpcoming = (holiday: Holiday) =>
    parseHolidayDate(holiday.date).getTime() >= todayStart.getTime();

  // Os dois próximos feriados e as duas próximas datas comemorativas, em ordem de data.
  const upcoming = holidays
    .filter(isUpcoming)
    .sort((a, b) => parseHolidayDate(a.date).getTime() - parseHolidayDate(b.date).getTime());
  const nextHolidays = upcoming.filter((holiday) => holiday.isDayOff).slice(0, 2);
  const nextCommemoratives = upcoming
    .filter((holiday) => holiday.scope === "commemorative")
    .slice(0, 2);

  const daysUntil = (holiday: Holiday) =>
    Math.round(
      (parseHolidayDate(holiday.date).getTime() - todayStart.getTime()) / 86400000,
    );

  const countdownLabel = (holiday: Holiday) => {
    const days = daysUntil(holiday);
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `Faltam ${days} dias`;
  };

  // Cartão de um aviso: bloco de data à esquerda, nome e dia da semana ao lado.
  const renderNotice = (holiday: Holiday, tone: NoticeTone) => {
    const date = parseHolidayDate(holiday.date);
    return (
      <article
        key={`${tone.label}-${holiday.date}`}
        className="relative flex flex-col gap-2.5 overflow-hidden rounded-[14px] border border-[#D7E1DE] bg-[#F8FAF9] px-3.5 py-3 pl-4.5"
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.04em] ${tone.soft} ${tone.text}`}>
            {tone.label}
          </span>
          <span className={`text-[12.5px] font-bold uppercase ${tone.text}`}>
            {countdownLabel(holiday)}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-[12px] ${tone.soft} ${tone.text}`}>
            <span className="text-[22px] font-black leading-none">
              {String(date.getDate()).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[11.5px] font-bold uppercase tracking-[0.06em]">
              {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-black leading-tight text-[#173849]">{holiday.name}</h3>
            <p className="mt-0.5 text-[14px] capitalize text-[#6F858C]">
              {date.toLocaleDateString("pt-BR", { weekday: "long" })}
            </p>
          </div>
        </div>
      </article>
    );
  };

  return (
    <ShellCard id="agenda" className="flex h-full min-h-[252px] flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-[#D7E1DE] pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-[17px] font-black text-[#173849]">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-[#DFF2EC] text-[#0D675D]">
              <CalendarDays className="size-4.5" />
            </span>
            Agenda e avisos
          </h2>
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#14786C]">
            Próximos feriados e datas comemorativas
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col justify-center gap-4">
          <div className="animate-pulse space-y-2" aria-label="Carregando avisos">
            <span className="block h-4 w-36 rounded bg-[#D7E1DE]" />
            <span className="block h-3 w-48 max-w-full rounded bg-[#EDF1F0]" />
          </div>
          <div className="animate-pulse space-y-2">
            <span className="block h-4 w-36 rounded bg-[#D7E1DE]" />
            <span className="block h-3 w-48 max-w-full rounded bg-[#EDF1F0]" />
          </div>
        </div>
      ) : nextHolidays.length || nextCommemoratives.length ? (
        <div className="@container flex flex-1 flex-col justify-center">
          <div className={`grid gap-3 ${nextHolidays.length && nextCommemoratives.length ? "@md:grid-cols-2" : ""}`}>
            {nextHolidays.length > 0 && (
              <div className="grid content-start gap-3">
                {nextHolidays.map((holiday) => renderNotice(holiday, noticeTones.holiday))}
              </div>
            )}
            {nextCommemoratives.length > 0 && (
              <div className="grid content-start gap-3">
                {nextCommemoratives.map((holiday) => renderNotice(holiday, noticeTones.commemorative))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div>
            <h3 className="mb-1 text-[17px] font-bold text-[#173849]">
              Calendário atualizado
            </h3>
            <p className="text-[17px] leading-relaxed text-[#6F858C]">
              {unavailable
                ? "Não foi possível consultar os feriados agora."
                : "Não há feriado ou data comemorativa cadastrada neste período."}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F7FAF9] p-4 text-[#365563] shadow-[0_8px_18px_rgba(11,63,67,0.08)]">
            <p className="text-[15px] font-semibold">Dica rápida</p>
            <p className="mt-2 text-[14px] leading-relaxed">
              Que tal consultar a agenda de reuniões ou verificar notícias recentes para se preparar para a semana?
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
        className="mt-4 flex min-h-[54px] items-center justify-center gap-2 self-center rounded-[10px] bg-[#14786C] px-6 py-3 text-[17px] font-black text-white shadow-[0_8px_16px_rgba(13,103,93,0.2)] transition hover:bg-[#0D675D]"
      >
        Notícias no site do IDAM
        <ExternalLink className="size-4.5" aria-hidden="true" />
      </motion.a>
    </ShellCard>
  );
}
