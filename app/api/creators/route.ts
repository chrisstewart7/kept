import { NextResponse } from "next/server";
import { getCreators } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getCreators() });
}
