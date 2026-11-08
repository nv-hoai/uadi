# Benchmark Task: First Pharmacy Refill Check-In

Task version: 1.0.0

## Scenario
You are designing the first check-in for a small independent pharmacy that lets patients request a refill online. A new patient has just created an account and must describe their prescription, delivery preference, and anything the pharmacist must know before the request is sent. The pharmacy is not a medical provider; the pharmacist confirms every refill.

## Product facts
- The patient can request a refill for up to 3 prescriptions in one check-in. Each request needs the drug name, dosage, and preferred pickup or delivery.
- Delivery options are pharmacy pickup (tomorrow after 10:00) and home delivery (2 business days). Delivery costs $5.00; pickup is free.
- The patient can add a brief note for the pharmacist (allergies, timing constraints) up to 240 characters. Free-text medical notes are read by the pharmacist, not diagnosed.
- The pharmacy responds within 1 business day by email. Refill approval, substitution, and clinical advice are out of scope for this flow.
- The patient must confirm identity with date of birth and one of (phone number or insurer member ID). Full insurance card images are not collected here.
- The patient can leave and return; partial answers are saved locally for 7 days.
- Members (family caregivers) can view status but cannot submit changes for another adult.

## Primary users and outcomes
The primary user is a first-time patient who may be confused about what to enter and whether entering a note will get medical advice. They need to understand what is needed, what stays local, when the pharmacist replies, and how to correct a mistake. The pharmacy wants complete, honest refill requests without implying diagnosis or clinical coverage.

## Constraints and risks
- Do not diagnose, recommend, or imply clinical advice. State plainly that the pharmacist reviews every request and that urgent issues need a call or visit, not this form.
- Do not collect full insurance images, full health records, or data beyond the facts above; show what is saved locally and what is sent.
- Make the required fields minimal and ordered: prescriptions → delivery → note → review → submit. Do not gate the refill on an optional note.
- Include validation, loading, success, partial-save, missing-prescription, and identity-error states. Include an empty state for patients with no active prescriptions.
- Keep the experience usable on desktop and mobile; cost and pickup/delivery consequences must survive stacking.
- Use the host project's existing stack and design conventions if a project is supplied. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the first refill check-in for this product. First identify what a new patient needs to know and do, in what order, and what must never be implied. Then design and implement a responsive experience or provide a detailed framework-neutral specification if implementation is unavailable.

Do not add features outside the scenario unless you explain why they are necessary. Do not invent clinical rules, response guarantees, or backend behavior.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Primary journey: prescription entry, delivery choice, note, review, submit, confirmation.
- Rationale for field order, caution language, and partial-save behavior.
- Responsive UI or detailed specification.
- Validation, loading, success, identity-error, and empty states.
- Short review of trust, safety, and misunderstanding risks.

## Reviewer questions
- Can a new patient understand what to enter and what will happen next?
- Is it unmistakable that the flow does not provide medical advice?
- Are identity fields minimal and explained (no full insurance images)?
- Are delivery cost and timing stated before submission?
- Can the patient leave and return without losing progress?
- Do validation, empty, and identity-error states feel designed rather than left to defaults?
- Does the mobile layout keep cost, timing, and the submit action visible?
