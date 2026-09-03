# App Lab portfolio stack

Public template for a portfolio website and its content administration panel.
The repository contains example profile data and placeholder configuration only.

## Applications

- `portfolio` — public Next.js website.
- `admin_panel` — Next.js administration panel backed by PostgreSQL and Prisma.

## Local setup

1. Install dependencies with `npm ci` in each application directory.
2. Copy the relevant `.env.example` files to `.env`.
3. Replace every `change-me`, `replace-with-*`, `example.com`, and
   `your-username` placeholder before deployment.
4. Run `npm run build` to validate each application.

Docker Compose definitions are stored under each application's `docker`
directory. They intentionally reference environment variables and do not embed
credentials.

## Security

Never commit `.env` files, database dumps, private keys, production screenshots,
or internal operational notes. The included seed creates demonstration content;
replace it with your own data only in a private deployment.
