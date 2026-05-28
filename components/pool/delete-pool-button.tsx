"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
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

export function DeletePoolButton({ poolId, poolName }: { poolId: string; poolName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/pools/${poolId}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      toast.error("Failed to delete pool");
      return;
    }

    toast.success("Pool deleted");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <IconTrash className="size-4 text-destructive" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pool</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{poolName}&rdquo;? This will also remove all its reservations and schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
