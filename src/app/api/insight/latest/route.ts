import { NextResponse } from "next/server";
import { getLatestService } from "@/lib/services/insight.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/insight/latest
 *
 * Mengembalikan weekly insight terbaru yang sudah berhasil di-generate
 * (generationStatus = "generated"), diurutkan berdasarkan weekStart terbaru.
 */
export async function GET() {
  try {
    const result = await getLatestService();

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
