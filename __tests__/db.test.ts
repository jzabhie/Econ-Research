import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

describe("Database", () => {
  let db: Database.Database;
  const testDbPath = path.join("/tmp", "test-econ-research.db");

  beforeAll(() => {
    // Remove test db if it exists
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

    db = new Database(testDbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS research (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'paper',
        file_url TEXT,
        link TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT NOT NULL,
        semester TEXT,
        materials TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        questions TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        answers TEXT NOT NULL,
        submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS access_grants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id INTEGER,
        granted_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it("should create users", () => {
    const result = db.prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)"
    ).run("test@test.com", "hash123", "Test User", "student");

    expect(result.changes).toBe(1);
    expect(result.lastInsertRowid).toBe(1);
  });

  it("should enforce unique email constraint", () => {
    expect(() => {
      db.prepare(
        "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)"
      ).run("test@test.com", "hash456", "Another User", "student");
    }).toThrow();
  });

  it("should create research items", () => {
    const result = db.prepare(
      "INSERT INTO research (title, description, category) VALUES (?, ?, ?)"
    ).run("Test Paper", "Description", "paper");

    expect(result.changes).toBe(1);
  });

  it("should create courses", () => {
    const result = db.prepare(
      "INSERT INTO courses (title, code, description, semester) VALUES (?, ?, ?, ?)"
    ).run("Test Course", "TEST101", "Description", "Spring 2026");

    expect(result.changes).toBe(1);
  });

  it("should create exams linked to courses", () => {
    const questions = JSON.stringify([{ id: 1, text: "Q1?", type: "essay" }]);
    const result = db.prepare(
      "INSERT INTO exams (course_id, title, questions, is_active) VALUES (?, ?, ?, ?)"
    ).run(1, "Test Exam", questions, 1);

    expect(result.changes).toBe(1);
  });

  it("should create submissions linked to exams and users", () => {
    const answers = JSON.stringify({ 1: "Answer to Q1" });
    const result = db.prepare(
      "INSERT INTO submissions (exam_id, user_id, answers) VALUES (?, ?, ?)"
    ).run(1, 1, answers);

    expect(result.changes).toBe(1);
  });

  it("should create and query access grants", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    db.prepare(
      "INSERT INTO access_grants (user_id, resource_type, resource_id, expires_at) VALUES (?, ?, ?, ?)"
    ).run(1, "exam", 1, futureDate);

    const now = new Date().toISOString();
    const grant = db.prepare(
      "SELECT * FROM access_grants WHERE user_id = ? AND resource_type = ? AND (expires_at IS NULL OR expires_at > ?)"
    ).get(1, "exam", now) as { user_id: number; resource_type: string } | undefined;

    expect(grant).toBeDefined();
    expect(grant!.user_id).toBe(1);
    expect(grant!.resource_type).toBe("exam");
  });

  it("should not return expired access grants", () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    db.prepare(
      "INSERT INTO access_grants (user_id, resource_type, resource_id, expires_at) VALUES (?, ?, ?, ?)"
    ).run(1, "notebook", null, pastDate);

    const now = new Date().toISOString();
    const grant = db.prepare(
      "SELECT * FROM access_grants WHERE user_id = ? AND resource_type = ? AND (expires_at IS NULL OR expires_at > ?)"
    ).get(1, "notebook", now);

    expect(grant).toBeUndefined();
  });
});
