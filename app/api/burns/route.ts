import { NextResponse } from "next/server";
import { getBurns } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getBurns(30) });
}
