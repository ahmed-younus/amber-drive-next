import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();

  const quote = await prisma.quote.update({
    where: { id: parseInt(params.id) },
    data: { status },
  });

  return NextResponse.json({ success: true, quote });
}
