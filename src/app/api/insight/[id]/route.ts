import { NextResponse } from "next/server";
import { getByIdService } from "@/lib/services/insight.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/insight/[id]
 *
 * Mengembalikan detail lengkap satu weekly insight berdasarkan ID.
 * Hanya bisa diakses oleh pemilik insight (verifikasi via userId).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json(
        { error: "ID insight tidak valid" },
        { status: 400 },
      );
    }

    const result = await getByIdService(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
