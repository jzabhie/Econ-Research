import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin, getTokenFromHeader } from "@/lib/auth";

interface ExamRow {
  id: number;
  course_id: number | null;
  title: string;
  description: string | null;
  questions: string;
  start_time: string | null;
  end_time: string | null;
  is_active: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const user = getTokenFromHeader(request.headers.get("authorization"));

    if (user?.role === "admin") {
      const exams = db.prepare("SELECT * FROM exams ORDER BY created_at DESC").all();
      return NextResponse.json({ exams });
    }

    // Students only see active exams
    const exams = db.prepare(
      "SELECT id, course_id, title, description, start_time, end_time, is_active, created_at FROM exams WHERE is_active = 1"
    ).all() as ExamRow[];

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("Exams fetch error:", error);
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
    const { course_id, title, description, questions, start_time, end_time, is_active } = await request.json();

    if (!title || !questions) {
      return NextResponse.json({ error: "Title and questions are required" }, { status: 400 });
    }

    const db = getDb();
    const questionsStr = typeof questions === "string" ? questions : JSON.stringify(questions);
    const result = db.prepare(
      "INSERT INTO exams (course_id, title, description, questions, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(course_id || null, title, description || null, questionsStr, start_time || null, end_time || null, is_active ? 1 : 0);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Exam create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
