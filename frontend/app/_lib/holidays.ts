export type HolidayScope = "national" | "state" | "municipal";

export interface Holiday {
  date: string;
  name: string;
  scope: HolidayScope;
}

export interface NationalHolidayInput {
  date: string;
  name: string;
}

// Feriados nacionais usados quando a fonte externa estiver indisponível.
const nationalFixedDates = [
  { month: 1, day: 1, name: "Confraternização Universal" },
  { month: 4, day: 21, name: "Tiradentes" },
  { month: 5, day: 1, name: "Dia do Trabalho" },
  { month: 9, day: 7, name: "Independência do Brasil" },
  { month: 10, day: 12, name: "Nossa Senhora Aparecida" },
  { month: 11, day: 2, name: "Finados" },
  { month: 11, day: 15, name: "Proclamação da República" },
  { month: 11, day: 20, name: "Dia da Consciência Negra" },
  { month: 12, day: 25, name: "Natal" },
];

const locallyDefinedNames = new Set([
  "carnaval",
  "sexta-feira santa",
  "pascoa",
  "corpus christi",
]);

const pad = (value: number) => String(value).padStart(2, "0");

const fixedDate = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

const toIsoDate = (date: Date) =>
  fixedDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

function easterSunday(year: number) {
  // Algoritmo de Meeus para calcular as datas móveis ligadas à Páscoa.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

function nationalFallback(year: number): Holiday[] {
  return nationalFixedDates.map(({ month, day, name }) => ({
    date: fixedDate(year, month, day),
    name,
    scope: "national",
  }));
}

function amazonasAndManausHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  return [
    {
      date: toIsoDate(addDays(easter, -47)),
      name: "Carnaval",
      scope: "municipal",
    },
    {
      date: toIsoDate(addDays(easter, -2)),
      name: "Paixão de Cristo",
      scope: "municipal",
    },
    {
      date: toIsoDate(addDays(easter, 60)),
      name: "Corpus Christi",
      scope: "municipal",
    },
    {
      date: fixedDate(year, 9, 5),
      name: "Elevação do Amazonas à Categoria de Província",
      scope: "state",
    },
    {
      date: fixedDate(year, 10, 24),
      name: "Aniversário de Manaus",
      scope: "municipal",
    },
    {
      date: fixedDate(year, 12, 8),
      name: "Nossa Senhora da Conceição",
      scope: "municipal",
    },
  ];
}

const normalizeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function buildHolidayCalendar(
  year: number,
  nationalHolidays: NationalHolidayInput[] = [],
) {
  // Datas locais substituem entradas genéricas da API para preservar o escopo legal.
  const nationalSource = nationalHolidays.length
    ? nationalHolidays
        .filter(({ name }) => !locallyDefinedNames.has(normalizeName(name)))
        .map<Holiday>(({ date, name }) => ({ date, name, scope: "national" }))
    : nationalFallback(year);

  const byDate = new Map<string, Holiday>();

  for (const holiday of nationalSource) byDate.set(holiday.date, holiday);
  for (const holiday of amazonasAndManausHolidays(year)) {
    byDate.set(holiday.date, holiday);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function parseHolidayDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const toHolidayDateKey = (date: Date) =>
  fixedDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

export const holidayScopeLabels: Record<HolidayScope, string> = {
  national: "Nacional",
  state: "Amazonas",
  municipal: "Manaus",
};
