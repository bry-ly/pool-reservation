"use client";

import Image from "next/image";
import { useSignout } from "@/hooks/use-signout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLogout } from "@tabler/icons-react";

export function UserMenu({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const signout = useSignout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton className="flex items-center gap-2 outline-none">
        {image ? (
          <img src={image} alt={name} className="size-7 object-cover bg-muted" />
        ) : (
          <div className="flex size-7 items-center justify-center bg-muted text-xs font-medium">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signout}>
          <IconLogout className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
