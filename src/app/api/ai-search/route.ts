import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGroq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Get all active cars
  const cars = await prisma.car.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      brand: true,
      category: true,
      defaultPrice: true,
    },
  });

  // Build car list for AI
  const carList = cars
    .map(
      (c) =>
        `${c.id}|${c.name}|${c.brand}|${c.category}|${Number(c.defaultPrice)}`
    )
    .join("\n");

  const systemPrompt = `You are a car selection assistant for Amber Drive luxury car rental.
Available cars (ID|Name|Brand|Category|Price):
${carList}

Based on the user's request, return a JSON object with "car_ids" array containing the IDs of matching cars.
Only return cars that match. If unsure, return the closest matches.
Return ONLY valid JSON: {"car_ids": [1, 2, 3]}`;

  try {
    const result = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ]);

    const parsed = JSON.parse(result);
    return NextResponse.json({
      car_ids: parsed.car_ids || [],
      message: parsed.message || "",
    });
  } catch {
    return NextResponse.json(
      { error: "AI search failed. Try again." },
      { status: 500 }
    );
  }
}
