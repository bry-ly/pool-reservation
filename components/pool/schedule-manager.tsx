"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconChevronLeft, IconChevronRight, IconX, IconPlus } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Pool = { id: string; name: string };
type Override = {
  id: string;
  poolId: string;
  date: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function ScheduleManager({ pools }: { pools: Pool[] }) {
  const router = useRouter();
  const [selectedPoolId, setSelectedPoolId] = useState(pools[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [isClosed, setIsClosed] = useState(false);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const calDays = useMemo(() => {
    const days = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    return { days, firstDay };
  }, [calYear, calMonth]);

  const overrideDates = useMemo(() => {
    const map: Record<string, Override> = {};
    overrides.forEach((ov) => {
      const d = new Date(ov.date).toLocaleDateString("en-CA");
      map[d] = ov;
    });
    return map;
  }, [overrides]);

  async function loadOverrides() {
    if (!selectedPoolId) return;
    const res = await fetch(`/api/admin/schedule?poolId=${selectedPoolId}`);
    if (res.ok) {
      setOverrides(await res.json());
    }
  }

  useEffect(() => {
    loadOverrides();
  }, [selectedPoolId]);

  async function handleDelete() {
    if (!deletingId) return;
    const res = await fetch(`/api/admin/schedule`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deletingId }),
    });
    setDeletingId(null);
    if (res.ok) {
      toast.success("Override removed");
      loadOverrides();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to remove override");
    }
  }

  function resetForm() {
    setDate("");
    setOpenTime("09:00");
    setCloseTime("18:00");
    setIsClosed(false);
    setError("");
  }

  function openFormForDate(d: string) {
    resetForm();
    setDate(d);
    setShowForm(true);
  }

  function openFormEmpty() {
    resetForm();
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPoolId || !date) return;
    setError("");
    setLoading(true);

    const openDateTime = `${date}T${openTime}:00`;
    const closeDateTime = `${date}T${closeTime}:00`;

    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poolId: selectedPoolId,
        date,
        openTime: isClosed ? null : openDateTime,
        closeTime: isClosed ? null : closeDateTime,
        isClosed,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save schedule");
      setLoading(false);
      return;
    }

    toast.success("Schedule saved");
    resetForm();
    setShowForm(false);
    setLoading(false);
    loadOverrides();
    router.refresh();
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  }

  function selectDate(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDate(d);
    if (!showForm) {
      setShowForm(true);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-base font-medium">Schedule & Overrides</h2>
        <select
          value={selectedPoolId}
          onChange={(e) => setSelectedPoolId(e.target.value)}
          className="text-[10px] font-bold uppercase tracking-widest outline-none border-0 bg-transparent"
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>{pool.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar */}
        <div className="border p-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold">{MONTH_NAMES[calMonth].toUpperCase()} {calYear}</span>
            <div className="flex gap-2">
              <button type="button" onClick={prevMonth} className="hover:text-primary">
                <IconChevronLeft className="size-3" />
              </button>
              <button type="button" onClick={nextMonth} className="hover:text-primary">
                <IconChevronRight className="size-3" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="text-[8px] text-muted-foreground mb-1 font-bold">{d}</div>
            ))}
            {Array.from({ length: calDays.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: calDays.days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const ov = overrideDates[dateStr];
              const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
              const isSelected = date === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`text-[9px] py-1 border transition-colors ${
                    ov?.isClosed
                      ? "border-destructive/50 text-destructive font-bold bg-destructive/5"
                      : ov
                      ? "border-primary/50 text-primary font-bold bg-primary/10"
                      : isSelected
                      ? "border-primary font-bold"
                      : isToday
                      ? "border-foreground font-bold"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overrides list + form */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
          <div className="border-b pb-1 mb-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Active Overrides</p>
          </div>

          {overrides.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No overrides set yet.</p>
          ) : (
            overrides.map((ov) => (
              <div
                key={ov.id}
                className={`flex items-center justify-between p-2 border-l-2 ${
                  ov.isClosed ? "border-destructive bg-destructive/5" : "border-primary bg-muted/10"
                }`}
              >
                <div className="text-[10px]">
                  <p className={`font-bold ${ov.isClosed ? "text-destructive" : ""}`}>
                    {new Date(ov.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-muted-foreground">
                    {ov.isClosed ? "CLOSED ALL DAY" : (
                      <>
                        {ov.openTime && new Date(ov.openTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        &ndash;
                        {ov.closeTime && new Date(ov.closeTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </>
                    )}
                  </p>
                </div>
                <button type="button" onClick={() => setDeletingId(ov.id)} className="text-muted-foreground hover:text-foreground">
                  <IconX className="size-3" />
                </button>
              </div>
            ))
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-3 border p-3 mt-2">
              {error && (
                <div className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">Date</p>
                {date ? (
                  <p className="text-xs font-medium">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Click a date on the calendar</p>
                )}
              </div>
              {!isClosed && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase" htmlFor="sm-open">Open</label>
                    <Input id="sm-open" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase" htmlFor="sm-close">Close</label>
                    <Input id="sm-close" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase">
                <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} className="size-3" />
                Closed all day
              </label>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading || !date} className="text-[10px]">
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }} className="text-[10px]">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={openFormEmpty}
              className="mt-auto border border-dashed py-2 text-[10px] font-bold uppercase tracking-widest hover:border-primary transition-colors"
            >
              <IconPlus className="size-3 inline mr-1" />
              Add Override
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove override</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this schedule override? The pool will revert to no schedule for this date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
