/**
 * Seed script to create initial admin user and sample data.
 * Run with: npx tsx scripts/seed.ts
 */

import Database from "better-sqlite3";
import bcryptjs from "bcryptjs";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
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

// Create admin user
const adminPassword = bcryptjs.hashSync("admin123", 10);
const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@econresearch.edu");
if (!existingAdmin) {
  db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)").run(
    "admin@econresearch.edu",
    adminPassword,
    "Admin Professor",
    "admin"
  );
  console.log("✅ Admin user created: admin@econresearch.edu / admin123");
} else {
  console.log("ℹ️  Admin user already exists");
}

// Add sample research
const researchCount = (db.prepare("SELECT COUNT(*) as c FROM research").get() as { c: number }).c;
if (researchCount === 0) {
  db.prepare("INSERT INTO research (title, description, category, link) VALUES (?, ?, ?, ?)").run(
    "Impact of Monetary Policy on Inflation",
    "An empirical study examining the relationship between central bank interest rate decisions and consumer price index changes across 20 economies from 2000-2024.",
    "paper",
    "https://example.com/paper1"
  );
  db.prepare("INSERT INTO research (title, description, category) VALUES (?, ?, ?)").run(
    "GDP Growth Prediction Model",
    "Python-based machine learning model for predicting quarterly GDP growth rates using leading economic indicators.",
    "code"
  );
  db.prepare("INSERT INTO research (title, description, category) VALUES (?, ?, ?)").run(
    "International Trade Dataset",
    "Comprehensive dataset covering bilateral trade flows between 150 countries from 1990-2024, including tariff rates and trade agreements.",
    "data"
  );
  console.log("✅ Sample research items added");
}

// Add sample course
const courseCount = (db.prepare("SELECT COUNT(*) as c FROM courses").get() as { c: number }).c;
if (courseCount === 0) {
  db.prepare("INSERT INTO courses (title, code, description, semester) VALUES (?, ?, ?, ?)").run(
    "Introduction to Microeconomics",
    "ECON 101",
    "Fundamental concepts of microeconomics including supply and demand, market structures, consumer behavior, and market failures.",
    "Spring 2026"
  );
  db.prepare("INSERT INTO courses (title, code, description, semester) VALUES (?, ?, ?, ?)").run(
    "Econometrics",
    "ECON 421",
    "Statistical methods for analyzing economic data, including regression analysis, time series, and panel data techniques.",
    "Spring 2026"
  );
  console.log("✅ Sample courses added");
}

// Add sample exam
const examCount = (db.prepare("SELECT COUNT(*) as c FROM exams").get() as { c: number }).c;
if (examCount === 0) {
  const questions = JSON.stringify([
    { id: 1, text: "Define and explain the law of demand. Provide a real-world example.", type: "essay" },
    { id: 2, text: "What is the difference between a normal good and an inferior good?", type: "essay" },
    { id: 3, text: "Explain the concept of elasticity and why it matters for pricing decisions.", type: "essay" },
  ]);
  db.prepare("INSERT INTO exams (course_id, title, description, questions, is_active) VALUES (?, ?, ?, ?, ?)").run(
    1,
    "Midterm Exam - Microeconomics",
    "Covers chapters 1-6 on supply, demand, and market equilibrium.",
    questions,
    1
  );
  console.log("✅ Sample exam added");
}

db.close();
console.log("\n🎉 Database seeded successfully!");
console.log("   Database location:", DB_PATH);
console.log("   Login: admin@econresearch.edu / admin123");
