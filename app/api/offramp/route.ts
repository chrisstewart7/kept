import { NextResponse } from "next/server";
import { getOfframp } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getOfframp() });
}
