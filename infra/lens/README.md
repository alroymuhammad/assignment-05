# Lens (local)

Official Lens v0.16.0 Compose stack, isolated as `assignment-05-lens`.
Source: https://docs.anvia.dev/lens/install-and-setup

Open http://localhost:8081 and create an account. The first account becomes the workspace owner. Then create a project and an ingestion key from **Connect**.

```sh
cd infra/lens

docker compose up -d
docker compose ps -a
docker compose logs --tail=100 migrate api worker web
docker compose stop
```

`.env` contains generated secrets, is ignored by Git, and has owner-only permissions. `.env.example` documents the settings without secrets. On another machine, copy it to `.env` and replace all five secret placeholders with independent values from `openssl rand -hex 32` before starting.

Only the web entry point is published, bound to `127.0.0.1:8081`; databases remain private. Data persists in Docker volumes. Do not use `docker compose down -v` unless you intend to delete all Lens data.

The release's system monitor has read-only mounts of the Docker host's `/proc`, `/`, and `/var/lib/docker` for host metrics. It is isolated on an internal network. Mount propagation is omitted for Docker Desktop compatibility; host metrics describe the Docker VM, not the Windows host.

If Docker's WSL credential helper fails while pulling, use `docker compose up -d --pull never` only when the pinned images are already installed locally.

This is a local setup: SMTP, HTTPS, backups, and application telemetry integration are not configured.
