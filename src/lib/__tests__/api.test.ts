import { CadApiError, cadRequest, describeError } from "../api";
import { hasPermission } from "../cad-types";

const API = "https://cad-api.example.com/v1";

function mockFetch(status: number, body: unknown, raw = false) {
  const fn = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (raw ? String(body) : JSON.stringify(body)),
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("cadRequest", () => {
  it("sends JSON with the session cookies and returns the body", async () => {
    const fetchMock = mockFetch(200, { userId: "u1" });
    await expect(
      cadRequest(API, "/auth/login", { method: "POST", body: { username: "a", password: "b" } }),
    ).resolves.toEqual({ userId: "u1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/auth/login`);
    expect(init.credentials).toBe("include");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ username: "a", password: "b" });
  });

  it("turns the CAD's field errors into readable messages", async () => {
    mockFetch(400, { message: "totpCodeRequired", errors: { totpCode: "totpCodeRequired" } });
    const error: any = await cadRequest(API, "/auth/login", { method: "POST" }).catch((e: any) => e);
    expect(error).toBeInstanceOf(CadApiError);
    expect(error.fields).toEqual({ totpCode: "totpCodeRequired" });
    expect(describeError(error)).toMatch(/authenticator app/);

    mockFetch(400, { message: "badRequest", errors: { password: "passwordIncorrect" } });
    expect(describeError(await cadRequest(API, "/auth/login").catch((e: any) => e))).toBe(
      "That password isn't right.",
    );
  });

  it("explains a website address given instead of the API", async () => {
    mockFetch(200, "<!doctype html><html></html>", true);
    const error: any = await cadRequest(API, "/admin/manage/cad-settings").catch((e: any) => e);
    expect(error.code).toBe("notAnApi");
  });

  it("explains network failures", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed")) as never;
    const error: any = await cadRequest(API, "/user").catch((e: any) => e);
    expect(error.status).toBe(0);
    expect(error.code).toBe("network");
    expect(describeError(error)).toMatch(/Couldn't reach the CAD/);
  });
});

describe("hasPermission", () => {
  it("follows the CAD's rules", () => {
    expect(hasPermission(null, ["Leo"])).toBe(false);
    expect(hasPermission({ id: "1", username: "o", rank: "OWNER" }, ["Leo"])).toBe(true);
    expect(hasPermission({ id: "1", username: "u", rank: "USER", permissions: ["Leo"] }, ["Leo"])).toBe(true);
    expect(
      hasPermission(
        { id: "1", username: "u", rank: "USER", permissions: [], roles: [{ permissions: ["Dispatch"] }] },
        ["Dispatch"],
      ),
    ).toBe(true);
    expect(hasPermission({ id: "1", username: "a", rank: "ADMIN", permissions: [] }, ["Leo"])).toBe(false);
  });
});
