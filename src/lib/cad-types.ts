/**
 * The parts of the SnailyCAD API's responses the app uses. Kept loose on purpose: different CAD
 * versions add fields, and unknown fields are ignored.
 */

export type Rank = "OWNER" | "ADMIN" | "USER";

export interface CadFeature {
  feature: string;
  isEnabled: boolean;
}

/** GET /admin/manage/cad-settings (works without signing in) */
export interface PublicCad {
  id: string;
  name: string;
  logoId: string | null;
  areaOfPlay?: string | null;
  features?: CadFeature[] | Record<string, boolean>;
  version?: { currentVersion?: string; currentCommitHash?: string } | null;
  miscCadSettings?: { emergencyNumber?: string | null } | null;
}

export interface CadUser {
  id: string;
  username: string;
  rank: Rank;
  isLeo?: boolean;
  isSupervisor?: boolean;
  isEmsFd?: boolean;
  isDispatch?: boolean;
  isTow?: boolean;
  isTaxi?: boolean;
  permissions?: string[] | null;
  roles?: { permissions?: string[] | null }[] | null;
  discordId?: string | null;
  steamId?: string | null;
  cad?: PublicCad;
}

/** POST /auth/login */
export type LoginResponse = { userId: string } | { hasTempPassword: true };

/** same rule as the CAD (@snailycad/permissions hasPermission): owners have every permission */
export function hasPermission(user: CadUser | null, permissions: string[]) {
  if (!user) return false;
  if (user.rank === "OWNER") return true;
  const own = [
    ...(user.permissions ?? []),
    ...(user.roles ?? []).flatMap((role) => role.permissions ?? []),
  ];
  return permissions.some((permission) => own.includes(permission));
}
