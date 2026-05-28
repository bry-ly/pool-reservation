import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "./user-menu";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link href="/reserve" className="flex items-center gap-2">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/reserve"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Reserve
            </Link>
            <Link
              href="/reservations"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              My Reservations
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
