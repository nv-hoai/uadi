import { useContext } from "react";
import type { Role } from "./permissions";
import { SessionContext } from "./session-context";

export function useCurrentRole(): Role {
  return useContext(SessionContext).role;
}
