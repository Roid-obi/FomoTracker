import { NextResponse } from "next/server";
import { logoutService } from "@/lib/services/auth.service";

export async function POST() {
  try {
    const result = await logoutService();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
