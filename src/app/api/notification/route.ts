import { NextResponse } from "next/server";
import {
  createNotificationService,
  getNotificationsService,
  updateNotificationService,
} from "@/lib/services/notification.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * GET /api/notification
 * Mengembalikan semua notifikasi milik user yang sedang login.
 */
export async function GET() {
  try {
    const result = await getNotificationsService();

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

/**
 * POST /api/notification
 * Membuat notifikasi baru untuk user yang sedang login.
 *
 * Body: { type: string, message: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createNotificationService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notifikasi berhasil dibuat",
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

/**
 * PUT /api/notification
 * Update status baca notifikasi.
 *
 * Body:
 *   - { id: string, isRead: boolean }   → update satu notifikasi
 *   - { markAllRead: true }             → tandai semua sebagai sudah dibaca
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await updateNotificationService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil diperbarui",
      data: result.data,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
