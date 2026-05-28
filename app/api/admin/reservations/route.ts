import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get("poolId");
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (poolId) where.poolId = poolId;
  if (status && ["confirmed", "cancelled"].includes(status)) where.status = status;
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.startTime = { gte: start, lt: end };
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      pool: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "desc" },
    take: 200,
  });

  return NextResponse.json(reservations);
}
