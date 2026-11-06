const USERS = {
  OWNER: { name: "Dana Whitfield", role: "Owner", initials: "DW" },
  ADMIN: { name: "Marcus Lee", role: "Admin", initials: "ML" },
  AGENT: { name: "Priya Nair", role: "Agent", initials: "PN" },
};

const PLANS = {
  SCALE: "Scale",
  GROWTH: "Growth",
  STARTER: "Starter",
};

const DEFAULT_CONNECTION = {
  provider: "Okta",
  domain: "kestrel.okta.com",
  configuredBy: "Dana Whitfield",
  configuredAt: "12 Oct 2026",
  metadataUrl: "https://kestrel.okta.com/app/kestrel/sso/saml/metadata",
};

const state = {
  role: "OWNER",
  plan: "SCALE",
  scenario: "ready",
  connection: { ...DEFAULT_CONNECTION },
  enforced: false,
  recoveryDownloaded: false,
};

const securityBody = document.getElementById("security-body");
const liveStatus = document.getElementById("live-status");
const roleSelect = document.getElementById("role");
const planSelect = document.getElementById("plan");
const scenarioSelect = document.getElementById("scenario");

const enforceDialog = document.getElementById("enforce-dialog");
const enforceForm = document.getElementById("enforce-form");
const enforceConfirm = document.getElementById("enforce-confirm");
const downloadRecovery = document.getElementById("download-recovery");
const recoveryConfirm = document.getElementById("recovery-confirm");
const recoveryNote = document.getElementById("recovery-note");

const disableDialog = document.getElementById("disable-dialog");
const disableForm = document.getElementById("disable-form");

const connectionDialog = document.getElementById("connection-dialog");
const connectionForm = document.getElementById("connection-form");
const connectionTitle = document.getElementById("connection-title");
const connectionDesc = document.getElementById("connection-desc");
const connectionSubmit = document.getElementById("connection-submit");
const metadataInput = document.getElementById("metadata-url");
const metadataError = document.getElementById("metadata-error");

let lastTrigger = null;
let loadingTimer = null;
let announceTimer = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function announce(message) {
  window.clearTimeout(announceTimer);
  liveStatus.textContent = "";
  announceTimer = window.setTimeout(() => {
    liveStatus.textContent = message;
  }, 40);
}

function statusPill(label, tone = "") {
  const toneClass = tone ? ` is-${tone}` : "";
  return `<span class="status-pill${toneClass}">${label}</span>`;
}

function focusHeading(id) {
  const heading = document.getElementById(id);
  if (heading) heading.focus();
}

function clearLoadingTimer() {
  window.clearTimeout(loadingTimer);
  loadingTimer = null;
}

function renderSkeleton() {
  return `
    <div class="settings-card skeleton-card" aria-hidden="true">
      <div class="skeleton-line is-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>
    <div class="settings-card skeleton-card" aria-hidden="true">
      <div class="skeleton-line is-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>
    <p class="sr-only" role="status">Loading security settings…</p>
  `;
}

function renderError() {
  return `
    <section class="state-card" aria-labelledby="error-title">
      <p class="state-kicker">Could not load</p>
      <h2 id="error-title">We couldn't load security settings</h2>
      <p>The SSO connection could not be read. No changes have been made.</p>
      <div class="actions">
        <button type="button" class="secondary-button" data-action="retry">Try again</button>
      </div>
    </section>
  `;
}

function renderPermissionDenied() {
  return `
    <section class="state-card" aria-labelledby="permission-title">
      <p class="state-kicker">No access</p>
      <h2 id="permission-title">You don't have access to security settings</h2>
      <p>Security settings are available to workspace Owners and Admins. Ask a workspace Owner or Admin if you need access.</p>
    </section>
  `;
}

