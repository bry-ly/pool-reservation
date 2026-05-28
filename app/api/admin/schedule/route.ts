import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { poolId, date, openTime, closeTime, isClosed } = body;

  if (!poolId || !date) {
    return NextResponse.json({ error: "Pool and date are required" }, { status: 400 });
  }

  const dateObj = new Date(date);

  const override = await prisma.scheduleOverride.upsert({
    where: { poolId_date: { poolId, date: dateObj } },
    update: {
      openTime: isClosed ? null : openTime ? new Date(openTime) : null,
      closeTime: isClosed ? null : closeTime ? new Date(closeTime) : null,
      isClosed: isClosed ?? false,
    },
    create: {
      poolId,
      date: dateObj,
      openTime: isClosed ? null : openTime ? new Date(openTime) : null,
      closeTime: isClosed ? null : closeTime ? new Date(closeTime) : null,
      isClosed: isClosed ?? false,
    },
  });

  return NextResponse.json(override);
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Override ID is required" }, { status: 400 });
  }

  const existing = await prisma.scheduleOverride.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Override not found" }, { status: 404 });
  }

  await prisma.scheduleOverride.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get("poolId");

  const where = poolId ? { poolId } : {};

  const overrides = await prisma.scheduleOverride.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json(overrides);
}
