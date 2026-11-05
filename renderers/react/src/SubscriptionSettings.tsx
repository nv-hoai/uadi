import React, { useState } from "react";
import type { ReactNode } from "react";

type Plan = { name: string; members: number; monthly: number; annual: number; description: string };
const plans: Plan[] = [
  { name: "Free", members: 3, monthly: 0, annual: 0, description: "For small teams getting started" },
  { name: "Pro", members: 20, monthly: 49, annual: 490, description: "For growing teams that need more room" },
  { name: "Business", members: 100, monthly: 129, annual: 1290, description: "For teams with advanced workflows" }
];
const money = (amount: number) => amount === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export function SubscriptionSettings(): ReactNode {
  const [period, setPeriod] = useState<"monthly" | "annual">("annual");
  const [role, setRole] = useState<"owner" | "member">("owner");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const currentPlan = plans[1];
  const price = period === "annual" ? currentPlan.annual : currentPlan.monthly;
  const isOwner = role === "owner";

  const choosePlan = (plan: Plan) => {
    if (!isOwner) return;
    setSelectedPlan(plan.name);
    setNotice("");
  };

  return <div className="billing-app">
    <header className="billing-topbar">
      <a className="billing-brand" href="#overview" aria-label="Northstar home"><span className="brand-mark">N</span> northstar</a>
      <div className="billing-workspace"><span className="workspace-avatar">A</span><span>Acme Studio</span><span className="workspace-chevron" aria-hidden="true">⌄</span></div>
      <div className="billing-user"><span className="user-avatar">JD</span><span>Jordan Davis</span></div>
    </header>

    <div className="billing-layout">
      <aside className="billing-sidebar" aria-label="Settings navigation">
        <p className="sidebar-eyebrow">WORKSPACE</p>
        <a href="#general">General</a><a href="#members">Members</a><a href="#security">Security</a>
        <p className="sidebar-eyebrow sidebar-spaced">PREFERENCES</p>
        <a href="#notifications">Notifications</a><a href="#integrations">Integrations</a>
        <p className="sidebar-eyebrow sidebar-spaced">ACCOUNT</p>
        <a className="sidebar-active" href="#billing" aria-current="page"><span aria-hidden="true">▦</span> Plan & billing</a>
      </aside>

      <main className="billing-main" id="billing">
        <div className="billing-breadcrumb">Workspace settings <span>/</span> Plan & billing</div>
        <div className="billing-heading-row">
          <div><p className="billing-eyebrow">ACCOUNT</p><h1>Plan & billing</h1><p className="billing-subtitle">Manage your subscription, payment method and invoices.</p></div>
          <span className="sample-label"><span aria-hidden="true">●</span> Sample workspace</span>
        </div>

        <div className="billing-demo-controls" aria-label="Prototype controls">
          <span>Preview as</span>
          <div className="billing-segment" role="group" aria-label="Preview role">
            <button type="button" aria-pressed={role === "owner"} onClick={() => { setRole("owner"); setNotice(""); }}>Owner</button>
            <button type="button" aria-pressed={role === "member"} onClick={() => { setRole("member"); setNotice(""); setSelectedPlan(null); }}>Member</button>
          </div>
          <span className="demo-hint">Demo control · not a real account</span>
        </div>

        {notice && <div className="billing-notice" role="status">{notice}</div>}
        {cancelled && <div className="billing-banner" role="status"><strong>Cancellation scheduled.</strong> Your Pro plan remains active until December 5, 2026. You can change your mind before then.</div>}

        <section className="billing-card current-plan" aria-labelledby="current-plan-title">
          <div className="card-topline"><div><p className="card-kicker">CURRENT SUBSCRIPTION</p><h2 id="current-plan-title">Pro plan <span className="plan-status">Active</span></h2></div><span className="plan-icon" aria-hidden="true">✳</span></div>
          <div className="plan-summary-grid">
            <div><span className="metric-label">Your price</span><strong className="plan-price">{money(price)}<small> / {period === "annual" ? "year" : "month"}</small></strong><span className="metric-note">{period === "annual" ? "$40.83 per month, billed annually" : "Billed monthly"}</span></div>
            <div><span className="metric-label">Next payment</span><strong className="metric-value">{cancelled ? "No upcoming payment" : "Dec 5, 2026"}</strong><span className="metric-note">{cancelled ? "Subscription ends Dec 5, 2026" : "Visa ending in 4242"}</span></div>
            <div><span className="metric-label">Member seats</span><strong className="metric-value">12 <small>/ 20</small></strong><span className="metric-note">8 seats available</span></div>
          </div>
          <div className="usage-block"><div className="usage-label-row"><span>Member usage</span><strong>12 of 20 seats</strong></div><div className="usage-track" role="progressbar" aria-label="Member seats used" aria-valuemin={0} aria-valuemax={20} aria-valuenow={12}><span /></div><p>You're using 60% of your available seats.</p></div>
          <div className="current-plan-footer"><span>Annual billing · Renews Dec 5, 2026</span>{isOwner && !cancelled && <button className="text-action" type="button" onClick={() => setNotice("Billing period changes are preview-only. No payment settings were changed.")}>Manage billing</button>}</div>
        </section>

        <section className="billing-section" aria-labelledby="plans-title">
          <div className="section-heading"><div><h2 id="plans-title">Choose a plan</h2><p>Find the right amount of room for your team.</p></div>
            <div className="billing-period" role="group" aria-label="Billing period"><button type="button" aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>Monthly</button><button type="button" aria-pressed={period === "annual"} onClick={() => setPeriod("annual")}>Yearly <span>Save 17%</span></button></div>
          </div>
          <div className="plan-grid">
            {plans.map((plan) => <article className={plan.name === "Pro" ? "plan-card plan-card-current" : "plan-card"} key={plan.name}>
              {plan.name === "Pro" && <span className="popular-tag">CURRENT PLAN</span>}
              <h3>{plan.name}</h3><p>{plan.description}</p>
              <div className="plan-card-price">{money(period === "annual" ? plan.annual : plan.monthly)}<small>{plan.monthly === 0 ? "" : period === "annual" ? " / year" : " / month"}</small></div>
              <div className="plan-seat"><span aria-hidden="true">✓</span> Up to {plan.members} members</div>
              {isOwner ? <button type="button" className={plan.name === "Pro" ? "plan-button plan-button-current" : "plan-button"} disabled={plan.name === "Pro" || cancelled} onClick={() => choosePlan(plan)}>{plan.name === "Pro" ? "Your current plan" : plan.name === "Free" ? "Review downgrade" : "Explore Business"}</button> : <span className="member-readonly">Owner can change plan</span>}
            </article>)}
          </div>
          <p className="pricing-disclaimer">Illustrative prices for this prototype only. Actual pricing and taxes depend on your agreement.</p>
          {selectedPlan && <div className="selection-review" role="region" aria-label="Plan change review"><div><strong>Review {selectedPlan} plan</strong><p>This is a preview only. No subscription or payment has been changed.</p></div><button type="button" className="secondary-button" onClick={() => setSelectedPlan(null)}>Close review</button></div>}
        </section>

        <section className="billing-section" aria-labelledby="payment-title">
          <div className="section-heading"><div><h2 id="payment-title">Payment method</h2><p>Your default payment method for subscription renewals.</p></div></div>
          <div className="billing-card payment-card"><div className="card-symbol" aria-hidden="true">VISA</div><div className="payment-details"><strong>Visa ending in 4242</strong><span>Expires 08/2027</span></div>{isOwner ? <button type="button" className="secondary-button" onClick={() => setPaymentExpanded(!paymentExpanded)} aria-expanded={paymentExpanded}>{paymentExpanded ? "Close" : "Update"}</button> : <span className="member-readonly">Owner only</span>}
            {paymentExpanded && <div className="payment-explainer" role="status">Payment updates are not connected in this demo. Your saved payment method remains unchanged.</div>}
          </div>
        </section>

        <section className="billing-section" aria-labelledby="invoices-title">
          <div className="section-heading"><div><h2 id="invoices-title">Invoices</h2><p>Download past invoices for your records.</p></div><a className="text-action" href="#invoice-list">View all</a></div>
          <div className="billing-card invoice-card"><div className="invoice-row invoice-header"><span>INVOICE</span><span>DATE</span><span>AMOUNT</span><span>STATUS</span><span /></div>
            <div className="invoice-row"><strong>INV-2026-011</strong><span>Nov 5, 2026</span><strong>$490.00</strong><span className="paid-status">Paid</span><button type="button" aria-label="Download invoice INV-2026-011" onClick={() => setNotice("Invoice download is not connected in this demo.")}>↓</button></div>
            <div className="invoice-row"><strong>INV-2025-010</strong><span>Dec 5, 2025</span><strong>$490.00</strong><span className="paid-status">Paid</span><button type="button" aria-label="Download invoice INV-2025-010" onClick={() => setNotice("Invoice download is not connected in this demo.")}>↓</button></div>
          </div>
        </section>

        <section className="cancel-section" aria-labelledby="cancel-title"><div><h2 id="cancel-title">Cancel subscription</h2><p>Your plan stays active until the end of the billing period. You won't be charged again after that.</p></div>{isOwner && <button type="button" className="cancel-button" disabled={cancelled} onClick={() => setCancelOpen(true)}>{cancelled ? "Cancellation scheduled" : "Cancel plan"}</button>}{!isOwner && <span className="member-readonly">Only workspace owners can cancel</span>}</section>
        <footer className="billing-footer">Need help with billing? <a href="mailto:billing@example.com">Contact support</a></footer>
      </main>
    </div>

    {cancelOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelOpen(false); }}>
      <section className="cancel-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title" aria-describedby="cancel-dialog-description">
        <button type="button" className="dialog-close" aria-label="Close dialog" onClick={() => setCancelOpen(false)}>×</button>
        <span className="dialog-icon" aria-hidden="true">!</span><h2 id="cancel-dialog-title">Cancel your Pro plan?</h2>
        <p id="cancel-dialog-description">Your subscription will remain active until <strong>December 5, 2026</strong>. After that:</p>
        <ul><li>Your workspace moves to the Free plan.</li><li>Workspaces with more than 3 members will need to reduce their team size to keep access for everyone.</li><li>Your saved data remains available.</li></ul>
        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => setCancelOpen(false)}>Keep my plan</button><button type="button" className="confirm-cancel" onClick={() => { setCancelled(true); setCancelOpen(false); setNotice(""); }}>Confirm cancellation</button></div>
        <p className="dialog-demo-note">Demo interaction only. No real subscription will be cancelled.</p>
      </section>
    </div>}
  </div>;
}
