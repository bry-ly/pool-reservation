import Link from "next/link";
import prisma from "@/lib/db";
import { IconPool, IconCalendarClock, IconListDetails } from "@tabler/icons-react";

export default async function AdminDashboard() {
  const [poolCount, scheduleCount, reservationCount] = await Promise.all([
    prisma.pool.count(),
    prisma.scheduleOverride.count({ where: { isClosed: false } }),
    prisma.reservation.count({ where: { status: "confirmed" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/pools"
          className="flex items-center gap-4 border p-4 transition-colors hover:bg-muted/30"
        >
          <IconPool className="size-8 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Pools</p>
            <p className="text-[10px] text-muted-foreground">Manage {poolCount} location{poolCount !== 1 ? "s" : ""}</p>
          </div>
        </Link>
        <Link
          href="/admin/schedule"
          className="flex items-center gap-4 border p-4 transition-colors hover:bg-muted/30"
        >
          <IconCalendarClock className="size-8 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Schedule</p>
            <p className="text-[10px] text-muted-foreground">{scheduleCount} active override{scheduleCount !== 1 ? "s" : ""}</p>
          </div>
        </Link>
        <Link
          href="/admin/reservations"
          className="flex items-center gap-4 border p-4 transition-colors hover:bg-muted/30"
        >
          <IconListDetails className="size-8 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Bookings</p>
            <p className="text-[10px] text-muted-foreground">{reservationCount} confirmed</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
