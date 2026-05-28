"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCalendarEvent,
  IconClock,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconHistory,
} from "@tabler/icons-react";

type Reservation = {
  id: string;
  poolId: string;
  startTime: string;
  endTime: string;
  status: string;
  cancelledAt: string | null;
  pool: { name: string };
};

const tabConfig = [
  { key: "upcoming", label: "Upcoming", icon: IconClock },
  { key: "past", label: "Past", icon: IconHistory },
  { key: "cancelled", label: "Cancelled", icon: IconCircleX },
] as const;

const emptyMessages: Record<string, { title: string; description: string; cta?: string; href?: string }> = {
  upcoming: {
    title: "No upcoming reservations",
    description: "You don't have any upcoming reservations. Book a pool to get started.",
    cta: "Book a pool",
    href: "/reserve",
  },
  past: {
    title: "No past reservations",
    description: "Your completed reservations will appear here.",
  },
  cancelled: {
    title: "No cancelled reservations",
    description: "You haven't cancelled any reservations.",
  },
};

export default function MyReservationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  function loadReservations() {
    setLoading(true);
    const statusParam = tab === "cancelled" ? "cancelled" : "confirmed";
    fetch(`/api/reservations?status=${statusParam}`)
      .then((r) => r.json())
      .then((data) => setReservations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReservations();
  }, [tab]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this reservation?")) return;
    const res = await fetch(`/api/reservations/${id}/cancel`, { method: "POST" });
    if (res.ok) {
      toast.success("Reservation cancelled");
      loadReservations();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to cancel");
    }
  }

  const now = new Date();

  const filtered = tab === "upcoming"
    ? reservations.filter((r) => new Date(r.startTime) > now)
    : tab === "past"
    ? reservations.filter((r) => new Date(r.startTime) <= now)
    : reservations;

  const empty = emptyMessages[tab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">My Reservations</h1>
        <p className="text-xs text-muted-foreground">View and manage your pool bookings</p>
      </div>
      <div className="flex gap-1 border-b">
        {tabConfig.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted" />
                <div className="h-3 w-48 bg-muted" />
                <div className="h-5 w-16 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-muted">
            {tab === "upcoming" ? (
              <IconCalendarEvent className="size-6 text-muted-foreground" />
            ) : tab === "past" ? (
              <IconHistory className="size-6 text-muted-foreground" />
            ) : (
              <IconCircleX className="size-6 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-sm font-medium">{empty.title}</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {empty.description}
          </p>
          {empty.cta && empty.href && (
            <Link
              href={empty.href}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {empty.cta}
              <IconChevronRight className="size-3" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            const isUpcoming = start > now;
            return (
              <div key={r.id} className="group flex items-center gap-4 border p-4 transition-colors hover:bg-muted/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                  {r.status === "confirmed" ? (
                    <IconCircleCheck className={`size-5 ${isUpcoming ? "text-primary" : "text-muted-foreground"}`} />
                  ) : (
                    <IconCircleX className="size-5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium">{r.pool.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                    <span className="text-border">&middot;</span>
                    <span>
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      &ndash;
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Badge
                    variant={r.status === "confirmed" && isUpcoming ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {r.status === "confirmed" && isUpcoming ? "upcoming" : r.status}
                  </Badge>
                </div>
                {r.status === "confirmed" && isUpcoming && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    onClick={() => handleCancel(r.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
