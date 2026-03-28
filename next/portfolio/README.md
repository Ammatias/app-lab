# 🌐 Portfolio

Personal portfolio website built with Next.js.

> A modern, minimal and fast website to showcase projects, skills and experience.

---

## 🚀 Overview

This is a portfolio website that displays:

* 💼 Projects
* 🧠 Technical skills
* 📄 Work experience

Built with focus on **performance, simplicity and clean UI**.

**Key Features:**
- 3D background with Three.js (10 floating lines)
- Dark/Light theme switching
- Parallax effects for headings
- Fade + Slide animations on scroll
- Resume download in PDF and DOCX formats
- Fully responsive design
- Integration with Admin Panel for dynamic content

---

## 🛠 Tech Stack

* **Framework:** Next.js 16
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4
* **Animations:** Framer Motion
* **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
* **PDF Generation:** @react-pdf/renderer, docx
* **UI Icons:** Lucide React

---

## ▶️ Run locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🌍 Deployment

### Docker (recommended)

```bash
cd docker
chmod +x deploy.sh
./deploy.sh
```

### Vercel

Deploy using the Vercel platform for automatic deployments from Git.

---

## 🔗 Integration with Admin Panel

This portfolio integrates with the Admin Panel for dynamic content management.

### Data Sources

**1. Static data (default)**
```bash
DATA_SOURCE="static"
```
Uses local data from `/data/*.ts` files.

**2. API from Admin Panel**
```bash
DATA_SOURCE="api"
NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3000"
```
Fetches content dynamically from the Admin Panel API.

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/public/portfolio/content` | Get all content (projects, resume, hero) |
| `GET /api/resume/portfolio` | Get resume data |
| `GET /api/hero/portfolio` | Get Hero section data |
| `GET /api/projects/portfolio` | Get projects list |

---

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── api/
│   │   └── revalidate/          # Webhook for cache revalidation
│   ├── resume/
│   │   ├── page.tsx             # Resume page
│   │   └── ResumeClient.tsx     # Resume client component
│   ├── page.tsx                 # Home page
│   └── layout.tsx               # Root layout
├── components/
│   ├── resume/                  # Resume components
│   ├── sections/                # Page sections (Hero, Projects, etc.)
│   └── ui/                      # UI components
├── data/
│   ├── hero.ts                  # Hero section data
│   ├── resume.ts                # Resume data
│   ├── projects.ts              # Projects data
│   └── theme.ts                 # Theme configuration
├── lib/
│   └── api-client.ts            # API client for Admin Panel
├── docker/
│   ├── Dockerfile
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
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ADMIN_API_URL` | Admin Panel API URL | `http://admin-panel:3000` |
| `DATA_SOURCE` | Data source mode | `api` or `static` |

---

## 📄 Documentation

- `docker/README.md` — Docker quick start
- `docker/DEPLOY.md` — Full deployment guide

---

## 🎯 Features

### Resume Download

The portfolio supports downloading resume in two formats:
- **PDF** — Generated using @react-pdf/renderer
- **DOCX** — Generated using docx library

### Theme System

Built-in dark/light theme with:
- Smooth transitions
- Persistent preference storage
- System preference detection

### 3D Background

Animated Three.js background with:
- 10 floating lines
- Smooth mouse-follow effect
- Performance optimized

---

**Version:** 2.0
**Last Updated:** March 2026
