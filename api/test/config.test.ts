import { loadConfig } from "../src/config";

const VALID = {
  JWT_SECRET: "test-secret-with-at-least-32-characters-ok",
  DEMO_USER: "tester",
  DEMO_PASSWORD: "test-password-123",
};

describe("loadConfig", () => {
  it("applies safe defaults for the optional settings", () => {
    const config = loadConfig(VALID);

    expect(config).toMatchObject({ PORT: 4000, CORS_ORIGIN: "http://localhost:3000", TRUST_PROXY: 0, TRACKING_LIMIT: 60 });
  });

  it("reads the proxy and limit settings as numbers", () => {
    const config = loadConfig({ ...VALID, TRUST_PROXY: "1", TRACKING_LIMIT: "300" });

    expect(config).toMatchObject({ TRUST_PROXY: 1, TRACKING_LIMIT: 300 });
  });

  it("refuses to start without a signing secret", () => {
    expect(() => loadConfig({ ...VALID, JWT_SECRET: undefined })).toThrow(/JWT_SECRET/);
  });

  it("refuses a short signing secret", () => {
    expect(() => loadConfig({ ...VALID, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
  });

  it("rejects a negative proxy count", () => {
    expect(() => loadConfig({ ...VALID, TRUST_PROXY: "-1" })).toThrow(/TRUST_PROXY/);
  });

  it("rejects a tracking limit below one", () => {
    expect(() => loadConfig({ ...VALID, TRACKING_LIMIT: "0" })).toThrow(/TRACKING_LIMIT/);
  });
});
