"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCursor(currentMonth);
    onYearChange(currentMonth.getFullYear());
  }, [today, onYearChange]);

  const updateCursor = (date: Date) => {
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
    <ShellCard className="min-h-[252px] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-black text-[#0b3a22]">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#e8f5d8] text-[#0b6a20]">
            <CalendarDays className="size-5.5" />
          </span>
          Calendário
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() =>
              updateCursor(new Date(today.getFullYear(), today.getMonth(), 1))
            }
            disabled={isViewingCurrentMonth}
            className="h-11 rounded-[10px] border border-[#dce6d8] px-3 text-[0.68rem] font-bold text-[#47722b] transition hover:bg-[#edf7df] disabled:cursor-default disabled:bg-[#f2f6ee] disabled:text-[#9aa895]"
          >
            Hoje
          </button>
          <div className="flex h-11 items-center overflow-hidden rounded-[11px] border border-[#dce6d8] bg-[#f8faf6] text-xs font-bold text-[#121d16] shadow-[0_3px_10px_rgba(11,52,36,0.05)]">
            <button
              className="flex size-11 items-center justify-center border-r border-[#e2e9de] transition hover:bg-[#eaf5de]"
              onClick={() =>
                updateCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="min-w-[138px] px-3 text-center sm:min-w-[152px]">
              {months[cursor.getMonth()]} de {cursor.getFullYear()}
            </span>
            <button
              className="flex size-11 items-center justify-center border-l border-[#e2e9de] transition hover:bg-[#eaf5de]"
              onClick={() =>
                updateCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#e2e9de] bg-[#fbfcfa]">
        <div className="grid grid-cols-7 bg-[#f1f6ed] px-2 py-2 text-center">
          {weekdays.map((day, index) => (
            <span
              key={day}
              className={`text-[0.62rem] font-black ${index > 4 ? "text-[#6d8e4d]" : "text-[#456452]"}`}
            >
              {day}
            </span>
          ))}
        </div>
        {loading ? (
          <div
            className="grid animate-pulse grid-cols-7 gap-x-1 gap-y-1.5 px-2 py-2.5"
            aria-label="Carregando calendário"
          >
            {Array.from({ length: 42 }, (_, index) => (
              <span key={index} className="mx-auto size-8 rounded-full bg-[#eef2eb]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-x-1 gap-y-1.5 px-2 py-2.5 text-center">
            {calendarDays.map(({ date, day, isCurrentMonth }, index) => {
              const holiday = holidaysByDate.get(toHolidayDateKey(date));
              const todayDate = isToday(date);

              return (
                <time
                  key={date.toISOString()}
                  dateTime={toHolidayDateKey(date)}
                  title={
                    holiday
                      ? `${holiday.name} - ${holidayScopeLabels[holiday.scope]}`
                      : undefined
                  }
                  className={`relative mx-auto flex size-8 items-center justify-center rounded-full text-[0.74rem] transition ${
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
                  {day}
                  {holiday && (
                    <span
                      className={`absolute bottom-0.5 size-1 rounded-full ${todayDate ? "bg-white" : "bg-[#d09900]"}`}
                      aria-hidden="true"
                    />
                  )}
                </time>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.65rem] font-semibold text-[#647067]">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#0c711f]" /> Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#e0b226] ring-2 ring-[#fff2bd]" />
          Feriado
        </span>
        {holidaysLoading && (
          <span className="ml-auto animate-pulse text-[#79906f]">
            Atualizando feriados...
          </span>
        )}
      </div>
    </ShellCard>
  );
}

interface NoticesProps {
  today: Date;
  holidays: Holiday[];
  loading: boolean;
  unavailable: boolean;
}

// Resumo do próximo feriado e acesso às notícias institucionais.
export function Notices({ today, holidays, loading, unavailable }: NoticesProps) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nextHoliday = holidays.find(
    (holiday) => parseHolidayDate(holiday.date).getTime() >= todayStart.getTime(),
  );
  const daysUntil = nextHoliday
    ? Math.round(
        (parseHolidayDate(nextHoliday.date).getTime() - todayStart.getTime()) /
          86400000,
      )
    : null;
  const dateLabel = nextHoliday
    ? parseHolidayDate(nextHoliday.date).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <ShellCard className="flex min-h-[236px] flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-[#e7ece4] pb-3">
        <h2 className="text-base font-black text-[#0a2d1e]">Avisos</h2>
        <span className="rounded-full bg-[#fff4c9] px-2.5 py-1 text-[0.62rem] font-bold uppercase text-[#806000]">
          Feriados
        </span>
      </div>
      <div className="flex flex-1 items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-[14px] bg-[#fff5cf] text-[#9b7000]">
          <CalendarDays className="size-8" />
        </span>
        <div className="min-w-0">
          {loading ? (
            <div className="animate-pulse space-y-2" aria-label="Carregando próximo feriado">
              <span className="block h-4 w-36 rounded bg-[#e8ede5]" />
              <span className="block h-3 w-48 max-w-full rounded bg-[#eef2eb]" />
            </div>
          ) : nextHoliday ? (
            <>
              <p className="mb-1 text-[0.65rem] font-black uppercase text-[#8a6800]">
                {daysUntil === 0 ? "Feriado de hoje" : "Próximo feriado"}
              </p>
              <h3 className="mb-1 text-sm font-black leading-tight text-[#153924]">
                {nextHoliday.name}
              </h3>
              <p className="text-[0.74rem] capitalize leading-relaxed text-[#617067]">
                {dateLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#edf7df] px-2 py-1 text-[0.6rem] font-bold text-[#527f13]">
                  {holidayScopeLabels[nextHoliday.scope]}
                </span>
                <span className="rounded-full bg-[#f1f3ef] px-2 py-1 text-[0.6rem] font-bold text-[#5f6c64]">
                  {daysUntil === 0
                    ? "Hoje"
                    : daysUntil === 1
                      ? "Amanhã"
                      : `Faltam ${daysUntil} dias`}
                </span>
              </div>
            </>
          ) : (
            <>
              <h3 className="mb-1 text-sm font-bold text-[#153924]">
                Calendário atualizado
              </h3>
              <p className="text-[0.78rem] leading-relaxed text-[#617067]">
                {unavailable
                  ? "Não foi possível consultar os feriados agora."
                  : "Não há outro feriado cadastrado neste período."}
              </p>
            </>
          )}
        </div>
      </div>
      <a
        href={NEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-10 items-center justify-center gap-2 self-start rounded-[10px] bg-[linear-gradient(135deg,#78b313,#559806)] px-5 py-2 text-xs font-black text-white shadow-[0_8px_16px_rgba(82,145,6,0.2)] transition hover:brightness-105"
      >
        Ver comunicados
        <ChevronRight className="size-5" />
      </a>
    </ShellCard>
  );
}
