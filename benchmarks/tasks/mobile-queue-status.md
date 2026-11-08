# Benchmark Task: Mobile Clinic Queue Status Tracker

Task version: 1.0.0

## Scenario
You are designing a mobile status board for a walk-in clinic. Patients check in at the front desk, receive a ticket number, and wait. Many patients have low reading fluency, low battery, and an unreliable connection. The board must show a patient's place in the queue, what happens next, and when the data was last updated, in one glance.

## Product facts
- A patient receives a ticket number at check-in (e.g., "A-214"). Staff call numbers by category: General, Dental, Lab.
- Average waits are shown as ranges by category (General 20–35 minutes). The board never promises an exact wait or an exact call time.
- Ticket positions update when staff advance the queue; estimates may change by 10 minutes without notice.
- The board shows connectivity: live (updated under 2 minutes ago), delayed (2–10 minutes), or offline (over 10 minutes or no signal). Data may be stale; the age of the data is always visible.
- A patient can see their number, category, position ("You are 3rd in Dental"), and next step ("Watch the board; we call by number"). They can also request a text notification (SMS) — optional, never required to keep their place.
- An "I need help" button alerts the front desk. The board cannot reschedule, change a ticket number, or guarantee order.
- No medical advice, queue-jumping, or priority overrides are available in this scenario.

## Primary users and outcomes
The primary user is a patient waiting in the clinic with limited text literacy and battery. They need to know their place, what to watch for, and whether the board is fresh enough to trust. The clinic wants to reduce front-desk crowding without implying a precise wait time.

## Constraints and risks
- Never show an exact wait time, an exact call time, or a promise that no bump will occur; use ranges and keep the freshness age always visible.
- Keep the board glanceable at 390x844: ticket number, category, position, freshness, and next step must fit the first screens without scrolling under pressure. Do not bury "I need help".
- Explain the SMS option as optional; no other contact data is collected, and declining it has no effect on queue position.
- Include loading, offline, delayed, error (cannot load status), success (ticket found), and empty (no active ticket) states; distinguish "no ticket" from "cannot load".
- Use large, high-contrast type, simple language, and icon+text status (never color alone).
- Use the supplied project's stack and design conventions when available. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the mobile queue status experience for this product. First explain the patient's decision (stay, watch, ask for help) and the data limits. Then propose the information hierarchy and implement a responsive mobile experience or provide a detailed specification if implementation is unavailable.

## Expected deliverables
- Product/queue understanding with definitions, ranges, and freshness.
- Primary journey: ticket found, position, freshness, next step, optional SMS, help request.
- Rationale for hierarchy, ranges vs exact times, and offline behavior.
- Responsive UI or detailed specification.
- Loading, delayed/offline, error, success, and empty states.
- Short review of misleading interpretations and accessibility risks.

## Reviewer questions
- Can a patient identify their number, place, and next step in one glance?
- Are wait ranges presented as ranges, with no exact promise?
- Is the data's age always visible and the offline/delayed state unmistakable?
- Is the SMS option clearly optional, with no effect on position?
- Are "no ticket" and "cannot load" states distinguishable?
- Is the layout usable at 390x844 with large type and without color-only status?
- Does the help action stay reachable in every state?
