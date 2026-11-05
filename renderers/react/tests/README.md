# Browser preview sandbox and visual/accessibility validation
## Sandbox choice
The MVP uses a fresh GitHub-hosted Actions runner for each workflow run. Vite binds only to 127.0.0.1:4173. The Playwright request guard permits that exact loopback host/port and aborts all other browser requests. The browser harness receives only the fixed renderer and a static JSON UDS fixture; it does not evaluate generated JavaScript, mount production data, or receive application secrets. The runner is discarded after the job.
This is suitable for validating the fixed UADI renderer and fixture. It is not a hardened sandbox for executing arbitrary AI-generated code. If source-code execution is introduced, use a separate disposable container/VM with a non-root user, read-only base filesystem, bounded CPU/memory/time, no secrets, no Docker socket, restricted or disabled egress, and strict artifact-only input/output. Never run generated source in the production app or on a developer workstation with credentials.
## Browser checks
- Keyboard tab order and controlled form interaction.
- axe-core scan tagged WCAG 2.1 A/AA; fail on serious/critical violations.
- Mobile viewport horizontal-overflow check.
- Desktop screenshot compared with visual-baseline.svg using pixelmatch; a diff image is retained for review.
- Failure screenshots, traces, HTML report and visual diff are uploaded as a 14-day GitHub Actions artifact.
## Limits
These automated checks are regression gates, not proof of full WCAG conformance. Human review, screen-reader testing, cross-browser coverage, responsive viewport matrices and a production-grade untrusted-code sandbox remain separate work.
