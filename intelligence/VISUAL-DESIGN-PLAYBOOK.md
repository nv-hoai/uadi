# Visual Design Playbook

> **Reference:** The runtime operational rules live in `intelligence/modules/`. This playbook preserves deeper rationale and examples; do not load it by default.

Create an interface whose visual language makes the product easier to understand and use. Visual quality is not a layer of decoration added after UX decisions; it is how information, priority, relationships and feedback become perceptible.

Use this playbook when creating a new screen, establishing a visual direction or improving a visually weak experience. For a small component change, follow the existing system and review the local result.

## 1. Read the visual context first

Inspect the actual product before choosing a style:

- Existing pages, navigation, components, tokens and typography.
- Brand guidance, product positioning and audience expectations.
- Real content, data shape, density and common user tasks.
- Existing responsive behavior and interaction states.
- Framework and component conventions already in use.

Preserve established visual language unless it conflicts with usability, accessibility or an explicit product goal. Do not replace a coherent design system just to make a screen look novel.

## 2. Set a visual direction with a reason

A visual direction should fit the product's audience, context and task—not a generic adjective.

Describe it in practical terms:
- **Character:** the intended impression and why it suits the product.
- **Hierarchy:** what should attract attention first, second and third.
- **Density:** how much information users need to scan or compare.
- **Structure:** the layout and grouping that make relationships clear.
- **Emphasis:** where color, type, shape or imagery should carry meaning.

Avoid defaulting to generic dashboards, excessive rounded cards, gradients, oversized headings or decorative metrics. Use them only when they support a real communication goal.

## 3. Compose from content and task priority

Before styling, decide:

1. What must the user understand immediately?
2. What is the primary action in this context?
3. Which information belongs together for a decision?
4. What can be secondary, progressive or omitted?
5. What needs persistent visibility while the user works?

Then create a clear composition:
- Establish one dominant focal area rather than competing panels.
- Align related content and use spacing to show grouping.
- Use page width and columns to support the content, not to fill space.
- Keep labels close to values and actions close to their consequences.
- Use cards only when separation or independent grouping adds meaning.
- Avoid repeated containers, dividers and badges that flatten hierarchy.

## 4. Compose with the Principles of Art

An interface is functional art: composition in service of a task. The seven Principles
of Art are the working vocabulary for the composition decision in §3 and for the hierarchy
check in §6. They operationalize "purposeful craft" in `DESIGN-INTELLIGENCE.md` Principle 6;
they never override the `Resolve trade-offs` order. A screen that satisfies every principle
below still fails if it hides a consequence, invents a fact, or blocks the user's task.
Use the smallest subset that resolves the composition risk in front of you.

Apply them in this order: settle the focal point first, then the eye's path, then the
supporting relationships. If conflict arises, later principles yield to earlier ones, and
the whole set yields to usability, accessibility, and trust.

### The seven principles, in UI terms

1. **Balance** — distribute visual weight so the page feels stable.
   - *Symmetrical* (centered, equal columns) suits comparison and containment: billing summaries, metric cards, recovery dialogs.
   - *Asymmetrical* (one dominant block, supporting content offset) suits a single-task flow: form then review, prompt then preview, table then drill-down. Most UADI work should be asymmetrical here.
   - *Radial / concentric* is rarely appropriate in product UI; reserve it for focus management or a progress readout, never for primary navigation.
   - Decision question: *when the user glances for two seconds, does the page feel balanced, or does one panel pull them away from the consequence?*
   - Failure mode: equal-weight cards, a large metrics column dwarfing the action it explains.

2. **Contrast** — place opposing elements so the important one wins.
   - Use contrast across type size/weight, surface tone, and color together — never one channel alone. Reserve the strongest contrast for the consequence and the single primary action.
   - Decision question: *what is the highest-contrast element on screen, and is it the thing the user must act on?*
   - Failure mode: four filled buttons at the same weight; a warning and a decorative hero image at the same luminance.

3. **Emphasis** — create one focal point (the landing eye).
   - One element per viewport carries the most emphasis. Secondary actions stay visible but quiet. Destructive actions stay distinguishable without inheriting primary emphasis.
   - Decision question: *if the user sees nothing else, what do they see?*
   - Failure mode: multiple bright banners, a hero image and a hero heading competing; or every heading bold.

4. **Movement** — design the eye's path explicitly.
   - Move the eye with position, size, spacing, and alignment: browser chrome → page title → primary fact → consequence → primary action → supporting detail. Use progressive disclosure to order it; rely on alignment before decoration.
   - On mobile, allow the path to reorder — the primary action and any deadline or consequence must remain within the first screens after stacking, not buried below it.
   - Decision question: *can you trace the intended path in the initial viewport with your eyes, without backtracking?*
   - Failure mode: a notice/banner/loading panel leaking into every screenshot and restacking the order; the action placed below the fold behind secondary detail.

5. **Pattern / Repetition** — repeat an element to create grammar.
   - Repeat spacing, radius, type roles, and status colors so users learn the visual language once and reuse it. Repetition is a recognition aid, not decoration.
   - Decision question: *does the same kind of thing always look the same way?*
   - Failure mode: same intent as three different button/card treatments; a loading skeleton that looks unrelated to the content it replaces.

