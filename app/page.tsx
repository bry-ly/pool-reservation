import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconPool, IconClock, IconCalendarEvent } from "@tabler/icons-react";

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/reserve");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-teal-50/80 dark:from-zinc-950 dark:to-teal-950/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Logo className="h-6 text-foreground" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
          Book your next pool session
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Browse available pools, pick a time that works, and confirm your
          booking in seconds. Simple, fast, no hassle.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            Sign In
          </Link>
        </div>

        {/* How It Works */}
        <div className="mt-24 grid max-w-2xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center bg-foreground/5">
              <IconPool className="size-6 text-foreground" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">
              Browse Pools
            </p>
            <p className="text-xs text-muted-foreground">
              View available pools with schedules and details
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center bg-foreground/5">
              <IconClock className="size-6 text-foreground" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">
              Pick a Time
            </p>
            <p className="text-xs text-muted-foreground">
              Select an open time slot that fits your schedule
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center bg-foreground/5">
              <IconCalendarEvent className="size-6 text-foreground" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">
              Book Instantly
            </p>
            <p className="text-xs text-muted-foreground">
              Confirm your reservation and you are all set
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-[10px] text-muted-foreground">
        &copy; {new Date().getFullYear()} SWIM. All rights reserved.
      </footer>
    </div>
  );
}
