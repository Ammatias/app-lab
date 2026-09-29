# IT Portal demo guide

This repository is an anonymized derivative of the complete IT Portal source snapshot.

## Source boundary

- The original frontend structure, components, routes, styles, and non-sensitive tests are preserved.
- `frontend/src/demo/installDemoFetch.js` supplies synthetic browser data so the original interface can run without production authentication, databases, or integrations.
- The production equipment audit and building plans are excluded. The map route uses a standalone neutral office schematic with no relationship to the real site.
- The lightweight Rust API is limited to health and neutral demo endpoints.
- Production SQL imports, `.env`, uploads, generated binaries, caches, internal documentation, backup files, and operational history are excluded.
- Tailscale, Uptime Kuma, Prometheus, Grafana, Telegram Relay, and n8n are not deployed by this template.

## Required checks

1. `docker compose -f docker/compose.yaml config -q`
2. Frontend ESLint, unit tests, and production build through `docker/Dockerfile.frontend`
3. Backend tests, formatting, Clippy, and production build
4. Privacy scan for credentials, real names, domains, and private network addresses
5. Browser verification of desktop and responsive layouts before producing portfolio screenshots

Never use screenshots from the production portal because they contain private employee and infrastructure data.
