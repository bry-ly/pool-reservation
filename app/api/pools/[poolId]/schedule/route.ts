import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  const { searchParams } = new URL(_request.url);
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  const date = new Date(dateParam);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const override = await prisma.scheduleOverride.findUnique({
    where: { poolId_date: { poolId, date: startOfDay } },
  });

  if (!override) {
    return NextResponse.json({ openTime: null, closeTime: null, isClosed: true });
  }

  return NextResponse.json({
    openTime: override.openTime?.toISOString() ?? null,
    closeTime: override.closeTime?.toISOString() ?? null,
    isClosed: override.isClosed,
  });
}
