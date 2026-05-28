export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-teal-50/80 dark:from-zinc-950 dark:to-teal-950/30 p-6 sm:p-8">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
