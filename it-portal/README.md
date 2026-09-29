# IT Portal

An anonymized, runnable showcase of an internal IT workspace. It demonstrates the product structure and interface without publishing production credentials, employee records, infrastructure addresses, or operational history.

## What is included

- Original React/Vite portal frontend restored from the complete source archive, including its application shell, navigation, pages, widgets, responsive layout, and visual system.
- A browser-side demo adapter that supplies synthetic records without changing the original page composition or component styling.
- A neutral office map that replaces the production building plans and exact room geometry.
- Rust/Axum API exposing health and neutral demo data.
- Production multi-stage images and a minimal Docker Compose stack.
- Static checks and a privacy checklist in `Guides/`.

The production system also integrates identity, remote management, networking, and notifications. Those systems are represented as optional boundaries only; unrelated infrastructure such as monitoring, automation, VPN, and relay services is intentionally excluded from this repository.

## Run

```bash
cp .env.example .env
docker compose -f docker/compose.yaml up --build -d
curl http://localhost:3010/api/health
```

Open `http://localhost:3010`. The demo data is synthetic and safe for public use.

## Verify

```bash
docker compose -f docker/compose.yaml config -q
docker build -f docker/Dockerfile.frontend -t it-portal-frontend-check .
docker build -f docker/Dockerfile.backend -t it-portal-backend-check .
```

## Public-template boundary

Do not add working `.env` files, database dumps, employee names, telephone numbers, internal DNS names, private IP addresses, screenshots of production data, or deployment notes from a real environment. Use reserved `example.com`, `example.org`, and documentation IP ranges only.

The `itportal.tar.gz` source snapshot is intentionally not part of this repository: it contains production SQL imports, an equipment audit, building plans, and runtime material. Only the reviewed frontend source and the independent demo API are included here.
