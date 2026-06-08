import { NextResponse } from "next/server";
import { completeOnboardingService } from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await completeOnboardingService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding berhasil diselesaikan",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
