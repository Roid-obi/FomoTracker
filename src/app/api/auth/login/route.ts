import { NextResponse } from "next/server";
import { loginService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await loginService(formData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
