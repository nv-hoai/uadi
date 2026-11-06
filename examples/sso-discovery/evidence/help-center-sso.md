# Set up single sign-on (SSO)

**Available on:** Scale

**Last reviewed:** 2025-08-14

Workspace admins can connect an identity provider and require SSO from **Settings → Security**.

## Before you begin

You need:

- The SAML metadata URL from your identity provider.
- Permission to change security settings in your workspace.
- A test account that can sign in through the identity provider.

## Connect an identity provider

1. Open **Settings → Security**.
2. Select **Connect identity provider**.
3. Paste the SAML metadata URL and save.
4. Sign in with a test account before requiring SSO for everyone.

## Require SSO

Once the connection works, turn on **Require SSO**. Members will be asked to sign in through your identity provider the next time they use Kestrel.

If your identity provider is unavailable, contact Kestrel support.

## Notes

- SSO is available on the Scale plan only.
- One identity provider can be connected to a workspace.
- Changing identity providers while SSO is required may interrupt access.
