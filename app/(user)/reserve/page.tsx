import prisma from "@/lib/db";
import Link from "next/link";
import { IconPool, IconChevronRight, IconCalendar, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

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

export default async function ReservePage() {
  const { start: todayStart, end: todayEnd } = todayRange();

  const pools = await prisma.pool.findMany({
    where: { isActive: true },
    include: {
      schedules: {
        where: { date: { gte: todayStart, lt: todayEnd } },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  if (pools.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-muted">
          <IconPool className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-medium">No pools available</h2>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          There are no active pools configured yet. Check back later or contact an admin.
        </p>
        <Link
          href="/reservations"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          View my reservations
          <IconChevronRight className="size-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">Reserve a Pool</h1>
        <p className="text-xs text-muted-foreground">Select a pool to book a time slot</p>
      </div>
      <div className="grid gap-3">
        {pools.map((pool) => (
          <Link
            key={pool.id}
            href={`/reserve/${pool.id}`}
            className="group flex items-center gap-4 rounded-none border p-4 transition-colors hover:bg-muted/50"
          >
            {pool.imageUrl ? (
              <img src={pool.imageUrl} alt={pool.name} className="size-16 shrink-0 object-cover bg-muted" />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center bg-muted">
                <IconPool className="size-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{pool.name}</p>
                <Badge variant={pool.type === "kids" ? "default" : "secondary"} className="text-[10px]">
                  {pool.type === "kids" ? "Kids" : "Adult"}
                </Badge>
              </div>
              {pool.description && (
                <p className="truncate text-xs text-muted-foreground">{pool.description}</p>
              )}
              {pool.address && (
                <p className="truncate text-xs text-muted-foreground">{pool.address}</p>
              )}
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <IconClock className="size-3" />
                  {pool.schedules.length > 0 ? (
                    pool.schedules[0].isClosed ? (
                      <span className="text-destructive">Closed today</span>
                    ) : (
                      <>{formatTime(pool.schedules[0].openTime!)} &ndash; {formatTime(pool.schedules[0].closeTime!)}</>
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
            <IconChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
