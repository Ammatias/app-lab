# Admin Panel

Next.js administration panel for managing site projects, content, media, and builds. It uses PostgreSQL through Prisma and can authenticate users through an OpenID Connect provider.

## Requirements

- Node.js 24
- PostgreSQL
- an OpenID Connect client for authenticated deployments

## Configuration

Copy `.env.example` to `.env` and replace every placeholder. The template documents the database URL, authentication provider, session secret, administration API URL, and public portfolio URL. Never commit the populated `.env` file.

## Local validation

```bash
npm ci
npm run db:generate
npm run lint
npm run build
```

Apply an existing production migration with `npm run db:migrate:deploy`. Use `npm run db:migrate` only while developing a new migration.

## Container example

The application image, migration image, and sanitized Compose example are in `docker/`. The Compose health check calls `/api/health` inside the application container on port 3000. Import the configuration into Dockhand for managed deployments; keep runtime secrets in Dockhand rather than this repository.

The `backend` Docker network must already exist. Start the application with the `docker:up` script and run the optional `migrate` profile only when a database migration is intended.

## Persistent data and security

The database is external to this project. Uploaded media should be backed up according to the deployment that supplies its storage. Rotate the database, OIDC, and session credentials if they are exposed. Do not publish database dumps, populated environment files, private media, or production URLs.
