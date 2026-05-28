import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { poolId, startTime, endTime } = body;

  if (!poolId || !startTime || !endTime) {
    return NextResponse.json({ error: "Pool, start time, and end time are required" }, { status: 400 });
  }

  const pool = await prisma.pool.findUnique({ where: { id: poolId } });
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }
  if (!pool.isActive) {
    return NextResponse.json({ error: "Pool is not active" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const durationMinutes = (end.getTime() - start.getTime()) / 60000;
  if (durationMinutes > pool.defaultMaxDuration) {
    return NextResponse.json({ error: `Maximum booking duration is ${pool.defaultMaxDuration} minutes` }, { status: 400 });
  }

  const minAdvanceMs = pool.defaultMinAdvance * 60 * 60 * 1000;
  if (start.getTime() - Date.now() < minAdvanceMs) {
    return NextResponse.json({ error: `Must book at least ${pool.defaultMinAdvance} hours in advance` }, { status: 400 });
  }

  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const override = await prisma.scheduleOverride.findUnique({
    where: { poolId_date: { poolId, date: startDate } },
  });

  if (!override) {
    return NextResponse.json({ error: "Pool has no schedule for this date" }, { status: 400 });
  }

  if (override.isClosed) {
    return NextResponse.json({ error: "Pool is closed on this date" }, { status: 400 });
  }

  if (override.openTime && override.closeTime) {
    const open = new Date(override.openTime);
    const close = new Date(override.closeTime);
    if (start < open || end > close) {
      return NextResponse.json({ error: "Selected time is outside operating hours" }, { status: 400 });
    }
  }

  const existing = await prisma.reservation.findFirst({
    where: {
      poolId,
      status: "confirmed",
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Time slot conflicts with an existing reservation" }, { status: 409 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      poolId,
      userId: session.user.id,
      startTime: start,
      endTime: end,
      status: "confirmed",
    },
  });

  return NextResponse.json(reservation);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && ["confirmed", "cancelled"].includes(status)) {
    where.status = status;
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: { pool: { select: { name: true } } },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(reservations);
}
