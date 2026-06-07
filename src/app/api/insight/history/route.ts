import { NextResponse } from "next/server";
import { getHistoryService } from "@/lib/services/insight.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/insight/history?page=1&limit=10
 *
 * Mengembalikan daftar ringkas seluruh weekly insight pengguna,
 * diurutkan dari yang paling baru.
 *
 * Query params:
 *  - page  : halaman (default 1)
 *  - limit : jumlah per halaman (default 10, maks 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limitRaw = Number.parseInt(searchParams.get("limit") ?? "10", 10);

    const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
    const limit =
      Number.isNaN(limitRaw) || limitRaw < 1
        ? 10
        : Math.min(limitRaw, 50);

    const result = await getHistoryService(page, limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: { page, limit },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
