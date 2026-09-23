# Portfolio

Public Next.js portfolio frontend. It can read content from the administration API or use the repository's demonstration data.

## Requirements

- Node.js 24
- access to the administration API when `DATA_SOURCE=api`

## Configuration

Copy `.env.example` to `.env`, set `NEXT_PUBLIC_ADMIN_API_URL` to the public API endpoint, and select the required `DATA_SOURCE`. Keep example domains in committed files and never commit production credentials or personal content.

## Local validation

```bash
npm ci
npm run lint
npm run build
```

Run the development server with `npm run dev` and the production server with `npm run start` after a successful build.

## Container example

The application image and sanitized `docker/compose.yaml` example are stored in `docker/`. The health check calls `/api/health` inside the container on port 3000. The example expects existing `frontend` and `backend` Docker networks. Import it into Dockhand for managed deployments and provide the environment values there.

## Security

Only publish neutral demonstration content. Real names, contact details, résumés, production domains, private screenshots, and internal infrastructure information must remain in the private working source.
