import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const db = getDb();
    const research = db.prepare("SELECT * FROM research ORDER BY created_at DESC").all();
    return NextResponse.json({ research });
  } catch (error) {
    console.error("Research fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, category, file_url, link } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(
      "INSERT INTO research (title, description, category, file_url, link) VALUES (?, ?, ?, ?, ?)"
    ).run(title, description, category || "paper", file_url || null, link || null);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Research create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
