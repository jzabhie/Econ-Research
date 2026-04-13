import { hashPassword, verifyPassword, createToken, verifyToken } from "@/lib/auth";

describe("Auth Library", () => {
  describe("hashPassword / verifyPassword", () => {
    it("should hash a password and verify it correctly", () => {
      const password = "testpassword123";
      const hash = hashPassword(password);

      expect(hash).not.toBe(password);
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject wrong password", () => {
      const hash = hashPassword("correctpassword");
      expect(verifyPassword("wrongpassword", hash)).toBe(false);
    });
  });

  describe("createToken / verifyToken", () => {
    it("should create and verify a JWT token", () => {
      const payload = { userId: 1, email: "test@test.com", role: "student" };
      const token = createToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(1);
      expect(decoded!.email).toBe("test@test.com");
      expect(decoded!.role).toBe("student");
    });

    it("should return null for invalid token", () => {
      const decoded = verifyToken("invalid.token.here");
      expect(decoded).toBeNull();
    });
  });
});
