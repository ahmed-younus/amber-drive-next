import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result: Record<string, unknown> = {};

  try {
    await prisma.$connect();
    result.db_connect = "OK";
  } catch (e: unknown) {
    result.db_connect = "FAILED";
    result.db_error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(result, { status: 500 });
  }

  try {
    const count = await prisma.adminUser.count();
    result.admin_users = count;
    result.status = "ALL OK";
  } catch (e: unknown) {
    result.query_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result);
}
