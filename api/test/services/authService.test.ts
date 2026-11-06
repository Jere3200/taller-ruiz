import jwt from "jsonwebtoken";
import { createAuthService, hashPassword } from "../../src/services/authService";

const SECRET = "test-secret-with-at-least-32-characters-ok";
const users = [{ id: "u-1", name: "Daniel Ruiz", username: "daniel", passwordHash: hashPassword("correct-horse-1") }];
const make = (ttlSeconds?: number) => createAuthService({ users, jwtSecret: SECRET, ttlSeconds });

const catchError = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

describe("authService", () => {
  it("logs in with valid credentials and the token verifies", () => {
    const auth = make();
    const { token, user } = auth.login("daniel", "correct-horse-1");
    expect(user).toEqual({ id: "u-1", name: "Daniel Ruiz", role: "employee" });
    expect(auth.verify(token)).toEqual(user);
  });

  it("gives the same error for wrong password and unknown user", () => {
    const auth = make();
    const wrongPassword = catchError(() => auth.login("daniel", "x"));
    const unknownUser = catchError(() => auth.login("ghost", "x"));
    expect(wrongPassword).toMatchObject({ statusCode: 401, code: "INVALID_CREDENTIALS" });
    expect((unknownUser as Error).message).toBe((wrongPassword as Error).message);
  });

  it("rejects a tampered token", () => {
    const auth = make();
    const { token } = auth.login("daniel", "correct-horse-1");
    expect(catchError(() => auth.verify(token.slice(0, -2) + "xx"))).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ id: "u-1", name: "x", role: "employee" }, "another-secret-another-secret-123456");
    expect(catchError(() => make().verify(forged))).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an expired token", () => {
    const auth = make(-10);
    const { token } = auth.login("daniel", "correct-horse-1");
    expect(catchError(() => auth.verify(token))).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an unsigned (alg none) token", () => {
    const none = jwt.sign({ id: "u-1", name: "x", role: "employee" }, "", { algorithm: "none" });
    expect(catchError(() => make().verify(none))).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not store the password in clear", () => {
    expect(users[0]?.passwordHash).not.toContain("correct-horse-1");
  });
});