function renderPlanGate() {
  return `
    <section class="state-card" aria-labelledby="plan-title">
      <p class="state-kicker">Plan requirement</p>
      <h2 id="plan-title">SSO is available on Scale</h2>
      <p>Your workspace is on the ${PLANS[state.plan]} plan. SSO lets members sign in through your company identity provider instead of a password.</p>
      <ul class="plan-points">
        <li>Require SSO for every member</li>
        <li>Keep a recovery link for Owners</li>
        <li>Manage the connection from Settings → Security</li>
      </ul>
      <p>Ask your account team about changing plans. Plan changes are not available in this settings page.</p>
    </section>
  `;
}

function renderConnectionCard() {
  const connection = state.connection;

  if (!connection) {
    return `
      <section class="settings-card" aria-labelledby="provider-title">
        <div class="card-head">
          <h2 id="provider-title">Identity provider</h2>
          ${statusPill("Not connected", "warn")}
        </div>
        <p class="card-copy">Connect an identity provider before you can require SSO.</p>
        <div class="actions">
          <button type="button" class="primary-button" data-action="connect">Connect identity provider</button>
        </div>
      </section>
    `;
  }

  const provider = escapeHtml(connection.provider);
  const domain = escapeHtml(connection.domain);
  const configuredBy = escapeHtml(connection.configuredBy);
  const configuredAt = escapeHtml(connection.configuredAt);

  return `
    <section class="settings-card" aria-labelledby="provider-title">
      <div class="card-head">
        <h2 id="provider-title">Identity provider</h2>
        ${statusPill("Connected", "good")}
      </div>
      <dl class="provider-meta">
        <dt>Provider</dt>
        <dd>${provider}</dd>
        <dt>Domain</dt>
        <dd>${domain}</dd>
        <dt>Configured by</dt>
        <dd>${configuredBy} · ${configuredAt}</dd>
      </dl>
      <p class="note-line">Test a sign-in before requiring SSO.</p>
      ${
        state.enforced
          ? `<p class="note-line">Turn off enforcement before replacing the connection.</p>`
          : `<div class="actions"><button type="button" class="secondary-button" data-action="manage">Manage connection</button></div>`
      }
    </section>
  `;
}

function renderEnforcementCard() {
  const owner = state.role === "OWNER";
  const connection = state.connection;

  if (!connection) {
    return `
      <section class="settings-card" aria-labelledby="enforcement-title">
        <div class="card-head">
          <h2 id="enforcement-title" tabindex="-1">SSO enforcement</h2>
          ${statusPill("Unavailable", "warn")}
        </div>
        <p class="card-copy">Connect an identity provider before you can require SSO.</p>
      </section>
    `;
  }

  const provider = escapeHtml(connection.provider);

  if (state.enforced) {
    return `
      <section class="settings-card" aria-labelledby="enforcement-title">
        <div class="card-head">
          <h2 id="enforcement-title" tabindex="-1">SSO enforcement</h2>
          ${statusPill("Required for all members", "good")}
        </div>
        <p class="card-copy">Members sign in with <strong>${provider}</strong>. Existing sessions expire within 24 hours.</p>
        ${
          owner
            ? `<div class="actions">
                 <button type="button" class="secondary-button" data-action="download-recovery">${
                   state.recoveryDownloaded ? "Recovery link downloaded" : "Download recovery link"
                 }</button>
                 <button type="button" class="danger-button" data-action="disable">Turn off enforcement</button>
               </div>`
            : `<p class="callout"><strong>Only Owners can turn off enforcement.</strong> Ask a workspace Owner if SSO should no longer be required.</p>`
        }
      </section>
    `;
  }

  return `
    <section class="settings-card" aria-labelledby="enforcement-title">
      <div class="card-head">
        <h2 id="enforcement-title" tabindex="-1">SSO enforcement</h2>
        ${statusPill("Not required")}
      </div>
      <p class="card-copy">Members can still sign in with a password. Requiring SSO changes how everyone signs in.</p>
      ${
        owner
          ? `<div class="actions"><button type="button" class="primary-button" data-action="require">Require SSO</button></div>`
          : `<p class="callout"><strong>Only Owners can require SSO.</strong> You can manage the identity provider connection.</p>`
      }
    </section>
  `;
}

