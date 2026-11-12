/**
 * Talks to a SnailyCAD API. The session is the CAD's own cookies (snaily-cad-session /
 * snaily-cad-refresh-token): the phone keeps them per CAD, like a browser does, so signing in
 * works with any SnailyCAD v4 without changes on the CAD.
 */

export class CadApiError extends Error {
  /** HTTP status, 0 when the CAD couldn't be reached */
  status: number;
  /** the CAD's error code, e.g. "totpCodeRequired" */
  code: string;
  /** field errors, e.g. { password: "passwordIncorrect" } */
  fields: Record<string, string>;

  constructor(message: string, status: number, code: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/** the CAD's error codes in plain words */
const MESSAGES: Record<string, string> = {
  userNotFound: "No account with that username on this CAD.",
  passwordIncorrect: "That password isn't right.",
  totpCodeRequired: "Enter the code from your authenticator app.",
  totpCodeInvalid: "That code isn't right. Try the newest one from your authenticator app.",
  whitelistPending: "Your account is waiting for approval by the CAD staff.",
  whitelistDeclined: "Your account was declined by the CAD staff.",
  userBanned: "This account is banned on this CAD.",
  allowRegularLoginIsDisabled:
    "This CAD has username and password sign-in turned off. Use Discord instead.",
  currentPasswordIncorrect: "That's not your current password.",
  passwordsDoNotMatch: "The passwords don't match.",
  Unauthorized: "Your session ended. Please sign in again.",
};

export function describeError(error: unknown): string {
  if (error instanceof CadApiError) {
    const field = Object.values(error.fields)[0];
    return MESSAGES[field ?? ""] ?? MESSAGES[error.code] ?? field ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function cadRequest<T>(
  apiUrl: string,
  path: string,
  { method = "GET", body, timeoutMs = 20_000, signal }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    const aborted = controller.signal.aborted && !signal?.aborted;
    throw new CadApiError(
      aborted
        ? "The CAD took too long to answer. Check your connection and try again."
        : "Couldn't reach the CAD. Check your connection, or the community may be offline.",
      0,
      aborted ? "timeout" : "network",
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // a web page instead of JSON: usually the website URL instead of the API URL
      throw new CadApiError(
        "That address answered, but it isn't a SnailyCAD API.",
        response.status,
        "notAnApi",
      );
    }
  }

  if (!response.ok) {
    const fields =
      json?.errors && typeof json.errors === "object" && !Array.isArray(json.errors)
        ? Object.fromEntries(
            Object.entries(json.errors).map(([key, value]) => [
              key,
              typeof value === "string" ? value : String((value as any)?.message ?? value),
            ]),
          )
        : {};
    const code = String(json?.message ?? json?.name ?? response.status);
    throw new CadApiError(MESSAGES[code] ?? code, response.status, code, fields);
  }

  return json as T;
}
