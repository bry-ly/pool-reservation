import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (reservation.status !== "confirmed") {
    return NextResponse.json({ error: "Reservation is already cancelled" }, { status: 400 });
  }

  const pool = await prisma.pool.findUnique({ where: { id: reservation.poolId } });
  if (pool) {
    const cancelWindowMs = pool.defaultCancelWindow * 60 * 60 * 1000;
    if (session.user.role !== "admin" && reservation.startTime.getTime() - Date.now() < cancelWindowMs) {
      return NextResponse.json({ error: `Cannot cancel within ${pool.defaultCancelWindow} hours of start time` }, { status: 400 });
    }
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "User requested",
    },
  });

  return NextResponse.json(updated);
}
