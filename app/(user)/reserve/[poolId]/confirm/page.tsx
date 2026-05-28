import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { IconCircleCheck, IconArrowLeft, IconCalendarPlus } from "@tabler/icons-react";

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ reservationId?: string }>;
}) {
  const { poolId } = await params;
  const { reservationId } = await searchParams;

  if (!reservationId) redirect(`/reserve/${poolId}`);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { pool: { select: { name: true, description: true, address: true } } },
  });

  if (!reservation || reservation.userId !== session.user.id) notFound();

  const start = new Date(reservation.startTime);
  const end = new Date(reservation.endTime);

  return (
    <div className="flex flex-1 flex-col items-center py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <IconCircleCheck className="size-8 text-primary" />
      </div>
      <h1 className="text-lg font-medium">Reservation Confirmed</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Your pool booking has been successfully created.
      </p>

      <div className="mt-6 w-full max-w-sm space-y-4 text-left">
        <div className="border p-4">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Pool</p>
              <p className="text-sm font-medium">{reservation.pool.name}</p>
              {reservation.pool.address && (
                <p className="text-xs text-muted-foreground">{reservation.pool.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Date</p>
                <p className="text-sm">{start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Time</p>
                <p className="text-sm">
                  {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  &ndash;
                  {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Duration</p>
              <p className="text-sm">{Math.round((end.getTime() - start.getTime()) / 60000)} minutes</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/reservations"
            className="inline-flex items-center justify-center gap-2 border bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <IconCalendarPlus className="size-3.5" />
            View my reservations
          </Link>
          <Link
            href="/reserve"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-3.5" />
            Book another pool
          </Link>
        </div>
      </div>
    </div>
  );
}
