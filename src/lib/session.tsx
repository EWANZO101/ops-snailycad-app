import * as React from "react";
import { CadApiError, cadRequest } from "./api";
import type { CadUser, LoginResponse, PublicCad } from "./cad-types";
import { type Community, imageUrl } from "./community";
import {
  getActiveCommunity,
  loadCommunities,
  removeCommunity,
  saveCommunity,
  setActiveCommunity,
} from "./storage";

/**
 * Which community is open and who is signed in to it.
 *
 * status: "loading" at start-up, "noCommunity" (welcome screens), "signedOut" (a community is
 * open, sign in), "signedIn".
 */

type Status = "loading" | "noCommunity" | "signedOut" | "signedIn";

export type SignInResult = "signedIn" | "needsTotp" | "needsNewPassword";

interface SessionValue {
  status: Status;
  community: Community | null;
  communities: Community[];
  cad: PublicCad | null;
  user: CadUser | null;
  /** why the open community was opened: "start" = the admin's start-a-community flow */
  intent: "join" | "start";
  /** checks the address is a SnailyCAD and returns its name/logo (doesn't open it) */
  lookUpCommunity(apiUrl: string): Promise<Community>;
  /** opens a community (adds it to this phone) */
  openCommunity(community: Community, intent?: "join" | "start"): Promise<void>;
  /** back to the welcome screen, keeping the community on this phone */
  closeCommunity(): Promise<void>;
  /** removes a community from this phone (signs out of it first) */
  forgetCommunity(apiUrl: string): Promise<void>;
  signIn(input: { username: string; password: string; totpCode?: string }): Promise<SignInResult>;
  changeTemporaryPassword(input: { currentPassword: string; newPassword: string }): Promise<void>;
  signOut(): Promise<void>;
  refreshUser(): Promise<CadUser | null>;
}

const SessionContext = React.createContext<SessionValue | null>(null);

export function useSession() {
  const value = React.useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}

async function fetchPublicCad(apiUrl: string) {
  const cad = await cadRequest<PublicCad>(apiUrl, "/admin/manage/cad-settings");
  if (!cad || typeof cad !== "object" || !("name" in cad)) {
    throw new CadApiError("That address isn't a SnailyCAD API.", 200, "notAnApi");
  }
  return cad;
}

async function fetchUser(apiUrl: string) {
  try {
    return await cadRequest<CadUser>(apiUrl, "/user", { method: "POST" });
  } catch (error) {
    if (error instanceof CadApiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [community, setCommunity] = React.useState<Community | null>(null);
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [cad, setCad] = React.useState<PublicCad | null>(null);
  const [user, setUser] = React.useState<CadUser | null>(null);
  const [intent, setIntent] = React.useState<"join" | "start">("join");

  const lookUpCommunity = React.useCallback(async (apiUrl: string): Promise<Community> => {
    const found = await fetchPublicCad(apiUrl);
    return { apiUrl, name: found.name, logoUrl: imageUrl(apiUrl, "cad", found.logoId) };
  }, []);

  const enter = React.useCallback(async (next: Community) => {
    setCommunity(next);
    setUser(null);
    setCad(null);
    try {
      const [publicCad, signedIn] = await Promise.all([
        fetchPublicCad(next.apiUrl),
        fetchUser(next.apiUrl),
      ]);
      setCad(publicCad);
      setUser(signedIn);
      setStatus(signedIn ? "signedIn" : "signedOut");
    } catch {
      // offline or the CAD is down: show the sign-in screen, which explains
      setStatus("signedOut");
    }
  }, []);

  // start-up: reopen the last community
  React.useEffect(() => {
    void (async () => {
      const [list, active] = await Promise.all([loadCommunities(), getActiveCommunity()]);
      setCommunities(list);
      const last = list.find((c) => c.apiUrl === active);
      if (last) await enter(last);
      else setStatus("noCommunity");
    })();
  }, [enter]);

  const value: SessionValue = {
    status,
    community,
    communities,
    cad,
    user,
    intent,
    lookUpCommunity,
    async openCommunity(next, nextIntent = "join") {
      setIntent(nextIntent);
      if (community?.apiUrl !== next.apiUrl) setStatus("loading");
      setCommunities(await saveCommunity(next));
      await setActiveCommunity(next.apiUrl);
      await enter(next);
    },
    async closeCommunity() {
      await setActiveCommunity(null);
      setCommunity(null);
      setUser(null);
      setCad(null);
      setStatus("noCommunity");
    },
    async forgetCommunity(apiUrl) {
      await cadRequest(apiUrl, "/user/logout", { method: "POST" }).catch(() => undefined);
      setCommunities(await removeCommunity(apiUrl));
      if (community?.apiUrl === apiUrl) {
        setCommunity(null);
        setUser(null);
        setCad(null);
        setStatus("noCommunity");
      }
    },
    async signIn({ username, password, totpCode }) {
      if (!community) throw new Error("No community open.");
      try {
        const result = await cadRequest<LoginResponse>(community.apiUrl, "/auth/login", {
          method: "POST",
          body: { username, password, totpCode: totpCode || undefined },
        });
        if ("hasTempPassword" in result) return "needsNewPassword";
      } catch (error) {
        if (error instanceof CadApiError && error.fields.totpCode === "totpCodeRequired") {
          return "needsTotp";
        }
        throw error;
      }
      const signedIn = await fetchUser(community.apiUrl);
      if (!signedIn) {
        throw new CadApiError(
          "Signed in, but the CAD didn't keep the session. Ask the CAD owner to check the DOMAIN setting in its .env.",
          401,
          "noSession",
        );
      }
      setUser(signedIn);
      setStatus("signedIn");
      return "signedIn";
    },
    async changeTemporaryPassword({ currentPassword, newPassword }) {
      if (!community) throw new Error("No community open.");
      await cadRequest(community.apiUrl, "/user/password", {
        method: "POST",
        body: { currentPassword, newPassword, confirmPassword: newPassword },
      });
    },
    async signOut() {
      if (community) {
        await cadRequest(community.apiUrl, "/user/logout", { method: "POST" }).catch(
          () => undefined,
        );
      }
      setUser(null);
      setStatus(community ? "signedOut" : "noCommunity");
    },
    async refreshUser() {
      if (!community) return null;
      const next = await fetchUser(community.apiUrl);
      setUser(next);
      if (!next) setStatus("signedOut");
      return next;
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
