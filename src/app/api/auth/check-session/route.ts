import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/databases/supabase";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { authenticated: false, error: errorMessage },
      { status: 500 },
    );
  }
}
