import { NextResponse } from "next/server";
import { syncActivityService } from "@/lib/services/tracking.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * POST /api/tracking/sync/activity
 *
 * Menerima batch activity log dari Android / browser.
 *
 * Body:
 * {
 *   userId:   string (uuid),
 *   deviceId: string (uuid),
 *   logs: [{
 *     packageName?:    string,   // Android package, mis. com.instagram.android
 *     webDomain?:      string,   // domain browser, mis. instagram.com
 *     startedAt:       string,   // ISO 8601
 *     endedAt:         string,   // ISO 8601
 *     durationSeconds: number,
 *     isMidnight:      boolean,
 *     isProductiveHour:boolean,
 *     isContinuous:    boolean,
 *     source:          "android_app" | "browser_extension"
 *   }]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await syncActivityService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `${result.data.inserted} log berhasil disimpan, ${result.data.skipped} dilewati`,
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
