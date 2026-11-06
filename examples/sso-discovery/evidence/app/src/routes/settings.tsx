import type { ReactNode } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { can, type Role } from "../auth/permissions";
import { useCurrentRole } from "../auth/useCurrentRole";
import { ProfileSettings } from "../settings/profile-panel";
import { SecuritySettings } from "../settings/security-panel";

function RequireSecurityAccess({ children }: { children: ReactNode }) {
  const role = useCurrentRole();
  if (!can(role, "viewSecurity")) {
    return <Navigate to="/settings/profile" replace />;
  }
  return children;
}

// The members settings route is omitted from this excerpt.
export const settingsRoutes: RouteObject[] = [
  { path: "profile", element: <ProfileSettings /> },
  {
    path: "security",
    element: (
      <RequireSecurityAccess>
        <SecuritySettings />
      </RequireSecurityAccess>
    ),
  },
];

export const settingsNavigation = [
  { label: "Profile", to: "/settings/profile", visible: () => true },
  {
    label: "Members",
    to: "/settings/members",
    visible: (role: Role) => can(role, "manageMembers"),
  },
  {
    label: "Security",
    to: "/settings/security",
    visible: (role: Role) => can(role, "viewSecurity"),
  },
];
