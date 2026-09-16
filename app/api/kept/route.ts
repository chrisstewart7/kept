import { NextResponse } from "next/server";
import { getBurns, getKeptInfo } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    info: await getKeptInfo(),
    burns: await getBurns(20),
  });
}
