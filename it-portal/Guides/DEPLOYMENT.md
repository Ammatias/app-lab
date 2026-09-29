# Deployment

The Web test deployment uses `/home/it-portal` and publishes the frontend on port `3010` by default.

```bash
docker compose -f docker/compose.yaml config -q
docker compose -f docker/compose.yaml build
docker compose -f docker/compose.yaml up -d
```

The compose project contains only `frontend` and `api`. The frontend image runs ESLint, the original unit-test suite, and the Vite production build. Both containers have healthchecks and run with read-only filesystems.
