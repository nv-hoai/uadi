export function SecuritySettings() {
  return (
    <section aria-labelledby="sso-title">
      <h2 id="sso-title">Single sign-on</h2>
      <p>SSO is available on the Scale plan.</p>
      <button type="button" disabled>
        Connect identity provider
      </button>
      <p>Coming soon.</p>
    </section>
  );
}

// Placeholder: there is no connection form, enforcement state, recovery flow
// or Admin-specific behavior in the current settings surface.
