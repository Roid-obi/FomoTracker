import { NextResponse } from "next/server";
import { StatisticModel } from "@/lib/models/statistic.model";
import { getScreenTimeService } from "@/lib/services/statistic.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/screen-time?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Mengembalikan tren screen time harian dalam rentang tanggal.
 * Semua aplikasi yang dipantau digabung per hari.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    };

    const parsed = StatisticModel.dateRangeRequest.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { startDate, endDate } = parsed.data;

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "startDate tidak boleh lebih besar dari endDate" },
        { status: 400 },
      );
    }

    const result = await getScreenTimeService(startDate, endDate);

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
