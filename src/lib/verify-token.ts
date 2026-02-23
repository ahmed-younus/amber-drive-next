import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "amber-drive-secret";

interface TokenPayload {
  id: number;
  name: string;
  email: string;
}

/**
 * Verify auth from either NextAuth session (web) or Bearer token (mobile).
 * Returns user payload or null if unauthorized.
 */
export async function verifyAuth(
  req?: NextRequest
): Promise<TokenPayload | null> {
  // Try Bearer token first (mobile app)
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return payload;
      } catch {
        return null;
      }
    }
  }

  // Fall back to NextAuth session (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: Number((session.user as { id: string }).id),
      name: session.user.name || "",
      email: session.user.email || "",
    };
  }

  return null;
}
