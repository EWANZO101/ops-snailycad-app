import {
  InvalidCommunityError,
  communityCode,
  imageUrl,
  inviteLink,
  parseCommunityInput,
} from "../community";

describe("parseCommunityInput", () => {
  it.each([
    ["cad-api.example.com", "https://cad-api.example.com/v1"],
    ["  CAD-API.Example.com  ", "https://cad-api.example.com/v1"],
    ["https://cad-api.example.com/v1", "https://cad-api.example.com/v1"],
    ["https://cad-api.example.com/v1/", "https://cad-api.example.com/v1"],
    ["https://cad-api.example.com", "https://cad-api.example.com/v1"],
    ["http://cad-api.example.com/v1", "https://cad-api.example.com/v1"],
    ["example.com:8443/api", "https://example.com:8443/api/v1"],
    ["http://192.168.1.20:8080", "http://192.168.1.20:8080/v1"],
    ["http://localhost:8080/v1", "http://localhost:8080/v1"],
  ])("%s -> %s", (input, expected) => {
    expect(parseCommunityInput(input)).toBe(expected);
  });

  it("reads invite links", () => {
    const link = inviteLink("https://cad-api.example.com/v1");
    expect(link).toBe("opssnailycad://join?api=https%3A%2F%2Fcad-api.example.com%2Fv1");
    expect(parseCommunityInput(link)).toBe("https://cad-api.example.com/v1");
  });

  it.each(["", "   ", "not a code", "opssnailycad://join", "localhostish"])(
    "rejects %j",
    (input) => {
      expect(() => parseCommunityInput(input)).toThrow(InvalidCommunityError);
    },
  );

  it("round-trips the short code", () => {
    for (const api of ["https://cad-api.example.com/v1", "https://example.com:8443/api/v1"]) {
      expect(parseCommunityInput(communityCode(api))).toBe(api);
    }
    expect(communityCode("https://cad-api.example.com/v1")).toBe("cad-api.example.com");
  });
});

describe("imageUrl", () => {
  it("uses the API's /static folder, like the website", () => {
    expect(imageUrl("https://cad-api.example.com/v1", "cad", "logo.png")).toBe(
      "https://cad-api.example.com/static/cad/logo.png",
    );
    expect(imageUrl("https://cad-api.example.com/v1", "cad", "https://cdn.example.com/x.png")).toBe(
      "https://cdn.example.com/x.png",
    );
    expect(imageUrl("https://cad-api.example.com/v1", "cad", null)).toBeNull();
  });
});
