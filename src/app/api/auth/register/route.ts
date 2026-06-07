import { NextResponse } from "next/server";
import { registerService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await registerService(formData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Register berhasil" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}