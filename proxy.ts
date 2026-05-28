import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" },
    },
  },
});

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  const isUserAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isAdminLogin;
  const isUserPage = pathname.startsWith("/reserve") || pathname.startsWith("/reservations");

  if (!session) {
    if (isUserAuthPage || isAdminLogin) return NextResponse.next();
    if (isAdminPage) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserAuthPage) {
    return NextResponse.redirect(new URL("/reserve", request.url));
  }

  if (isAdminLogin) {
    if (session.user.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.redirect(new URL("/reserve", request.url));
  }

  if (isAdminPage && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/reserve", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
