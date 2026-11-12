import * as SecureStore from "expo-secure-store";
import type { Community } from "./community";

/**
 * The communities this phone has joined, and which one is open. Kept in the keychain
 * (small: names, URLs and logos only; the CAD session itself is the system's cookies).
 */

const COMMUNITIES_KEY = "communities.v1";
const ACTIVE_KEY = "activeCommunity.v1";
const MAX_COMMUNITIES = 10;

export async function loadCommunities(): Promise<Community[]> {
  try {
    const raw = await SecureStore.getItemAsync(COMMUNITIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((c) => typeof c?.apiUrl === "string") : [];
  } catch {
    return [];
  }
}

export async function saveCommunity(community: Community): Promise<Community[]> {
  const others = (await loadCommunities()).filter((c) => c.apiUrl !== community.apiUrl);
  const list = [community, ...others].slice(0, MAX_COMMUNITIES);
  await SecureStore.setItemAsync(COMMUNITIES_KEY, JSON.stringify(list));
  return list;
}

export async function removeCommunity(apiUrl: string): Promise<Community[]> {
  const list = (await loadCommunities()).filter((c) => c.apiUrl !== apiUrl);
  await SecureStore.setItemAsync(COMMUNITIES_KEY, JSON.stringify(list));
  if ((await getActiveCommunity()) === apiUrl) await setActiveCommunity(null);
  return list;
}

export async function getActiveCommunity() {
  try {
    return await SecureStore.getItemAsync(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export async function setActiveCommunity(apiUrl: string | null) {
  if (apiUrl) await SecureStore.setItemAsync(ACTIVE_KEY, apiUrl);
  else await SecureStore.deleteItemAsync(ACTIVE_KEY);
}
