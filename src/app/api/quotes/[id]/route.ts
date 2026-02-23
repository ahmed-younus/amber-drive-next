import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quote = await prisma.quote.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      quoteCars: {
        include: { car: true },
      },
    },
  });

  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  return NextResponse.json({ quote });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quoteId = parseInt(params.id);
  const body = await req.json();

  const { client_name, client_email, destination, cars } = body;

  // Update quote main fields
  const updateData: Record<string, unknown> = {};
  if (client_name !== undefined) updateData.clientName = client_name;
  if (client_email !== undefined) updateData.clientEmail = client_email;
  if (destination !== undefined) updateData.destination = destination;

  // Update car pricing
  let totalAmount = 0;
  if (cars && Array.isArray(cars)) {
    for (const carData of cars) {
      await prisma.quoteCar.updateMany({
        where: { quoteId, carId: carData.car_id },
        data: {
          customPrice: carData.custom_price,
          customKm: carData.custom_km,
          customExtraKm: carData.custom_extra_km,
          customDeposit: carData.custom_deposit,
        },
      });
      totalAmount += carData.custom_price;
    }
    updateData.totalAmount = totalAmount;
  }

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: updateData,
    include: {
      quoteCars: { include: { car: true } },
    },
  });

  return NextResponse.json({ success: true, quote });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.quote.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ success: true });
}
