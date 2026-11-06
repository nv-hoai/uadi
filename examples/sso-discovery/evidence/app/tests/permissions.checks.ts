// Test excerpt from the Kestrel codebase. It is not part of the host project test suite.
import { describe, expect, it } from "vitest";
import { can } from "../src/auth/permissions";

describe("workspace permissions", () => {
  it("lets owners manage billing, members and security", () => {
    expect(can("OWNER", "manageBilling")).toBe(true);
    expect(can("OWNER", "manageMembers")).toBe(true);
    expect(can("OWNER", "manageSecurity")).toBe(true);
  });

  it("lets admins manage members and workspace settings", () => {
    expect(can("ADMIN", "manageMembers")).toBe(true);
    expect(can("ADMIN", "manageWorkspaceSettings")).toBe(true);
  });

  it("does not let admins open security settings", () => {
    expect(can("ADMIN", "viewSecurity")).toBe(false);
    expect(can("ADMIN", "manageSecurity")).toBe(false);
  });

  it("does not let agents manage workspace settings", () => {
    expect(can("AGENT", "manageWorkspaceSettings")).toBe(false);
    expect(can("AGENT", "viewSecurity")).toBe(false);
  });
});
