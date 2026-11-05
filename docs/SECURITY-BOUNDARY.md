# UADI Security Boundary

## Threat model

UADI treats repository content, project files, model output and generated source as untrusted. Its portable instructions and optional validators do not claim to securely execute arbitrary source code.

## Safe default behavior

- Do not execute generated JavaScript/TypeScript as part of schema validation.
- Use fixed renderer code and declarative UDS fixtures for browser smoke tests.
- Run CI on fresh hosted runners with least-privilege permissions and checkout credentials disabled.
- Keep secrets out of preview/test processes; restrict browser network requests to the loopback preview origin.
- Treat static checks as signals only. A clean scan does not prove code is safe.

## When executing untrusted generated source

The host must provide an appropriately isolated, disposable environment, with:
- non-root identity, read-only base filesystem and narrowly scoped writable scratch space;
- no production secrets, host credentials, Docker socket or privileged mounts;
- CPU, memory, process-count and wall-clock limits;
- default-deny network egress with explicit allowlists where essential;
- syscall/capability restrictions and patched runtime images;
- artifact input/output allowlists, size limits and secret scanning;
- destruction of the environment after each run.

The portable UADI package cannot create or attest to these infrastructure guarantees by itself. Follow the host platform's execution and security policies.
