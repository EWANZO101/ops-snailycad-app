/**
 * A "community" is one SnailyCAD, identified by its API URL (e.g. https://cad-api.example.com/v1).
 *
 * There's no central server: the community code is the API address itself, in a short form
 * ("cad-api.example.com"), and the QR code / invite link carry the full URL. So the app works with
 * any SnailyCAD v4 without the CAD needing an update.
 */

export const APP_SCHEME = "opssnailycad";

export interface Community {
  /** normalized, e.g. "https://cad-api.example.com/v1" */
  apiUrl: string;
  name: string;
  logoUrl: string | null;
}

export class InvalidCommunityError extends Error {}

const LOCAL_HOST = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/i;

/**
 * turns whatever someone typed or scanned into the API URL: an invite link, a full URL
 * ("https://cad-api.example.com/v1"), or a community code ("cad-api.example.com").
 */
export function parseCommunityInput(input: string): string {
  let text = input.trim();
  if (!text) throw new InvalidCommunityError("Enter a community code or link.");

  // invite link: opssnailycad://join?api=https%3A%2F%2F...
  if (text.toLowerCase().startsWith(`${APP_SCHEME}://`)) {
    const query = text.slice(text.indexOf("?") + 1);
    const api = new URLSearchParams(query).get("api");
    if (!api) throw new InvalidCommunityError("This invite link is incomplete.");
    text = api;
  }

  if (!/^https?:\/\//i.test(text)) text = `https://${text}`;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new InvalidCommunityError("That doesn't look like a community code.");
  }
  if (!url.hostname.includes(".") && !LOCAL_HOST.test(url.host)) {
    throw new InvalidCommunityError("That doesn't look like a community code.");
  }
  // phones refuse plain http, except on a local network while testing
  if (url.protocol === "http:" && !LOCAL_HOST.test(url.host)) url.protocol = "https:";

  let path = url.pathname.replace(/\/+$/, "");
  if (!/\/v1$/i.test(path)) path = `${path}/v1`;
  return `${url.protocol}//${url.host.toLowerCase()}${path}`;
}

/** the short code people can type: "cad-api.example.com" (or with a path / port when needed) */
export function communityCode(apiUrl: string) {
  return apiUrl.replace(/^https:\/\//i, "").replace(/\/v1$/i, "");
}

/** what the QR code and the share button carry */
export function inviteLink(apiUrl: string) {
  return `${APP_SCHEME}://join?api=${encodeURIComponent(apiUrl)}`;
}

/** where the API serves uploaded images (same rule as the CAD website) */
export function imageUrl(
  apiUrl: string,
  type: "cad" | "citizens" | "users" | "units" | "values" | "bleeter" | "pets",
  id: string | null | undefined,
) {
  if (!id) return null;
  if (/^https?:\/\//i.test(id)) return id;
  return `${apiUrl.replace(/\/v1$/i, "")}/static/${type}/${id}`;
}
