import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";
  const search = searchParams.get("search") || "";
  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = {};

  if (status === "archived") {
    where.status = "archived";
  } else {
    where.status = { in: ["active", "inactive"] };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (brand) where.brand = brand;
  if (category) where.category = category;

  const cars = await prisma.car.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Get unique brands for filter
  const brands = await prisma.car.findMany({
    select: { brand: true },
    distinct: ["brand"],
    where: { status: { not: "archived" } },
    orderBy: { brand: "asc" },
  });

  return NextResponse.json({
    cars: cars.map((c) => ({
      ...c,
      default_price: Number(c.defaultPrice),
      default_km: c.defaultKm,
      default_extra_km: Number(c.defaultExtraKm),
      default_deposit: Number(c.defaultDeposit),
    })),
    brands: brands.map((b) => b.brand),
  });
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const category = formData.get("category") as string;
  const defaultPrice = parseFloat(formData.get("default_price") as string) || 0;
  const defaultKm = parseInt(formData.get("default_km") as string) || 0;
  const defaultExtraKm = parseFloat(formData.get("default_extra_km") as string) || 0;
  const defaultDeposit = parseFloat(formData.get("default_deposit") as string) || 0;
  const description = (formData.get("description") as string) || null;
  const status = (formData.get("status") as string) || "active";

  if (!name || !brand || !category) {
    return NextResponse.json({ error: "Name, brand, and category are required" }, { status: 400 });
  }

  // Handle image upload
  let imageName = "";
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const uploadDir = join(process.cwd(), "public", "uploads", "cars");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowed = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    imageName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(join(uploadDir, imageName), buffer);
  }

  const car = await prisma.car.create({
    data: {
      name,
      brand,
      category,
      image: imageName,
      defaultPrice,
      defaultKm,
      defaultExtraKm,
      defaultDeposit,
      description,
      status,
    },
  });

  return NextResponse.json({ success: true, car });
}
