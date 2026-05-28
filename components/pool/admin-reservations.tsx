"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IconPool, IconCircleX } from "@tabler/icons-react";
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
type Reservation = {
  id: string;
  poolId: string;
  startTime: string;
  endTime: string;
  status: string;
  cancelledAt: string | null;
  pool: { name: string };
  user: { name: string; email: string };
};

export function AdminReservations({ pools }: { pools: Pool[] }) {
  const router = useRouter();
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  function loadReservations() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPoolId) params.set("poolId", selectedPoolId);
    if (statusFilter) params.set("status", statusFilter);
    if (dateFilter) params.set("date", dateFilter);

    fetch(`/api/admin/reservations?${params.toString()}`)
      .then((r) => r.json())
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReservations();
  }, [selectedPoolId, statusFilter, dateFilter]);

  async function handleCancel() {
    if (!cancellingId) return;
    const res = await fetch(`/api/admin/reservations/${cancellingId}/cancel`, { method: "POST" });
    setCancellingId(null);
    if (res.ok) {
      toast.success("Reservation cancelled");
      loadReservations();
    } else {
      toast.error("Failed to cancel reservation");
    }
  }

  const filtered = search
    ? reservations.filter(
        (r) =>
          r.user.name.toLowerCase().includes(search.toLowerCase()) ||
          r.user.email.toLowerCase().includes(search.toLowerCase()) ||
          r.pool.name.toLowerCase().includes(search.toLowerCase())
      )
    : reservations;

  return (
    <div className="space-y-4">
      {/* Unified filter bar */}
      <div className="flex items-center gap-2 p-1 border bg-muted/10">
        <div className="flex items-center gap-1 border-r pr-2">
          <Input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-32 h-6 border-0 text-[10px] bg-transparent focus-visible:ring-0"
          />
        </div>
        <select
          value={selectedPoolId}
          onChange={(e) => setSelectedPoolId(e.target.value)}
          className="text-[10px] border-0 h-6 bg-transparent outline-none"
        >
          <option value="">Any Pool</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-[10px] border-0 h-6 bg-transparent outline-none"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-6 border-0 text-[10px] bg-transparent ml-auto w-auto focus-visible:ring-0"
        />
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No reservations found.</p>
      ) : (
        <div className="bg-border border overflow-hidden">
          {filtered.map((r) => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            const isConfirmed = r.status === "confirmed";
            return (
              <div
                key={r.id}
                className={`bg-background flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors group ${
                  !isConfirmed ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-7 flex items-center justify-center ${isConfirmed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <IconPool className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">{r.pool.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-tight">
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" - "}
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-medium">{r.user.name}</p>
                  <p className="text-[9px] text-muted-foreground">{r.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={isConfirmed ? "default" : "secondary"}
                    className="text-[8px] font-bold"
                  >
                    {r.status}
                  </Badge>
                  {isConfirmed && (
                    <button
                      type="button"
                      onClick={() => setCancellingId(r.id)}
                      className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconCircleX className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!cancellingId} onOpenChange={(open) => { if (!open) setCancellingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleCancel}>
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
