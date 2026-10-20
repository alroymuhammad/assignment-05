# @repo/db

PostgreSQL access and raw SQL migrations for agent memory.

From the repository root:

```sh
docker compose -f docker-compose.dev.yml up -d
pnpm db:migrate
```

The migration creates `agent_memory_session`, `agent_memory_message`, and `agent_memory_error`. Applied migrations and their checksums are recorded in `schema_migration`.

Import `agentMemory` for the PostgreSQL implementation of Anvia's `MemoryStore`. It supports loading, appending, clearing, error recording, and conversation inspection. Lower-level `query`, `withTransaction`, `pool`, and `closeDatabase` exports are also available. The package requires `DATABASE_URL` at runtime.
