"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconAlertTriangle, IconClock, IconLoader2 } from "@tabler/icons-react";

type Pool = {
  id: string;
  name: string;
  description: string | null;
  defaultMaxDuration: number;
  defaultMinAdvance: number;
};

type Schedule = { openTime: string | null; closeTime: string | null; isClosed: boolean };

export function BookingForm({ pool }: { pool: Pool }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setSchedule(null);
      return;
    }
    setScheduleLoading(true);
    fetch(`/api/pools/${pool.id}/schedule?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSchedule(data))
      .catch(() => setSchedule(null))
      .finally(() => setScheduleLoading(false));
  }, [date, pool.id]);

  function updateEndTime(start: string) {
    if (!start) return;
    const [h, m] = start.split(":").map(Number);
    const totalMinutes = h * 60 + m + pool.defaultMaxDuration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    setEndTime(`${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`);
  }

  function validateTimes(): string | null {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (sh * 60 + sm >= eh * 60 + em) return "End time must be after start time";
    if (schedule?.openTime && schedule?.closeTime) {
      const open = new Date(schedule.openTime);
      const close = new Date(schedule.closeTime);
      const s = new Date(open); s.setHours(sh, sm);
      const e = new Date(open); e.setHours(eh, em);
      if (s < open || e > close) return "Selected time is outside operating hours";
    }
    return null;
  }

  const timeError = validateTimes();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime || timeError) return;
    setError("");
    setLoading(true);

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poolId: pool.id, startTime: startDateTime, endTime: endDateTime }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create reservation");
      setLoading(false);
      return;
    }

    const reservation = await res.json();
    router.push(`/reserve/${pool.id}/confirm?reservationId=${reservation.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="date">Date</label>
        <Input id="date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setStartTime(""); setEndTime(""); }} required />
      </div>

      {scheduleLoading && date && (
        <div className="flex items-center gap-2 border p-3 text-xs text-muted-foreground">
          <IconLoader2 className="size-3.5 animate-spin" />
          Loading schedule...
        </div>
      )}

      {!scheduleLoading && schedule && (
        <div className="flex items-start gap-2 border p-3 text-xs">
          <IconClock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          {schedule.isClosed ? (
            <p className="text-destructive">Pool is closed on this date</p>
          ) : schedule.openTime && schedule.closeTime ? (
            <p className="text-muted-foreground">
              Operating hours: {new Date(schedule.openTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              &ndash;{new Date(schedule.closeTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : null}
        </div>
      )}

      {schedule && !schedule.isClosed && !scheduleLoading && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="startTime">Start Time</label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); updateEndTime(e.target.value); }}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="endTime">End Time</label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-invalid={!!timeError}
              required
            />
          </div>
        </div>
      )}

      {timeError && (
        <p role="alert" className="text-xs text-destructive">{timeError}</p>
      )}

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Max duration: {pool.defaultMaxDuration} minutes</p>
        <p>Must book at least {pool.defaultMinAdvance} hours in advance</p>
      </div>

      {schedule && !schedule.isClosed && !scheduleLoading && (
        <Button type="submit" disabled={loading || !startTime || !endTime || !!timeError}>
          {loading ? "Booking..." : "Confirm Booking"}
        </Button>
      )}
    </form>
  );
}
