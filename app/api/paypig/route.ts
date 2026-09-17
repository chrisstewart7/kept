import { NextResponse } from "next/server";
import { getBurns, getPayPigInfo } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    info: await getPayPigInfo(),
    burns: await getBurns(20),
  });
}
