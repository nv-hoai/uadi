import { createContext } from "react";
import type { Role } from "./permissions";

export type Session = {
  role: Role;
};

export const SessionContext = createContext<Session>({ role: "AGENT" });
