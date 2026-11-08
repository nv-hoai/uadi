# Benchmark Task: Consumer Streaming Family Plan Settings

Task version: 1.0.0

## Scenario
You are designing family plan settings for a consumer streaming service. A household of five shares one plan across two TVs and two phones. The parents want to manage profiles and payment, a teenager wants privacy from parental viewing history, and a child uses a kids profile. The current settings page buries payment and cancellation behind a support link.

## Product facts
- The Family plan includes up to 5 profiles and allows 2 simultaneous streams.
- The price is $14.99 per month, billed monthly. The next payment date is 2026-12-01.
- The plan owner (account holder) can change billing, cancel, and manage all profiles. Adult profiles can edit their own profile and viewing settings. The Kids profile can only watch age-appropriate titles.
- Parental controls (PIN-protected) can block titles rated above PG and limit profiles by rating.
- Profiles show the first name and a chosen avatar; the service does not collect extra personal data beyond what the household enters.
- A 30-day recommendation history is kept per profile. A profile owner can clear their own history; the plan owner can clear all profiles only with each profile's confirmation.
- The service does not provide refunds for partial months; cancelling keeps access until the paid period ends.

## Primary users and outcomes
The primary user is a plan owner who wants to see which plan they have, what they pay, when the next payment occurs, and how to change or cancel without traps. Secondary users are adult family members (profile autonomy and privacy) and children (safe, age-appropriate access). The business wants upgrades and cancellations to be understandable and trustworthy.

## Constraints and risks
- Do not invent payment provider APIs or claim a cancellation or payment succeeded before confirmation.
- Cancellation must be discoverable in settings but separated from routine profile edits and require deliberate confirmation with the end-of-access date stated.
- Explain streaming limits (2 simultaneous) and profile limits (5) in plain language where profiles are managed.
- Respect role-based access: only the plan owner sees full billing and manages other adults' profiles for rating controls; adults manage their own profiles and history.
- Include loading, empty (no profiles yet), error, success, PIN-validation error, and restricted (Kids profile attempting owner actions) states where relevant.
- Use the host project's existing stack and design conventions if a project is supplied. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the family plan settings experience for this product. First understand the household's goals and the highest-risk UX problems. Propose a coherent information architecture and explain important decisions. Then implement a responsive experience or provide a sufficiently detailed specification and interaction states.

Do not add features outside the scenario unless you explain why they are necessary. Do not use dark patterns, hidden cancellation paths, or fabricated customer research.

## Expected deliverables
- Brief product/UX analysis with assumptions called out.
- Information architecture and primary owner journey, plus adult/Kids profile journeys.
- Key design decisions and trade-offs.
- Responsive screen or working prototype.
- Owner, adult, and Kids profile behavior.
- Important interaction and error states.
- Short quality review noting unresolved risks.

## Reviewer questions
- Can an owner identify plan, price, renewal date, and streaming limits quickly?
- Are profile roles (Owner / Adult / Kids) and their permissions understandable?
- Is the PG/Kids rating limit understandable before commitment?
- Is cancellation discoverable but protected against accidental activation?
- Can an adult understand and protect their own history privacy?
- Does the mobile layout preserve the task hierarchy?
- Are errors and loading states designed rather than ignored?
- Does the visual design feel trustworthy for a consumer billing context?
