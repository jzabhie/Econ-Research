import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTokenFromHeader } from "@/lib/auth";

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = getTokenFromHeader(request.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const dbUser = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(user.userId) as UserRow | undefined;

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
