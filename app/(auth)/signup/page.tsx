"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { IconArrowRight } from "@tabler/icons-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to create account");
      setLoading(false);
      return;
    }

    toast.success("Account created successfully");
    router.replace("/reserve");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-10 flex flex-col items-center">
        <Logo className="mb-4 h-7 text-foreground" />
      </div>

      <div className="w-full border border-border bg-white dark:bg-black/40 p-8 sm:p-10 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
        <div className="mb-8">
          <h1 className="font-heading mb-2 text-2xl font-medium tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Get started with SWIM pool reservations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-muted-foreground/80 text-[11px] font-semibold uppercase tracking-wider" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground/80 text-[11px] font-semibold uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground/80 text-[11px] font-semibold uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:border-foreground"
            />
            <p className="text-[10px] text-muted-foreground">Minimum 8 characters</p>
          </div>

          <Button type="submit" className="mt-8 flex h-12 w-full items-center justify-center gap-2 text-sm font-medium" disabled={loading}>
            <span>{loading ? "Creating account..." : "Create account"}</span>
            {!loading && <IconArrowRight className="size-4" />}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 decoration-2 decoration-zinc-300 transition-all hover:underline dark:decoration-zinc-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
