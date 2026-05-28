"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconPool, IconCalendarEvent } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/reserve", label: "Reserve", icon: IconPool },
  { href: "/reservations", label: "My Bookings", icon: IconCalendarEvent },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-[10px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
