import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { invalidCredentials, unauthorized } from "../domain/errors";

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  /** "salt:hash", both hex */
  passwordHash: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: "employee";
}

export interface AuthService {
  login(username: string, password: string): { token: string; user: AuthenticatedUser };
  verify(token: string): AuthenticatedUser;
}

const KEY_LENGTH = 64;
const TOKEN_TTL_SECONDS = 8 * 60 * 60;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, KEY_LENGTH).toString("hex")}`;
}

function matches(password: string, stored: string): boolean {
  const [saltHex = "", hashHex = ""] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface AuthOptions {
  users: StaffUser[];
  jwtSecret: string;
  ttlSeconds?: number;
}

export function createAuthService({ users, jwtSecret, ttlSeconds = TOKEN_TTL_SECONDS }: AuthOptions): AuthService {
  // Compared against when the user does not exist, so timing does not reveal valid usernames.
  const decoyHash = hashPassword(randomBytes(8).toString("hex"));

  return {
    login(username, password) {
      const user = users.find((u) => u.username === username);
      const ok = matches(password, user?.passwordHash ?? decoyHash);
      if (!user || !ok) throw invalidCredentials();

      const authenticated: AuthenticatedUser = { id: user.id, name: user.name, role: "employee" };
      const token = jwt.sign(authenticated, jwtSecret, { algorithm: "HS256", expiresIn: ttlSeconds, subject: user.id });
      return { token, user: authenticated };
    },

    verify(token) {
      try {
        const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
        if (typeof payload === "string" || payload.role !== "employee") throw new Error("bad payload");
        return { id: String(payload.id), name: String(payload.name), role: "employee" };
      } catch {
        throw unauthorized();
      }
    },
  };
}
