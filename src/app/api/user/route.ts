import { NextResponse } from "next/server";
import {
  getService,
  updateService,
  deleteUserService,
} from "@/lib/services/user.service";
import { createSupabaseServer } from "@/lib/databases/supabase";

export async function GET() {
  try {
    const result = await getService();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await updateService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Update berhasil" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User tidak terautentikasi" },
        { status: 401 },
      );
    }

    const result = await deleteUserService(user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Hapus sesi Supabase setelah data berhasil dihapus
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus permanen",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
