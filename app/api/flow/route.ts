import { NextResponse } from "next/server";
import { getFlow } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getFlow());
}
