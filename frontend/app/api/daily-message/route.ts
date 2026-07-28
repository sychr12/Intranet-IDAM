import { NextResponse } from "next/server";
import { getDailyMessage } from "../../_lib/daily-message";

// Endpoint interno para a mensagem institucional exibida diariamente na intranet.
export function GET() {
  return NextResponse.json(getDailyMessage(), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
