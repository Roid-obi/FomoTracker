import { NextResponse } from "next/server";
import { sendMessageService } from "@/lib/services/aicon.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await sendMessageService(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
