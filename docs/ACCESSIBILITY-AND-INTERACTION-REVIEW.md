# Accessibility and Interaction Review

A practical method for reviewing the delivered experience. It complements automated checks; it does not replace them, and an automated pass does not prove accessibility.

Use the depth that matches the risk. A small visual change may need contrast, focus and zoom checks. A new consequential flow needs keyboard, semantics, state, recovery and—when available—assistive-technology review.

## 1. Set the review scope

Before testing, record:

- The target standard, usually WCAG 2.2 AA unless the project sets a different policy.
- The critical journeys, roles, states and viewports in scope.
- The checks that are possible with the available tools and environment.
- The commit, browser, viewport, zoom level and assistive technology used.
- What is explicitly out of scope and why.

Prioritize by consequence. A destructive, security or billing flow deserves more review than a static informational page. A restricted role deserves the same attention as the privileged role.

## 2. Review the rendered interface, not only the source

Source review can reveal missing labels, incorrect roles and fragile semantics. It cannot prove focus order, clipping, contrast, zoom behavior or what a screen reader announces.

When a browser is available:

1. Run the actual interface with realistic content.
2. Navigate using only the keyboard.
3. Inspect the accessibility tree and computed names.
4. Zoom and resize the viewport.
5. Exercise loading, empty, error, restricted and success states.
6. Check the console for errors that indicate broken behavior.

If no browser or assistive technology is available, say so. A source review is useful evidence, but it is not a rendered or assistive-technology test.

## 3. Keyboard and focus

- Every interactive element is reachable by Tab in a logical order.
- Focus is always visible, has sufficient contrast and is not hidden behind sticky content.
- A skip link reaches the main content when one is provided.
- There are no keyboard traps. Escape closes temporary overlays where expected.
- The focus order matches the visual and reading order; avoid positive `tabindex`.
- Dialogs move focus inside, keep it there while open, have an accessible name and return focus to the trigger on close.
- Menus, comboboxes, tabs and other composite widgets support the expected arrow, Enter, Space, Escape and typeahead behavior.
- Custom controls use native elements where possible; a clickable `div` is not a button.
- Disabled or restricted controls explain why and do not silently disappear from the tab order without context.
- After an asynchronous action, focus moves to a meaningful location or the result is announced.

A keyboard-only pass is not complete if focus is invisible, the order is confusing or an overlay traps the user.

## 4. Semantics, names and announcements

- The page has a descriptive title and a valid language attribute.
- Landmarks and heading levels describe the structure; headings are not chosen for size alone.
- Buttons perform actions and links navigate. Do not use one styled as the other.
- Every control has an accessible name. Icon-only controls still have a name.
- Visible labels match or are included in accessible names.
- Images have useful alternative text when they convey meaning and empty alternative text when decorative.
- Form fields have persistent labels, descriptions where needed and programmatically associated errors.
- Required, invalid and disabled states are available to assistive technology.
- Data tables have captions, header cells and scope where the table conveys relationships.
- Dialogs have an appropriate role, name and description.
- Status messages are announced once, at the right time, without repeatedly interrupting the user.
- ARIA is used only when native semantics cannot express the behavior; it does not contradict the visible state.

Inspect the accessibility tree rather than assuming that an attribute produced the intended name, role or announcement.

## 5. Visual access

- Text contrast meets 4.5:1 for normal text and 3:1 for large text.
- UI components, graphics and focus indicators meet the applicable 3:1 contrast where required.
- Status, errors, required fields, selection and links do not rely on color alone.
- Text can be resized to 200% without loss of content or function.
- Content reflows at 320 CSS pixels without horizontal page scrolling, or provides an equivalent accessible layout.
- Touch targets are at least 24 by 24 CSS pixels where WCAG 2.2 applies; prefer larger targets for primary actions.
- Motion respects `prefers-reduced-motion`; nothing flashes; auto-updating content can be paused or stopped.
- Content shown on hover or focus is dismissible, hoverable and persistent.
- High-contrast or dark modes, if supported, preserve the same hierarchy and state cues.

A design-token contrast check is not a substitute for checking the rendered combinations, including opacity, gradients, overlays and focus rings.

## 6. Interaction states and recovery

