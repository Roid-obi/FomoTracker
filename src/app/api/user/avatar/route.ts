import { NextResponse } from "next/server";
import { uploadAvatarService } from "@/lib/services/user.service";

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const result = await uploadAvatarService(formData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      avatarUrl: result.avatarUrl,
      message: "Avatar berhasil diperbarui",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
