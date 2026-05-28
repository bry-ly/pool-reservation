export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-zinc-50/80 dark:from-zinc-950 dark:to-zinc-900/80 p-6 sm:p-8">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
