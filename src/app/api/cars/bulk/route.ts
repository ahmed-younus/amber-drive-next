import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  if (action === "archive") {
    await prisma.car.updateMany({
      where: { id: { in: ids } },
      data: { status: "archived" },
    });
  } else if (action === "restore") {
    await prisma.car.updateMany({
      where: { id: { in: ids } },
      data: { status: "active" },
    });
  } else if (action === "delete") {
    // Delete image files first
    const cars = await prisma.car.findMany({
      where: { id: { in: ids } },
      select: { image: true },
    });

    for (const car of cars) {
      if (car.image) {
        const imgPath = join(process.cwd(), "public", "uploads", "cars", car.image);
        if (existsSync(imgPath)) {
          await unlink(imgPath).catch(() => {});
        }
      }
    }

    await prisma.car.deleteMany({ where: { id: { in: ids } } });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
