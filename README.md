# App Lab

Public source code for websites, applications, and software projects.

The repository contains publishable project snapshots rather than private deployment state. Projects can use Next.js or other web, desktop, and application technologies as the collection grows.

## Current projects

```text
next/
├── portfolio/    # public portfolio website
└── admin_panel/  # content administration panel
```

Both current applications use Next.js and TypeScript. The administration panel uses PostgreSQL and Prisma. Project-specific setup and validation instructions are in [`next/README.md`](next/README.md).

## Privacy boundary

This is a public repository. It must not contain:

- real names, résumés, contact details, private screenshots, or other personal data;
- production domains, internal addresses, infrastructure notes, or database contents;
- passwords, tokens, private keys, cookies, or populated `.env` files;
- private deployment artifacts or operational documentation.

Published examples use reserved domains, neutral demonstration content, and explicit placeholders. Private working sources must be sanitized before they are copied here.

## Validation

For each Node.js application:

```bash
npm ci
npm run lint
npm run build
```

Before publication, also inspect the complete diff and scan the repository history for personal data and credentials.

## Related repositories

- [homelab](https://github.com/Ammatias/homelab) — portable infrastructure examples
- [cheat-sheets](https://github.com/Ammatias/cheat-sheets) — administration notes and utilities

## License and security

The repository is licensed under the [MIT License](LICENSE). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
