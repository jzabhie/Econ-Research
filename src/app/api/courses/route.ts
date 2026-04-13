import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const db = getDb();
    const courses = db.prepare("SELECT * FROM courses ORDER BY created_at DESC").all();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses fetch error:", error);
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
    const { title, code, description, semester, materials } = await request.json();

    if (!title || !code || !description) {
      return NextResponse.json({ error: "Title, code, and description are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(
      "INSERT INTO courses (title, code, description, semester, materials) VALUES (?, ?, ?, ?, ?)"
    ).run(title, code, description, semester || null, materials || null);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Course create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
