# Next.js projects

Public template for a portfolio website and its content administration panel.
The repository contains example profile data and placeholder configuration only.

## Applications

- [`portfolio`](portfolio/README.md) — public Next.js website.
- [`admin-panel`](admin-panel/README.md) — Next.js administration panel backed by PostgreSQL and Prisma.

## Local setup

1. Open the README for the application you want to run.
2. Copy its `.env.example` to `.env`.
3. Replace every placeholder before deployment.
4. Run `npm ci`, `npm run lint`, and `npm run build` in that application directory.

Docker Compose examples are stored as `docker/compose.yaml`. They intentionally reference environment variables and do not embed credentials. The live infrastructure is managed through Dockhand; these files are application deployment examples, not production state.

## Security

Never commit `.env` files, database dumps, private keys, production screenshots,
or internal operational notes. The included seed creates demonstration content;
replace it with your own data only in a private deployment.
