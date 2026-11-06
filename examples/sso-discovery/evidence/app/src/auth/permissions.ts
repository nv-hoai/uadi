export type Role = "OWNER" | "ADMIN" | "AGENT";

export const permissions = {
  manageBilling: ["OWNER"],
  deleteWorkspace: ["OWNER"],
  manageMembers: ["OWNER", "ADMIN"],
  manageWorkspaceSettings: ["OWNER", "ADMIN"],
  viewSecurity: ["OWNER"],
  manageSecurity: ["OWNER"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissions;

export function can(role: Role, permission: Permission): boolean {
  return (permissions[permission] as readonly Role[]).includes(role);
}

// TODO(security): the help center says admins can manage SSO, but this matrix
// and the route guard below still restrict every security action to owners.
