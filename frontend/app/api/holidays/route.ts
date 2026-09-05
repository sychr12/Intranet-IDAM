import { type NextRequest, NextResponse } from "next/server";
import {
  buildHolidayCalendar,
  type NationalHolidayInput,
} from "../../_lib/holidays";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

// Valida somente os campos consumidos pelo frontend antes de aceitar a resposta externa.
const isNationalHoliday = (value: unknown): value is NationalHolidayInput => {
  if (!value || typeof value !== "object") return false;

  const holiday = value as Record<string, unknown>;
  return typeof holiday.date === "string" && typeof holiday.name === "string";
};

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year"));

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return NextResponse.json(
      { message: `Informe um ano entre ${MIN_YEAR} e ${MAX_YEAR}.` },
      { status: 400 },
    );
  }

  let source = "fallback";
  let nationalHolidays: NationalHolidayInput[] = [];

  // A consulta fica em cache por um dia; em falhas, a biblioteca usa a lista local.
  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) },
    );

    if (!response.ok) throw new Error(`BrasilAPI respondeu ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Formato de resposta inválido");

    nationalHolidays = payload.filter(isNationalHoliday);
    source = "brasilapi";
  } catch (error) {
    console.error("Não foi possível consultar os feriados nacionais:", error);
  }

  return NextResponse.json({
    holidays: buildHolidayCalendar(year, nationalHolidays),
    source,
  });
}