6. **Rhythm** — vary repetition with purpose, so the page has cadence.
   - Rhythm is the alternation of dense and quiet areas on a consistent scale (4/8/16/32, a deliberate type scale): scan-heavy regions, then a pause, then a single primary action, then a quiet confirmation.
   - Rhythm is also temporal: default → loading → result → success/error must read as one beat each, with no state borrowing another state's skeleton.
   - Decision question: *where does the user pause to decide, and is that pause protected from competing detail?*
   - Failure mode: uniform cards at uniform size producing a flat score with no decision point; or every state stacking banners so default, empty, and error all look identical.

7. **Unity / Harmony** — all parts belong to one product.
   - One radius language, one elevation language, one status palette across default, loading, empty, error, success, restricted, and focus states. Unity across viewports is part of the system, not a luxury.
   - Decision question: *could this state have come from the same product as the previous state?*
   - Failure mode: a mobile layout that invents new components; state banners that appear in states where the state does not apply.

### Composition check (before polishing)

1. Name the focal point (one element) and the eye's path to the primary action.
2. Name the balance type (symmetric vs asymmetrical) and why it fits the task.
3. Confirm the accent budget: only the focal point and the consequence use the strongest contrast.
4. Walk the rhythm: scan → pause → act → confirm; no repeated cards at equal weight flattening the decision point.
5. View every state with the same grammar: same radii, same status color, same spacing scale.

If the answer to any question is "there are several," simplify until there is one.

## 5. Build a small, coherent visual system

Define or reuse semantic roles rather than styling each element independently.

| Dimension | Practical guidance |
|---|---|
| Typography | Use a deliberate type scale; distinguish page title, section, body, label and supporting text. Keep line length readable. |
| Spacing | Use a consistent spacing rhythm. Give related elements tighter spacing than unrelated groups. |
| Color | Assign semantic roles for text, surface, border, action and status. Reserve high emphasis for important actions or states. |
| Shape | Use a consistent radius and border language. Strong rounding should have a product rationale. |
| Elevation | Use shadows or layers to communicate real hierarchy, not to decorate every container. |
| Icons and imagery | Use them to clarify meaning or identity. Do not make an icon carry an action without an accessible name. |
| Data | Choose visual forms that support comparison and interpretation; label units, time ranges and baselines. |

Prefer existing tokens. If a new token is needed, name it by role (for example, `surface-subtle` or `text-muted`), not by one-off appearance.

## 6. Make hierarchy visible

A quick scan should reveal:
- Where the user is.
- The current status or context.
- The most important information.
- The next useful action.
- Any consequence, warning or constraint that changes the decision.

Use size, position, weight, spacing and contrast together. Do not make every title bold, every section a card, every action a filled button or every status a bright color.

Primary actions should be visually clear but should not overpower the information needed to act safely. Secondary and destructive actions should be distinguishable without being hidden.

## 7. Design responsive composition—not a shrunken desktop

Choose layout behavior based on the task and content:

- Reorder content when the mobile task priority differs from desktop.
- Collapse navigation deliberately and expose its expanded state.
- Keep primary actions reachable without covering content.
- Preserve critical table comparisons; use an alternate row or detail layout only when it remains understandable.
- Avoid horizontal page overflow, clipped controls and unreadable compressed columns.
- Keep forms single-column where that improves completion.
- Test actual narrow and wide viewports instead of assuming a CSS breakpoint is sufficient.

## 8. Design visual states as part of the system

Check how the visual language handles:
- Loading and skeletons without implying false content.
- Empty states with a clear explanation and legitimate next step.
- Errors with readable recovery guidance.
- Success only after the system confirms the result.
- Disabled and restricted controls with an understandable reason.
- Focus, hover, pressed and selected states.
- Long content, missing images, dense data and unusual values.

Do not rely on color alone for status, validation or selection.

## 9. Inspect the rendered result

When browser or preview tools are available:

1. Run the actual page with realistic content.
2. Inspect the initial viewport and the full page.
3. Check a narrow viewport and a wider viewport.
4. Exercise the primary interaction and at least one important failure or restricted state.
5. Review keyboard focus, labels, contrast and text wrapping.
6. Fix the highest-impact visual and interaction defects, then inspect again.

A source-code review cannot prove that spacing, alignment, clipping or responsive behavior looks correct. A screenshot cannot prove that interactions or accessibility work. Use the evidence each check can actually provide.

## Visual review checklist

- Can the user identify the page purpose and primary action quickly?
- Is there one focal point, and can the eye trace a single path to the primary action?
- Does the balance (symmetric vs asymmetrical) fit the task, and does the rhythm protect a pause where the user decides?
- Does the composition reflect the real task and content?
- Is the visual style appropriate for this product rather than a generic template?
- Are typography, spacing, alignment and color roles consistent?
- Are important information and consequences visually clear?
- Are responsive layouts intentionally composed?
- Are loading, empty, error, success, disabled and focus states coherent and recognizably from the same product?
- Was the rendered result actually inspected, and are untested areas disclosed?

## Trade-offs

Dense layouts can support expert scanning but increase cognitive load. Large type and generous spacing can improve approachability but reduce visible information. Strong color can clarify priority but becomes noise when overused. Motion can explain change but distract or exclude. Choose based on user tasks, context and evidence—not aesthetic fashion.

Artistic balance, contrast, and rhythm strengthen trust only when they serve the task. A symmetrical page that hides a consequence, or a strong focal point on a decorative hero instead of the action, is a failure of design, not a success of art. If a principle would make the next decision harder to find, drop the principle.
