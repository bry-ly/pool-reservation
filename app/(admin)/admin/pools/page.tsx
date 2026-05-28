import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconEdit } from "@tabler/icons-react";
import { CreatePoolDialog } from "@/components/pool/create-pool-dialog";
import { DeletePoolButton } from "@/components/pool/delete-pool-button";

export default async function PoolsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/login");

  const pools = await prisma.pool.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between border-b pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium">Pool Inventory</h1>
          <Badge variant="secondary" className="text-[9px] font-bold">
            {pools.length} TOTAL
          </Badge>
        </div>
        <CreatePoolDialog />
      </div>

      {pools.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">No pools yet</p>
          <CreatePoolDialog />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Max (m)</TableHead>
                <TableHead className="text-center">Adv (h)</TableHead>
                <TableHead className="text-center">Can (h)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {pools.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {pool.imageUrl ? (
                        <img src={pool.imageUrl} alt="" className="size-6 object-cover border" />
                      ) : (
                        <div className="size-6 bg-muted border flex items-center justify-center text-[9px] text-muted-foreground">P</div>
                      )}
                      <span className="font-medium">{pool.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pool.isActive ? "default" : "secondary"} className="text-[9px] font-bold">
                      {pool.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{pool.defaultMaxDuration}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{pool.defaultMinAdvance}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{pool.defaultCancelWindow}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={`/admin/pools/${pool.id}`} />}>
                        <IconEdit className="size-4" />
                      </Button>
                      <DeletePoolButton poolId={pool.id} poolName={pool.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
