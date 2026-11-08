# Benchmark Task: Marketing Landing Page With a Risky Claim

Task version: 1.0.0

## Scenario
You are designing the landing page for a small sleep-aid app sold directly on the web. The page must persuade first-time visitors to start a 14-day trial while keeping every claim honest about what the product can and cannot do. The current draft uses a bright hero, a testimonial, and a countdown timer that feels manipulative.

## Product facts
- The app plays guided sleep audio stories; it is not a medical device and does not diagnose, treat, or prevent any condition.
- A 14-day free trial requires an email address only; no card is needed during the trial.
- The monthly price is $9.99 after the trial; cancelling stops future charges but does not refund the current month.
- The app claims a 4.6 average rating from 1,200 in-app reviews, collected in the last 6 months.
- Stories are available in English and Spanish; US and Mexico availability only.
- The team has one product screenshot and three short written testimonials supplied in the brief appendix; no video, no partner logos.
- No clinical studies, disease claims, or before/after results are available.

## Primary users and outcomes
The primary user is a first-time visitor who has slept poorly for a few nights and is skeptical of sleep products. They need to understand what the app does, what it costs, when they will pay, and how to cancel, before deciding to leave an email address. The business wants trial sign-ups without dark patterns or fabricated evidence.

## Constraints and risks
- Do not claim medical benefit, cure, or guarantee of restful sleep; state plainly that the app plays audio stories and is not a medical device.
- Do not invent clinical results, customer research, press coverage, partner endorsements, or scarcity (“only 2 spots left”) beyond the rating and price facts above.
- Show the trial length, price after trial, and cancellation rule near the email capture, in plain language, not only in fine print or after sign-up.
- Keep the page usable on desktop and mobile: the price, trial rule, and cancellations must survive stacking without becoming visually hidden.
- Include loading, empty (no stories available), error, success (email captured), and restricted (outside supported region) states where relevant.
- Use the host project's existing stack and design conventions if a project is supplied. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the landing page experience for this product. First identify the visitor's decision, the highest-risk claim problems, and what must be visible before an email is left. Then implement a responsive landing page or provide a sufficiently detailed specification and interaction states.

Do not add features outside the scenario unless you explain why they are necessary. Do not use deceptive urgency, fake scarcity, or fabricated social proof.

## Expected deliverables
- Brief product/UX analysis with assumptions called out.
- Information architecture and primary visitor journey.
- Quarterly editorial voice: hero, value, price/trial summary, proof, and final call to action.
- Responsive screen or working prototype.
- Region-restricted, validation, loading, success, and empty states.
- Short quality review noting claim risks and unresolved product questions.

## Reviewer questions
- Can a visitor identify what the app does, what it costs, and when they will pay?
- Are medical claims absent and the product's limits stated plainly?
- Is the rating presented with its source, sample size, and recency?
- Are trial, price, and cancellation rules visible near the email capture?
- Are region restrictions and email validation handled without alarm?
- Does the mobile layout preserve price, trial, and cancellation visibility?
- Does the visual design feel trustworthy for a consumer health-adjacent product?
