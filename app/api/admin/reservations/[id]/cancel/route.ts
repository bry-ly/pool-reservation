import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status === "cancelled") {
    return NextResponse.json({ error: "Reservation is already cancelled" }, { status: 400 });
  }

  await prisma.reservation.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Cancelled by admin",
    },
  });

  return NextResponse.json({ success: true });
}
