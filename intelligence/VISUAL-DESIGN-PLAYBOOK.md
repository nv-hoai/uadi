# Visual Design Playbook

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

## 4. Build a small, coherent visual system

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

## 5. Make hierarchy visible

A quick scan should reveal:
- Where the user is.
- The current status or context.
- The most important information.
- The next useful action.
- Any consequence, warning or constraint that changes the decision.

Use size, position, weight, spacing and contrast together. Do not make every title bold, every section a card, every action a filled button or every status a bright color.

Primary actions should be visually clear but should not overpower the information needed to act safely. Secondary and destructive actions should be distinguishable without being hidden.

## 6. Design responsive composition—not a shrunken desktop

Choose layout behavior based on the task and content:

- Reorder content when the mobile task priority differs from desktop.
- Collapse navigation deliberately and expose its expanded state.
- Keep primary actions reachable without covering content.
- Preserve critical table comparisons; use an alternate row or detail layout only when it remains understandable.
- Avoid horizontal page overflow, clipped controls and unreadable compressed columns.
- Keep forms single-column where that improves completion.
- Test actual narrow and wide viewports instead of assuming a CSS breakpoint is sufficient.

## 7. Design visual states as part of the system

Check how the visual language handles:
- Loading and skeletons without implying false content.
- Empty states with a clear explanation and legitimate next step.
- Errors with readable recovery guidance.
- Success only after the system confirms the result.
- Disabled and restricted controls with an understandable reason.
- Focus, hover, pressed and selected states.
- Long content, missing images, dense data and unusual values.

Do not rely on color alone for status, validation or selection.

## 8. Inspect the rendered result

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
- Does the composition reflect the real task and content?
- Is the visual style appropriate for this product rather than a generic template?
- Are typography, spacing, alignment and color roles consistent?
- Are important information and consequences visually clear?
- Are responsive layouts intentionally composed?
- Are loading, empty, error, success, disabled and focus states coherent?
- Was the rendered result actually inspected, and are untested areas disclosed?

## Trade-offs

Dense layouts can support expert scanning but increase cognitive load. Large type and generous spacing can improve approachability but reduce visible information. Strong color can clarify priority but becomes noise when overused. Motion can explain change but distract or exclude. Choose based on user tasks, context and evidence—not aesthetic fashion.
