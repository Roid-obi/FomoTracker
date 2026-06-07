import { NextResponse } from "next/server";
import { generateInsightService } from "@/lib/services/insight.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * POST /api/insight/generate
 *
 * Memulai proses generate weekly insight berbasis AI.
 *
 * Request body (opsional (default generate untuk minggu lalu), application/json):
 * {
 *   "weekStart": "YYYY-MM-DD"  // Senin dari minggu yang ingin di-generate
 * }
 */
export async function POST(request: Request) {
  try {
    let body: unknown = undefined;

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        body = await request.json();
      } catch {
        // Body kosong atau bukan JSON valid — tetap lanjut dengan body undefined
      }
    }

    const result = await generateInsightService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.data.message,
      data: result.data,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
