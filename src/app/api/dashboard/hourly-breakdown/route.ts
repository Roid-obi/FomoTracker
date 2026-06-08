import { NextResponse } from "next/server";
import { getHourlyBreakdownService } from "@/lib/services/dashboard.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/dashboard/hourly-breakdown?date=YYYY-MM-DD
 *
 * Mengembalikan data breakdown penggunaan aplikasi per jam (24 jam)
 * pada hari tertentu, untuk digunakan dalam visualisasi grafik stacked bar.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? undefined; //?date=YYYY-MM-DD

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Query param 'date' harus berformat YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const result = await getHourlyBreakdownService(date);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
