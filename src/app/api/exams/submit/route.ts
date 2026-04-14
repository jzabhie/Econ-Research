import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTokenFromHeader, checkAccess } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = getTokenFromHeader(request.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exam_id, answers } = await request.json();

    if (!exam_id || !answers) {
      return NextResponse.json({ error: "Exam ID and answers are required" }, { status: 400 });
    }

    const db = getDb();

    // Check exam exists and is active
    const exam = db.prepare("SELECT * FROM exams WHERE id = ? AND is_active = 1").get(exam_id) as { end_time: string | null } | undefined;
    if (!exam) {
      return NextResponse.json({ error: "Exam not found or not active" }, { status: 404 });
    }

    // Check time window
    if (exam.end_time && new Date(exam.end_time) < new Date()) {
      return NextResponse.json({ error: "Exam submission period has ended" }, { status: 403 });
    }

    // Check access grant
    const hasAccess = user.role === "admin" || checkAccess(user.userId, "exam", exam_id);
    if (!hasAccess) {
      return NextResponse.json({ error: "You do not have access to this exam" }, { status: 403 });
    }

    // Check for existing submission
    const existing = db.prepare("SELECT id FROM submissions WHERE exam_id = ? AND user_id = ?").get(exam_id, user.userId);
    if (existing) {
      // Update existing submission
      db.prepare("UPDATE submissions SET answers = ?, submitted_at = datetime('now') WHERE exam_id = ? AND user_id = ?")
        .run(typeof answers === "string" ? answers : JSON.stringify(answers), exam_id, user.userId);
      return NextResponse.json({ message: "Submission updated" });
    }

    const answersStr = typeof answers === "string" ? answers : JSON.stringify(answers);
    db.prepare("INSERT INTO submissions (exam_id, user_id, answers) VALUES (?, ?, ?)")
      .run(exam_id, user.userId, answersStr);

    return NextResponse.json({ message: "Submission successful" }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
