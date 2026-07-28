export type HolidayScope = "national" | "state" | "municipal" | "commemorative";

export interface Holiday {
  date: string;
  name: string;
  scope: HolidayScope;
  isDayOff: boolean;
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

// Datas de profissão e comemorativas relevantes ao IDAM (não geram folga).
const commemorativeFixedDates = [
  { month: 1, day: 11, name: "Dia do Controle da Poluição por Agrotóxicos" },
  { month: 3, day: 21, name: "Dia Internacional das Florestas" },
  { month: 3, day: 22, name: "Dia Mundial da Água" },
  { month: 4, day: 15, name: "Dia Nacional da Conservação do Solo" },
  { month: 5, day: 22, name: "Dia Internacional da Biodiversidade" },
  { month: 6, day: 5, name: "Dia Mundial do Meio Ambiente" },
  { month: 7, day: 12, name: "Dia do Engenheiro Florestal" },
  { month: 7, day: 17, name: "Dia de Proteção às Florestas" },
  { month: 7, day: 28, name: "Dia do Agricultor" },
  { month: 9, day: 3, name: "Dia do Biólogo" },
  { month: 9, day: 9, name: "Dia do Médico Veterinário" },
  { month: 9, day: 21, name: "Dia da Árvore" },
  { month: 10, day: 12, name: "Dia do Engenheiro Agrônomo" },
  { month: 10, day: 28, name: "Dia do Servidor Público" },
  { month: 12, day: 5, name: "Dia Mundial do Solo" },
];

// Datas fixas do calendário de referência do setor agropecuário.
const agriculturalCommemorativeDates = [
  { month: 1, day: 16, name: "Dia dos Cortadores de Cana-de-açúcar" },
  { month: 1, day: 31, name: "Dia do Engenheiro Ambiental" },
  { month: 2, day: 1, name: "Dia do Tomate" },
  { month: 2, day: 6, name: "Dia do Agente de Defesa Ambiental" },
  { month: 2, day: 10, name: "Dia Mundial do Feijão e dos Pulses" },
  { month: 3, day: 14, name: "Dia dos Animais" },
  { month: 3, day: 16, name: "Dia Nacional da Conscientização sobre as Mudanças Climáticas" },
  { month: 3, day: 20, name: "Dia Mundial da Agricultura" },
  { month: 3, day: 23, name: "Dia Mundial da Meteorologia" },
  { month: 3, day: 26, name: "Dia do Cacau" },
  { month: 4, day: 10, name: "Dia da Engenharia" },
  { month: 4, day: 14, name: "Dia Mundial do Café" },
  { month: 4, day: 17, name: "Dia Internacional de Luta dos Trabalhadores do Campo" },
  { month: 4, day: 22, name: "Dia da Terra" },
  { month: 4, day: 22, name: "Dia da Mandioca" },
  { month: 4, day: 24, name: "Dia Internacional do Milho" },
  { month: 4, day: 24, name: "Dia do Boi" },
  { month: 5, day: 3, name: "Dia do Sertanejo" },
  { month: 5, day: 5, name: "Dia do Campo" },
  { month: 5, day: 10, name: "Dia Mundial do Frango" },
  { month: 5, day: 20, name: "Dia Mundial das Abelhas" },
  { month: 5, day: 22, name: "Dia do Apicultor" },
  { month: 5, day: 24, name: "Dia Nacional do Milho" },
  { month: 5, day: 24, name: "Dia Nacional do Café" },
  { month: 5, day: 25, name: "Dia do Trabalhador Rural" },
  { month: 6, day: 1, name: "Dia Mundial do Leite" },
  { month: 6, day: 4, name: "Dia do Engenheiro Agrimensor" },
  { month: 6, day: 8, name: "Dia do Citricultor" },
  { month: 6, day: 23, name: "Dia do Lavrador" },
  { month: 6, day: 29, name: "Dia do Pescador" },
  { month: 7, day: 14, name: "Dia do Engenheiro de Aquicultura" },
  { month: 7, day: 15, name: "Dia do Pecuarista" },
  { month: 7, day: 24, name: "Dia Nacional do Suinocultor" },
  { month: 7, day: 25, name: "Dia Internacional da Agricultura Familiar" },
  { month: 8, day: 10, name: "Dia Internacional do Biodiesel" },
  { month: 8, day: 28, name: "Dia da Avicultura" },
  { month: 8, day: 29, name: "Dia Nacional do Vaqueiro" },
  { month: 9, day: 2, name: "Dia do Florista" },
  { month: 9, day: 11, name: "Dia Nacional do Cerrado" },
  { month: 9, day: 13, name: "Dia do Agrônomo" },
  { month: 9, day: 21, name: "Dia do Fazendeiro" },
  { month: 9, day: 22, name: "Dia Nacional da Banana" },
  { month: 10, day: 1, name: "Dia Internacional do Café" },
  { month: 10, day: 3, name: "Dia Nacional das Abelhas" },
  { month: 10, day: 4, name: "Dia Mundial dos Animais" },
  { month: 10, day: 4, name: "Dia da Natureza" },
  { month: 10, day: 5, name: "Dia das Aves" },
  { month: 10, day: 7, name: "Dia Mundial do Algodão" },
  { month: 10, day: 14, name: "Dia Nacional da Pecuária" },
  { month: 10, day: 15, name: "Dia Internacional das Mulheres Rurais" },
  { month: 10, day: 16, name: "Dia Mundial da Alimentação" },
  { month: 10, day: 17, name: "Dia da Agricultura" },
  { month: 10, day: 22, name: "Dia Nacional do Enólogo" },
  { month: 10, day: 27, name: "Dia do Engenheiro Agrícola" },
  { month: 10, day: 31, name: "Dia Internacional do Arroz" },
  { month: 11, day: 5, name: "Dia do Técnico Agrícola" },
  { month: 11, day: 10, name: "Dia do Trigo" },
  { month: 11, day: 26, name: "Dia da Melancia" },
  { month: 11, day: 30, name: "Dia do Estatuto da Terra" },
  { month: 12, day: 6, name: "Dia da Extensão Rural no Brasil" },
  { month: 12, day: 6, name: "Dia Nacional do Extensionista Rural" },
  { month: 12, day: 7, name: "Dia Nacional da Silvicultura" },
  { month: 12, day: 14, name: "Dia do Engenheiro de Pesca" },
  { month: 12, day: 15, name: "Dia do Jardineiro" },
];

// Datas cívicas, sociais e culturais amplamente celebradas no Brasil.
const brazilianCommemorativeDates = [
  { month: 1, day: 4, name: "Dia Mundial do Braille" },
  { month: 1, day: 30, name: "Dia da Saudade" },
  { month: 2, day: 4, name: "Dia Mundial de Combate ao Câncer" },
  { month: 2, day: 11, name: "Dia Internacional das Mulheres e Meninas na Ciência" },
  { month: 2, day: 20, name: "Dia Mundial da Justiça Social" },
  { month: 3, day: 8, name: "Dia Internacional da Mulher" },
  { month: 3, day: 15, name: "Dia Mundial do Consumidor" },
  { month: 3, day: 21, name: "Dia Internacional da Síndrome de Down" },
  { month: 3, day: 27, name: "Dia Mundial do Teatro" },
  { month: 4, day: 2, name: "Dia Mundial da Conscientização do Autismo" },
  { month: 4, day: 7, name: "Dia Mundial da Saúde" },
  { month: 4, day: 18, name: "Dia Nacional do Livro Infantil" },
  { month: 4, day: 19, name: "Dia dos Povos Indígenas" },
  { month: 4, day: 23, name: "Dia Mundial do Livro" },
  { month: 5, day: 12, name: "Dia Internacional da Enfermagem" },
  { month: 5, day: 15, name: "Dia Internacional da Família" },
  { month: 5, day: 18, name: "Dia Internacional dos Museus" },
  { month: 5, day: 31, name: "Dia Mundial sem Tabaco" },
  { month: 6, day: 12, name: "Dia Mundial contra o Trabalho Infantil" },
  { month: 6, day: 14, name: "Dia Mundial do Doador de Sangue" },
  { month: 6, day: 15, name: "Dia Mundial de Conscientização da Violência contra a Pessoa Idosa" },
  { month: 7, day: 20, name: "Dia Internacional da Amizade" },
  { month: 7, day: 25, name: "Dia Nacional de Tereza de Benguela e da Mulher Negra" },
  { month: 8, day: 9, name: "Dia Internacional dos Povos Indígenas" },
  { month: 8, day: 11, name: "Dia do Estudante" },
  { month: 8, day: 12, name: "Dia Internacional da Juventude" },
  { month: 8, day: 22, name: "Dia do Folclore" },
  { month: 8, day: 25, name: "Dia Nacional da Educação Infantil" },
  { month: 9, day: 5, name: "Dia da Amazônia" },
  { month: 9, day: 8, name: "Dia Mundial da Alfabetização" },
  { month: 9, day: 10, name: "Dia Mundial de Prevenção ao Suicídio" },
  { month: 9, day: 27, name: "Dia Nacional da Doação de Órgãos" },
  { month: 10, day: 1, name: "Dia Internacional da Pessoa Idosa" },
  { month: 10, day: 10, name: "Dia Mundial da Saúde Mental" },
  { month: 10, day: 11, name: "Dia Internacional da Menina" },
  { month: 10, day: 15, name: "Dia do Professor" },
  { month: 10, day: 18, name: "Dia do Médico" },
  { month: 11, day: 14, name: "Dia Mundial do Diabetes" },
  { month: 11, day: 19, name: "Dia do Empreendedorismo Feminino" },
  { month: 11, day: 25, name: "Dia Nacional do Doador de Sangue" },
  { month: 12, day: 1, name: "Dia Mundial de Luta contra a AIDS" },
  { month: 12, day: 3, name: "Dia Internacional da Pessoa com Deficiência" },
  { month: 12, day: 5, name: "Dia Internacional do Voluntariado" },
  { month: 12, day: 10, name: "Dia Internacional dos Direitos Humanos" },
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
    isDayOff: true,
  }));
}

function amazonasAndManausHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  return [
    {
      date: toIsoDate(addDays(easter, -47)),
      name: "Carnaval",
      scope: "municipal",
      isDayOff: true,
    },
    {
      date: toIsoDate(addDays(easter, -2)),
      name: "Paixão de Cristo",
      scope: "municipal",
      isDayOff: true,
    },
    {
      date: toIsoDate(addDays(easter, 60)),
      name: "Corpus Christi",
      scope: "municipal",
      isDayOff: true,
    },
    {
      date: fixedDate(year, 9, 5),
      name: "Elevação do Amazonas à Categoria de Província",
      scope: "state",
      isDayOff: true,
    },
    {
      date: fixedDate(year, 10, 24),
      name: "Aniversário de Manaus",
      scope: "municipal",
      isDayOff: true,
    },
    {
      date: fixedDate(year, 12, 8),
      name: "Nossa Senhora da Conceição",
      scope: "municipal",
      isDayOff: true,
    },
  ];
}

function commemorativeDates(year: number): Holiday[] {
  return [
    ...commemorativeFixedDates,
    ...agriculturalCommemorativeDates,
    ...brazilianCommemorativeDates,
  ].map(({ month, day, name }) => ({
    date: fixedDate(year, month, day),
    name,
    scope: "commemorative",
    isDayOff: false,
  }));
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
        .map<Holiday>(({ date, name }) => ({
          date,
          name,
          scope: "national",
          isDayOff: true,
        }))
    : nationalFallback(year);

  const allHolidays: Holiday[] = [];

  // Feriados reais (nacional/estadual/municipal) têm prioridade sobre datas comemorativas
  // em caso de colisão no mesmo dia.
  for (const holiday of commemorativeDates(year)) allHolidays.push(holiday);
  for (const holiday of nationalSource) allHolidays.push(holiday);
  for (const holiday of amazonasAndManausHolidays(year)) {
    allHolidays.push(holiday);
  }

  return allHolidays.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
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
  commemorative: "Data Comemorativa",
};
