import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/pool/booking-form";
import { IconArrowLeft, IconClock, IconCalendar } from "@tabler/icons-react";

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export default async function BookPoolPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const { start: todayStart, end: todayEnd } = todayRange();

  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: {
      schedules: {
        where: { date: { gte: todayStart, lt: todayEnd } },
        take: 1,
      },
    },
  });

  if (!pool || !pool.isActive) notFound();

  const schedule = pool.schedules[0];

  return (
    <div className="space-y-6">
      <Link
        href="/reserve"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-3.5" />
        Back to pools
      </Link>

      <div className="overflow-hidden border">
        {pool.imageUrl && (
          <img src={pool.imageUrl} alt={pool.name} className="h-40 w-full object-cover bg-muted sm:h-56" />
        )}
        <div className="p-4">
          <h1 className="text-lg font-medium">{pool.name}</h1>
          {pool.description && (
            <p className="mt-1 text-xs text-muted-foreground">{pool.description}</p>
          )}
          {pool.address && (
            <p className="mt-1 text-xs text-muted-foreground">{pool.address}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <IconClock className="size-3" />
              {schedule ? (
                schedule.isClosed ? (
                  <span className="text-destructive">Closed today</span>
                ) : (
                  <>Open {formatTime(schedule.openTime!)} &ndash; {formatTime(schedule.closeTime!)}</>
                )
              ) : (
                "No schedule today"
              )}
            </span>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1">
              <IconCalendar className="size-3" />
              Max {pool.defaultMaxDuration} min
            </span>
          </div>
        </div>
      </div>

      <BookingForm pool={pool} />
    </div>
  );
}
