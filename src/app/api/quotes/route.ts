import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-token";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { clientName: { contains: search } },
      { quoteNumber: { contains: search } },
      { destination: { contains: search } },
    ];
  }

  const quotes = await prisma.quote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      quoteCars: {
        include: { car: true },
      },
    },
  });

  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    client_name,
    client_email,
    quote_date,
    destination,
    selected_cars,
    car_pricing,
  } = body;

  if (!selected_cars || selected_cars.length === 0) {
    return NextResponse.json({ error: "Select at least one car" }, { status: 400 });
  }

  // Generate quote number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const hash = crypto.randomBytes(3).toString("hex").toUpperCase();
  const quoteNumber = `QT-${dateStr}-${hash}`;

  // Fetch car defaults
  const cars = await prisma.car.findMany({
    where: { id: { in: selected_cars } },
  });

  let totalAmount = 0;
  const quoteCarsData = cars.map((car) => {
    const pricing = car_pricing?.[car.id];
    const price = pricing?.price ?? Number(car.defaultPrice);
    const km = pricing?.km ?? car.defaultKm;
    const extraKm = pricing?.extra_km ?? Number(car.defaultExtraKm);
    const deposit = pricing?.deposit ?? Number(car.defaultDeposit);
    totalAmount += price;
    return {
      carId: car.id,
      customPrice: price,
      customKm: km,
      customExtraKm: extraKm,
      customDeposit: deposit,
    };
  });

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      clientName: client_name || "",
      clientEmail: client_email || null,
      quoteDate: new Date(quote_date || new Date()),
      destination: destination || null,
      totalAmount,
      status: "draft",
      quoteCars: {
        create: quoteCarsData,
      },
    },
    include: {
      quoteCars: { include: { car: true } },
    },
  });

  return NextResponse.json({ success: true, quote });
}
