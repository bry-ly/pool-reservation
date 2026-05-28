import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { PoolForm } from "@/components/pool/pool-form";
import { notFound } from "next/navigation";

export default async function EditPoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/login");

  const { id } = await params;
  const pool = await prisma.pool.findUnique({ where: { id } });
  if (!pool) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">Edit Pool</h1>
        <p className="text-xs text-muted-foreground">{pool.name}</p>
      </div>
      <PoolForm
        pool={{
          id: pool.id,
          name: pool.name,
          description: pool.description ?? "",
          address: pool.address ?? "",
          imageUrl: pool.imageUrl,
          isActive: pool.isActive,
          defaultMaxDuration: pool.defaultMaxDuration,
          defaultMinAdvance: pool.defaultMinAdvance,
          defaultCancelWindow: pool.defaultCancelWindow,
        }}
      />
    </div>
  );
}
