import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, description, address, imageUrl, isActive, defaultMaxDuration, defaultMinAdvance, defaultCancelWindow } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const pool = await prisma.pool.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      address: address?.trim() || null,
      imageUrl: imageUrl || null,
      isActive: isActive ?? true,
      defaultMaxDuration: defaultMaxDuration ?? 240,
      defaultMinAdvance: defaultMinAdvance ?? 2,
      defaultCancelWindow: defaultCancelWindow ?? 1,
    },
  });

  return NextResponse.json(pool);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.pool.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
