import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  await prisma.quote.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ success: true });
}
