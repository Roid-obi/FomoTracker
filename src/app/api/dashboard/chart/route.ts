import { NextResponse } from "next/server";
import { getChartService } from "@/lib/services/dashboard.service";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days"); //?days=1-99
    const days = daysParam ? Number.parseInt(daysParam, 10) : 7;

    if (Number.isNaN(days) || days < 1 || days > 90) {
      return NextResponse.json(
        { error: "Query param 'days' harus berupa angka antara 1–90" },
        { status: 400 },
      );
    }

    const result = await getChartService(days);

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
