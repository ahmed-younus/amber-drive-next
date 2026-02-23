import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalCars, activeCars, totalQuotes, draftQuotes, sentQuotes, confirmedQuotes] =
    await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { status: "active" } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "draft" } }),
      prisma.quote.count({ where: { status: "sent" } }),
      prisma.quote.count({ where: { status: "confirmed" } }),
    ]);

  const recentQuotes = await prisma.quote.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      quoteCars: {
        include: { car: true },
      },
    },
  });

  return NextResponse.json({
    total_cars: totalCars,
    active_cars: activeCars,
    total_quotes: totalQuotes,
    draft_quotes: draftQuotes,
    sent_quotes: sentQuotes,
    confirmed_quotes: confirmedQuotes,
    recent_quotes: recentQuotes,
  });
}
