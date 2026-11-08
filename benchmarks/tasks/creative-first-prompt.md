# Benchmark Task: First Creative Prompt to First Image

Task version: 1.0.0

## Scenario
You are designing the first prompt experience for a creator tool that turns a text description into a generated illustration. New users arrive from a homepage and must describe what they want, choose an optional style, preview the result, run a second variation, and export it. The current page shows a blank prompt box with no guidance and no credit information.

## Product facts
- Each new account starts with 10 free credits. One generation costs 1 credit; a variation costs 1 credit. Credits do not expire in this scenario.
- The tool generates a preview image from the prompt within about 30 seconds; no underlying model, quality score, or ranking is exposed.
- The user can optionally pick one of four styles (flat, watercolor, photo-realistic, line art) or leave style unset.
- Prompt guidance exists: add subject, setting, and mood works better than a single word; sensitive or violent content is refused with a brief explanation.
- After generation, the user can download the preview at 1024px or regenerate with 1 credit. Canceled jobs do not consume a credit.
- Export is a PNG download; the tool does not publish to social platforms or store a public gallery.
- No automatic refund, bonus credits, or model selection is available.

## Primary users and outcomes
The primary user is a first-time creator who does not know how to prompt and does not know whether they are about to spend a credit. They need to understand the credit cost, what input makes a good prompt, what the output will look like, and how to retry or exit without confusion. The business wants first images without fake quality claims or credit surprises.

## Constraints and risks
- Do not claim generation quality, speed guarantees, or that output is ready to publish; state that the preview is an AI generation and may not match the description.
- Show credit cost and remaining credits before generation and on retry; never deduct a credit for a canceled or refused job without saying so.
- Explain what makes a good prompt concretely (subject, setting, mood) without inventing research, scores, or provider behavior.
- Keep the first path short and skippable: prompt → optional style → generate → preview → export or retry.
- Include validation (empty/short prompt), loading with progress, refused-content, success, insufficient-credits, and empty-recent states where relevant.
- Use the host project's existing stack and design conventions if a project is supplied. If no codebase is supplied, provide a framework-neutral specification and a clear prototype.

## Task prompt
Design the first prompt-to-image experience for this product. First identify what a new creator needs to know and do, in what order, and what must never be implied. Then design and implement a responsive experience or provide a detailed framework-neutral specification if implementation is unavailable.

Do not add features outside the scenario unless you explain why they are necessary. Do not invent generation quality metrics, model names, or backend behavior.

## Expected deliverables
- Compact product model with facts, assumptions and unknowns separated.
- Primary journey: prompt guidance, optional style, generation, preview, export/retry.
- Rationale for credit display, guidance level, and refusal handling.
- Responsive UI or detailed specification.
- Validation, loading, refused, success, and insufficient-credits states.
- Short review of trust and misunderstanding risks.

## Reviewer questions
- Can a new creator understand the credit cost before generating?
- Does the prompt guidance teach what to enter without inventing metrics or research?
- Is the preview framed honestly as an AI generation, not a guaranteed result?
- Does the retry/export path keep credit state unambiguous?
- Are refusal, insufficient-credits, and loading states designed rather than left to defaults?
- Does the mobile layout preserve the prompt, credit, and generate action?
- Does the visual design feel appropriate for a creator tool without overpromising?
