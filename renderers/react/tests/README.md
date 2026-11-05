# Browser validation
Playwright runs the renderer on loopback in an ephemeral CI runner. The browser request guard aborts all non-loopback traffic. No credentials, production data, generated executable source, or secrets are provided to the preview process.
Checks cover keyboard interaction, required form fields, axe-core WCAG 2.1 A/AA scans, mobile overflow, and deterministic desktop screenshot capture. Screenshots are retained as CI artifacts for review. This is an automated smoke/accessibility suite, not a claim of complete WCAG conformance or pixel-perfect baseline comparison.
