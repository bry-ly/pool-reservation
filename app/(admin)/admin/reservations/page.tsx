import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminReservations } from "@/components/pool/admin-reservations";

export default async function AdminReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/login");

  const pools = await prisma.pool.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h1 className="text-base font-medium">Recent Bookings</h1>
      </div>
      <AdminReservations pools={pools} />
    </div>
  );
}