function renderBody() {
  if (state.scenario === "loading") return renderSkeleton();
  if (state.scenario === "error") return renderError();
  if (state.role === "AGENT") return renderPermissionDenied();
  if (state.plan !== "SCALE") return renderPlanGate();
  return `${renderConnectionCard()}${renderEnforcementCard()}`;
}

function render() {
  const user = USERS[state.role];
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-role").textContent = user.role;
  document.getElementById("user-avatar").textContent = user.initials;

  const planBadge = document.getElementById("plan-badge");
  planBadge.textContent = PLANS[state.plan];
  planBadge.classList.toggle("is-scale", state.plan === "SCALE");

  roleSelect.value = state.role;
  planSelect.value = state.plan;
  scenarioSelect.value = state.scenario;

  securityBody.innerHTML = renderBody();
  securityBody.dataset.role = state.role;
  securityBody.dataset.plan = state.plan;
  securityBody.dataset.scenario = state.scenario;
  securityBody.dataset.enforced = String(state.enforced);

  if (state.scenario === "loading") {
    securityBody.setAttribute("aria-busy", "true");
  } else {
    securityBody.removeAttribute("aria-busy");
  }
}

function openDialog(dialog, trigger) {
  lastTrigger = trigger || null;
  dialog.showModal();
}

function openEnforceDialog(trigger) {
  state.recoveryDownloaded = false;
  recoveryConfirm.checked = false;
  enforceConfirm.disabled = true;
  downloadRecovery.textContent = "Download recovery link";
  recoveryNote.textContent = "Download the link to continue.";
  recoveryNote.classList.remove("recovery-done");
  document.getElementById("enforce-provider").textContent =
    state.connection?.provider || "your identity provider";
  openDialog(enforceDialog, trigger);
}

function openDisableDialog(trigger) {
  openDialog(disableDialog, trigger);
}

function openConnectionDialog(mode, trigger) {
  const managing = mode === "manage";
  connectionTitle.textContent = managing
    ? "Manage identity provider"
    : "Connect identity provider";
  connectionDesc.textContent = managing
    ? "Replace the SAML metadata URL for this workspace. This prototype does not contact a provider."
    : "Paste the SAML metadata URL from your identity provider. This prototype does not contact a provider.";
  connectionSubmit.textContent = managing ? "Save changes" : "Save connection";
  metadataInput.value = managing ? state.connection?.metadataUrl || "" : "";
  metadataError.hidden = true;
  metadataInput.removeAttribute("aria-invalid");
  openDialog(connectionDialog, trigger);
  window.requestAnimationFrame(() => metadataInput.focus());
}

function updateEnforceConfirm() {
  enforceConfirm.disabled = !(state.recoveryDownloaded && recoveryConfirm.checked);
}

function detectProvider(domain) {
  const normalized = domain.toLowerCase();
  if (normalized.includes("okta")) return "Okta";
  if (normalized.includes("microsoft") || normalized.includes("azure")) {
    return "Microsoft Entra ID";
  }
  if (normalized.includes("google")) return "Google Workspace";
  if (normalized.includes("onelogin")) return "OneLogin";
  if (normalized.includes("auth0")) return "Auth0";
  return "Custom SAML";
}

function retryLoad() {
  clearLoadingTimer();
  state.scenario = "loading";
  render();
  announce("Loading security settings.");
  loadingTimer = window.setTimeout(() => {
    state.scenario = "ready";
    state.connection = { ...DEFAULT_CONNECTION };
    state.enforced = false;
    render();
    announce("Security settings loaded.");
  }, 600);
}

securityBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  switch (button.dataset.action) {
    case "connect":
      openConnectionDialog("connect", button);
      break;
    case "manage":
      openConnectionDialog("manage", button);
      break;
    case "require":
      openEnforceDialog(button);
      break;
    case "disable":
      openDisableDialog(button);
      break;
    case "download-recovery":
      state.recoveryDownloaded = true;
      render();
      announce("Recovery link downloaded. Store it somewhere safe.");
      focusHeading("enforcement-title");
      break;
    case "retry":
      retryLoad();
      break;
    default:
      break;
  }
});

downloadRecovery.addEventListener("click", () => {
  state.recoveryDownloaded = true;
  downloadRecovery.textContent = "Download again";
  recoveryNote.textContent = "Recovery link downloaded (demo only). Store it somewhere safe.";
  recoveryNote.classList.add("recovery-done");
  updateEnforceConfirm();
});

recoveryConfirm.addEventListener("change", updateEnforceConfirm);

enforceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (enforceConfirm.disabled) return;

  state.enforced = true;
  state.scenario = "required";
  state.recoveryDownloaded = false;
  lastTrigger = null;
  enforceDialog.close();
  render();
  announce("SSO is now required for all members.");
  focusHeading("enforcement-title");
});

disableForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.enforced = false;
  state.scenario = "ready";
  state.recoveryDownloaded = false;
  lastTrigger = null;
  disableDialog.close();
  render();
  announce("SSO is no longer required. Members can sign in with a password.");
  focusHeading("enforcement-title");
});

connectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = metadataInput.value.trim();
  let errorMessage = "";

  if (!value) {
    errorMessage = "Enter the metadata URL from your identity provider.";
  } else {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        errorMessage = "Use an https:// metadata URL.";
      }
    } catch {
      errorMessage = "Enter a valid URL, including https://.";
    }
  }

  if (errorMessage) {
    metadataError.textContent = errorMessage;
    metadataError.hidden = false;
    metadataInput.setAttribute("aria-invalid", "true");
    metadataInput.focus();
    return;
  }

  const url = new URL(value);
  const domain = url.hostname.replace(/^www\./, "");
  const provider = detectProvider(domain);

  state.connection = {
    provider,
    domain,
    configuredBy: USERS[state.role].name,
    configuredAt: "6 Nov 2026",
    metadataUrl: value,
  };
  state.enforced = false;
  state.scenario = "ready";
  lastTrigger = null;
  connectionDialog.close();
  render();
  announce(`Identity provider connected to ${provider}. Test a sign-in before requiring SSO.`);
  focusHeading("enforcement-title");
});

metadataInput.addEventListener("input", () => {
  if (!metadataError.hidden) {
    metadataError.hidden = true;
    metadataInput.removeAttribute("aria-invalid");
  }
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    if (dialog) dialog.close();
  });
});

function trapFocus(dialog, event) {
  if (event.key !== "Tab") return;

  const focusable = [
    ...dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

[enforceDialog, disableDialog, connectionDialog].forEach((dialog) => {
  dialog.addEventListener("close", () => {
    if (lastTrigger && document.body.contains(lastTrigger)) {
      lastTrigger.focus();
    }
  });
  dialog.addEventListener("keydown", (event) => trapFocus(dialog, event));
});

roleSelect.addEventListener("change", () => {
  clearLoadingTimer();
  state.role = roleSelect.value;
  render();
});

planSelect.addEventListener("change", () => {
  clearLoadingTimer();
  state.plan = planSelect.value;
  render();
});

scenarioSelect.addEventListener("change", () => {
  clearLoadingTimer();
  state.scenario = scenarioSelect.value;

  if (state.scenario === "ready") {
    state.connection = { ...DEFAULT_CONNECTION };
    state.enforced = false;
    state.recoveryDownloaded = false;
  }

  if (state.scenario === "no-connection") {
    state.connection = null;
    state.enforced = false;
    state.recoveryDownloaded = false;
  }

  if (state.scenario === "required") {
    state.connection = { ...DEFAULT_CONNECTION };
    state.enforced = true;
    state.recoveryDownloaded = false;
  }

  render();
});

render();
