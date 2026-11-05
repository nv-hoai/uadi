# Pattern: Forms and Validation

## User problem

Users need to provide accurate information with an acceptable amount of effort. Forms become difficult when they ask for unnecessary data, reveal constraints too late, interrupt users with premature errors, or lose input when something fails.

## Use when

- A task collects or changes structured information.
- Users must make choices that affect later steps or outcomes.
- Invalid or incomplete input can cause cost, access, safety or workflow problems.

For a small set of independent values, prefer one concise form over an unnecessary multi-step flow.

## Shape the task before the fields

1. Define the outcome the user is trying to achieve.
2. Ask only for information needed for that outcome or a clearly explained future use.
3. Group fields by the user's mental model and decision sequence.
4. Put prerequisites and consequential choices before dependent fields.
5. Mark optional information clearly; do not make users guess.
6. Use appropriate input types, autocomplete hints, units and examples.

Do not collect information merely because the system could store it.

## Choose one page or multiple steps

A single page is usually better when fields are few, related and easy to understand together.

Use multiple steps when the task has genuinely distinct stages, meaningful dependencies, or a high cognitive load that benefits from progressive disclosure. If using steps:

- Give each step a clear purpose and progress context.
- Explain what information is needed before the user starts.
- Let users move backward without losing entered values.
- Show a review step when the information is consequential or difficult to change.
- Avoid splitting a short form into steps just to make it look simpler.

## Validation timing and messages

- Validate obvious format constraints on blur or after a user has interacted with a field; avoid announcing errors before the user has had a chance to answer.
- Validate cross-field and server-side rules when enough information is available.
- On submission, summarize errors and move focus to an error summary or the first invalid field using a predictable strategy.
- Put a specific explanation next to the affected field.
- Describe how to fix the problem, not merely that the value is invalid.
- Preserve all safe input after validation or network failure.
- Do not mark a field invalid solely because it is optional and empty.

Distinguish syntax errors (for example, an invalid date format) from business-rule errors (for example, a date outside the allowed range).

## Submission and feedback

- Prevent accidental duplicate submission while a request is in progress.
- Keep the user's values visible while submitting.
- Communicate success only after the system confirms it.
- Explain whether changes save immediately, on submit or after a separate confirmation.
- If a request fails, preserve input and offer a safe retry.
- For long-running work, show progress only when the system can report meaningful progress.

Do not simulate a successful save in a prototype unless the interface clearly identifies the behavior as a demo.

## Sensitive and consequential information

- Explain why sensitive information is requested and how it will be used when that context is necessary for informed completion.
- Put cost, renewal, access and irreversible consequences next to the relevant choice.
- Separate a destructive action from routine form submission.
- Ask for confirmation only when it helps prevent a meaningful mistake; confirmation should summarize the consequence.

## Accessibility

- Give every control a programmatic label.
- Associate hint and error text with the relevant field.
- Do not rely on placeholder text as the only label.
- Make required status and invalid state available to assistive technology.
- Ensure all controls and validation paths work with a keyboard.
- Maintain visible focus and adequate target size.
- Do not communicate validity through color alone.

## Responsive behavior

- Use a single-column layout for most narrow-screen forms.
- Keep labels and errors close to their controls.
- Use mobile-appropriate input types and avoid controls that require precision pointer interaction.
- Keep primary and secondary actions distinguishable and reachable.

## Trade-offs

Inline validation can reduce correction effort but may interrupt typing when applied too early. Multi-step forms reduce visible complexity but add navigation and memory costs. Autosave can protect work but must clearly communicate what has been saved and handle conflicts. Choose based on task complexity, error cost and user expectations.

## Common failures

- Asking for optional details without explaining their value.
- Using placeholders instead of persistent labels.
- Showing red errors while a user is still entering a value.
- Clearing the form after a failed request.
- Disabling submit without explaining what is missing.
- Splitting a trivial form into several steps.
- Showing a success toast before the save is confirmed.
