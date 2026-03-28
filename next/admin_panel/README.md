# 🖥️ Admin Panel

Admin panel for content management built with Next.js.

> A modern, secure admin dashboard with OAuth authentication, project management, and public API for portfolio integration.

---

## 🚀 Overview

This admin panel provides:

* 🔐 OAuth 2.0 authentication via Authentik
* 📁 Project management (CRUD operations)
* 📝 Content editing for portfolio
* 📊 Build history tracking
* 🔌 Public API for external integrations
* 🗄️ PostgreSQL database with Prisma ORM

---

## 🛠 Tech Stack

* **Framework:** Next.js 16
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** NextAuth.js with Authentik provider
* **Validation:** Zod
* **UI Components:** Radix UI, Lucide React icons

---

## ▶️ Run locally

```bash
# Install dependencies
npm install

# Copy environment variables
cp docker/.env.example docker/.env
# Edit docker/.env with your values

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the admin panel.

---

## 🌍 Deployment

### Docker (recommended)

```bash
cd docker
chmod +x deploy.sh
./deploy.sh
```

### Prerequisites

- Docker & Docker Compose
- PostgreSQL database
- Authentik OAuth application
- External network `proxy` (for Traefik reverse proxy)

---

## 🔐 Authentication

This project uses **NextAuth.js** with **Authentik** as the OAuth provider.

### Setup Authentik

1. Create OAuth Provider in Authentik Admin
2. Create Application linked to the provider
3. Copy Client ID, Client Secret, and Issuer URL to `.env`

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTHENTIK_CLIENT_ID` | OAuth Client ID | `abc123...` |
| `AUTHENTIK_CLIENT_SECRET` | OAuth Client Secret | `xyz789...` |
| `AUTHENTIK_ISSUER` | Authentik issuer URL | `https://auth.example.com/application/o/admin-web/` |
| `NEXTAUTH_URL` | Admin panel URL | `https://admin.example.com` |
| `NEXTAUTH_SECRET` | Session secret (32 chars) | `openssl rand -base64 32` |

---

## 📁 Project Structure

```
admin_panel/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx         # Login page
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Dashboard page
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── content/     # Content editor
│   │   │   │   │   └── page.tsx     # Edit project
│   │   │   │   ├── new/
│   │   │   │   └── page.tsx         # Projects list
│   │   │   └── builds/
│   │   │       └── page.tsx         # Build history
│   │   ├── api/
│   │   │   ├── auth/                # NextAuth endpoints
│   │   │   ├── projects/            # Projects CRUD API
│   │   │   ├── builds/              # Builds API
│   │   │   ├── health/              # Health check
│   │   │   └── public/              # Public API for Portfolio
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── forms/                   # Edit forms
│   │   ├── layout/                  # Header, Sidebar
│   │   ├── tables/                  # Data tables
│   │   └── ui/                      # UI components
│   └── lib/
│       ├── auth.ts                  # NextAuth config
│       └── db.ts                    # Prisma client
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Database migrations
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.migrate           # Migration runner
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── deploy.sh
│   └── README.md
└── package.json
```

---

## 📦 Docker Commands

```bash
# Build
npm run docker:build

# Start
npm run docker:up

# Stop
npm run docker:down

# View logs
npm run docker:logs

# Run migrations
npm run docker:migrate
```

---

## 🔌 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` — NextAuth endpoints

### Projects
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project
- `PUT /api/projects/:id` — Update project

### Public API (for Portfolio)
- `GET /api/public/:slug` — Get project data
- `PUT /api/public/:slug` — Update project content
- `GET /api/public/:slug/content` — Get full content (projects, resume, hero)

### Other
- `GET /api/health` — Health check
- `GET /api/resume/:slug` — Get resume data
- `GET /api/hero/:slug` — Get Hero section data

---

## 🗄️ Database Schema

### Models

- **User** — Admin users (managed by Authentik)
- **Project** — Projects with content and settings
- **Page** — Dynamic pages per project
- **Image** — Uploaded images
- **Build** — Build history

---

## 📄 Documentation

- `docker/README.md` — Docker quick start
- `docker/DEPLOY.md` — Full deployment guide

---

## 🔒 Security

- OAuth 2.0 authentication via Authentik
- Protected API routes
- Input validation with Zod
- SQL injection protection via Prisma

---

**Version:** 2.0
**Last Updated:** March 2026
