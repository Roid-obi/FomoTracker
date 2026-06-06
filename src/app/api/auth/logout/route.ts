import { NextResponse } from "next/server";
import { logoutService } from "@/lib/services/auth.service";

export async function POST() {
  try {
    const result = await logoutService();

    if (result.success) {
      return NextResponse.json(null, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}