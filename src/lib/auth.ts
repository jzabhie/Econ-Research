import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { getDb } from "./db";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable must be set in production");
  }
  return "econ-research-dev-secret-do-not-use-in-production";
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function hashPassword(password: string): string {
  return bcryptjs.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcryptjs.compareSync(password, hash);
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export function requireAdmin(authHeader: string | null): TokenPayload {
  const user = getTokenFromHeader(authHeader);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return user;
}

export function checkAccess(userId: number, resourceType: string, resourceId?: number): boolean {
  const db = getDb();
  const now = new Date().toISOString();

  const grant = db.prepare(`
    SELECT * FROM access_grants
    WHERE user_id = ? AND resource_type = ?
    AND (resource_id IS NULL OR resource_id = ?)
    AND (expires_at IS NULL OR expires_at > ?)
  `).get(userId, resourceType, resourceId ?? null, now);

  return !!grant;
}
