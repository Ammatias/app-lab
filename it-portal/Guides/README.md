# Project guide

## Purpose

This directory documents the public, anonymized IT Portal template. Production runbooks and infrastructure details do not belong here.

## Architecture

```text
browser -> nginx/frontend -> /api/* -> Rust/Axum API
```

The runnable demo has only two services. Identity and RMM are optional integration boundaries configured through environment variables in private deployments.

## Verification

- Run frontend lint and production build.
- Run `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo test`.
- Validate Docker Compose and both production images.
- Scan tracked files for secrets, private addresses, personal data, and environment-specific paths.
- Do not use production datasets for screenshots.

