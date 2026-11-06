export type SsoConnectionStatus = "DRAFT" | "ACTIVE";

export type SsoConnection = {
  id: string;
  workspaceId: string;
  providerLabel: string;
  metadataUrl: string;
  status: SsoConnectionStatus;
  createdAt: string;
};

export async function getSsoConnection(
  workspaceId: string,
): Promise<SsoConnection | null> {
  const response = await fetch(`/api/workspaces/${workspaceId}/sso-connection`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load SSO connection");
  return (await response.json()) as SsoConnection;
}

// There is no enforcement flag, enforcement timestamp or session-revocation
// hook in the current model. A real implementation must add them explicitly.
