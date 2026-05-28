import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ScheduleManager } from "@/components/pool/schedule-manager";
import { IconPool, IconPlus } from "@tabler/icons-react";

export default async function SchedulePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/login");

  const pools = await prisma.pool.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  if (pools.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center bg-muted">
          <IconPool className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-medium">No pools yet</h2>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Create a pool first to manage its schedule.
        </p>
        <Link
          href="/admin/pools/new"
          className="mt-4 inline-flex items-center gap-1.5 border bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <IconPlus className="size-3.5" />
          Create pool
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ScheduleManager pools={pools} />
    </div>
  );
}
