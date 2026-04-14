import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const grants = db.prepare(`
      SELECT ag.*, u.name as user_name, u.email as user_email
      FROM access_grants ag
      JOIN users u ON ag.user_id = u.id
      ORDER BY ag.granted_at DESC
    `).all();
    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Access grants fetch error:", error);
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
    const { user_id, resource_type, resource_id, expires_at } = await request.json();

    if (!user_id || !resource_type) {
      return NextResponse.json({ error: "User ID and resource type are required" }, { status: 400 });
    }

    const db = getDb();

    // Verify user exists
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(user_id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = db.prepare(
      "INSERT INTO access_grants (user_id, resource_type, resource_id, expires_at) VALUES (?, ?, ?, ?)"
    ).run(user_id, resource_type, resource_id || null, expires_at || null);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Access grant create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireAdmin(request.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Grant ID is required" }, { status: 400 });
    }

    const db = getDb();
    db.prepare("DELETE FROM access_grants WHERE id = ?").run(id);
    return NextResponse.json({ message: "Access revoked" });
  } catch (error) {
    console.error("Access revoke error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
