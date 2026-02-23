import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const car = await prisma.car.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  return NextResponse.json({
    ...car,
    default_price: Number(car.defaultPrice),
    default_km: car.defaultKm,
    default_extra_km: Number(car.defaultExtraKm),
    default_deposit: Number(car.defaultDeposit),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const carId = parseInt(params.id);
  const existing = await prisma.car.findUnique({ where: { id: carId } });
  if (!existing) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  const formData = await req.formData();

  const updateData: Record<string, unknown> = {
    name: formData.get("name") as string,
    brand: formData.get("brand") as string,
    category: formData.get("category") as string,
    defaultPrice: parseFloat(formData.get("default_price") as string) || 0,
    defaultKm: parseInt(formData.get("default_km") as string) || 0,
    defaultExtraKm: parseFloat(formData.get("default_extra_km") as string) || 0,
    defaultDeposit: parseFloat(formData.get("default_deposit") as string) || 0,
    description: (formData.get("description") as string) || null,
    status: (formData.get("status") as string) || existing.status,
  };

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const uploadDir = join(process.cwd(), "public", "uploads", "cars");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const imageName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(join(uploadDir, imageName), buffer);

    // Delete old image
    if (existing.image) {
      const oldPath = join(uploadDir, existing.image);
      if (existsSync(oldPath)) {
        await unlink(oldPath).catch(() => {});
      }
    }

    updateData.image = imageName;
  }

  const car = await prisma.car.update({
    where: { id: carId },
    data: updateData,
  });

  return NextResponse.json({ success: true, car });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const carId = parseInt(params.id);
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  // Delete image file
  if (car.image) {
    const imgPath = join(process.cwd(), "public", "uploads", "cars", car.image);
    if (existsSync(imgPath)) {
      await unlink(imgPath).catch(() => {});
    }
  }

  await prisma.car.delete({ where: { id: carId } });
  return NextResponse.json({ success: true });
}