- **Loading:** the wait is explained, the status is announced and the layout does not jump unpredictably.
- **Empty:** the interface explains why there is no data and offers a legitimate next step.
- **Error:** the message identifies what failed, what was preserved and what to do next; focus moves to an error summary or the first invalid field.
- **Success:** confirmation appears only after the system confirms the result and states what happens next.
- **Disabled or restricted:** the reason and the person who can resolve it are visible and accessible.
- **Submitting:** duplicate submission is prevented and progress is visible.
- **Timeout:** the user is warned, can extend the session and does not lose work unnecessarily.
- **Destructive action:** the consequence is clear, the safe exit is distinct, and focus behavior is correct.
- **Partial success:** the interface says which parts succeeded and which need attention.
- **Recovery:** retry, undo or support paths work and are described honestly.

Do not announce success optimistically on a prototype or before persistence is confirmed.

## 7. Responsive and input modes

- Test at least 320, 768 and 1280 CSS pixels, plus 200% and 400% zoom where relevant.
- Check portrait and landscape when orientation changes the task.
- No page-level horizontal scrolling at narrow widths; wide tables and code blocks need an accessible alternative.
- Sticky headers, footers and dialogs do not cover focused controls or important content.
- Touch targets remain usable with a virtual keyboard open.
- Pointer gestures have single-pointer alternatives where required.
- Drag, path-based gestures and motion-only interactions have accessible alternatives.
- Content order remains understandable when the layout changes.

## 8. Content and comprehension

- Language is plain, direct and front-loaded.
- Link text makes sense out of context; avoid "click here".
- Error messages describe how to fix the problem without blaming the user.
- Abbreviations are expanded and unfamiliar terms are explained in place.
- Terminology is consistent across the flow.
- Media has captions or transcripts where it conveys information.
- Translated content is checked for expansion, truncation, right-to-left layout and locale-specific dates, numbers and currency.
- The DOM and reading order match the intended content order.

## 9. Test with assistive technology when possible

Use at least one screen reader on the critical flow when the environment supports it. Record the screen reader, browser and operating system.

Check:

- Page title, landmarks and heading navigation.
- Accessible name, role, state and value for each control.
- Form labels, descriptions, required state and error announcements.
- Dialog entry, containment and focus return.
- Live-region announcements for loading, success and error.
- Table navigation and header association.
- Whether the visual flow makes sense when read linearly.

If a screen reader is unavailable, do not claim screen-reader support. State that it was not tested and identify the remaining risk.

## 10. Record results honestly

Use a review record with the same fields for each check:

| Area | Method | Environment | Result | Evidence or limitation |
|---|---|---|---|---|
| Keyboard path | Manual Tab/Shift+Tab | Chromium 1248, 1280 px | Pass | Focus visible; dialog returns focus |
| Contrast | Rendered inspection | Chromium 1248 | Fail | Secondary label 3.9:1 |
| Screen reader | NVDA 2025.1 / Firefox | Not available | Not tested | Remaining risk for live announcements |

- Distinguish **pass**, **fail** and **not tested**.
- Report the automated tool, rule set and version. An axe or Lighthouse pass covers only the rules it ran.
- Do not claim WCAG conformance from an automated scan.
- Fix the highest-impact defect first, then re-test the affected path.
- Disclose known limitations and untested areas in the handoff.

## Review depth by risk

| Change | Minimum review |
|---|---|
| Small visual or copy change | Focus visibility, contrast, zoom/reflow, affected keyboard path |
| New form or settings flow | Keyboard, labels, validation, error recovery, responsive behavior |
| New multi-step or permission-aware flow | Above, plus role boundaries, states, focus management and announcements |
| Destructive, security or billing action | Above, plus consequence copy, confirmation, recovery and assistive-technology review where available |
| Content-only change | Reading order, link text, labels, error copy, localization risk |

## Common false claims

- "The automated scan passed, so it is accessible."
- "Keyboard navigation works" without checking focus visibility or traps.
- "It is responsive" after resizing CSS but not testing zoom or reflow.
- "A screen reader was tested" without recording which one, on which browser.
- "WCAG 2.2 AA" without checking 2.2-specific criteria such as target size and focus not obscured.
- "Contrast passes" from token values without checking rendered opacity, overlays and focus rings.
- "The prototype is accessible" when only the source was reviewed.

## Related guidance

- [Design quality checklist](QUALITY-GATES.md)
- [Flow and States](../intelligence/modules/flow-and-states.md) — validation planning and state design
- [Visual Composition](../intelligence/modules/visual-composition.md) — visual states and rendered review
- [Status, empty states and recovery](../intelligence/patterns/status-and-recovery.md)
- [Forms and validation](../intelligence/patterns/forms-and-validation.md)
- [Destructive actions](../intelligence/patterns/destructive-actions.md)
- [Permission-aware actions](../intelligence/patterns/permission-aware-actions.md)
