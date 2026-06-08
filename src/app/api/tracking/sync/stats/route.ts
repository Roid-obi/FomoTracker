import { NextResponse } from "next/server";
import { syncDailyStatsService } from "@/lib/services/tracking.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * POST /api/tracking/sync/stats
 *
 * Menerima stats per app untuk satu hari,
 * lalu menghitung behavioral score dan membuat notifikasi jika ada pelanggaran.
 *
 * Body:
 * {
 *   userId:   string (uuid),
 *   deviceId: string (uuid),
 *   statDate: string,
 *   stats: [{
 *     packageName?:                string,
 *     webDomain?:                  string,
 *     totalDurationSeconds:        number,
 *     openFrequency:               number,
 *     midnightDurationSeconds:     number,
 *     productiveHourDurationSeconds: number,
 *     maxContinuousSeconds:        number,
 *     peakActiveHour?:             number  // 0–23
 *   }]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await syncDailyStatsService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `${result.data.statsUpserted} stat diperbarui, ${result.data.notificationsCreated} notifikasi dibuat`,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
