# Maju-Telco Customer Care Agent

Maju-Telco is an AI customer-support application that helps customers understand and compare cellular data packages. Customers can ask about package names, quotas, validity periods, prices, and terms through a responsive chat interface.

The agent answers from the package catalog in `packages/agents/src/context/document.ts`. It can recommend a package based on a customer's budget, quota, or preferred validity period, but it does not perform purchases, access customer accounts, or handle billing and network issues.

## Features

- Streams AI responses in a responsive web chat
- Supports Bahasa Indonesia by default and follows the customer's language
- Gives catalog-grounded package comparisons and recommendations
- Saves anonymous conversation history in PostgreSQL
- Restores recent conversations after a browser refresh
- Includes optional Anvia Lens tracing and evaluation scripts

## Tech stack

- React 19, Vite, TanStack Router, and Tailwind CSS
- Hono API running on Node.js
- Anvia agent, client, and UI packages
- PostgreSQL 16
- TypeScript and pnpm workspaces

## Requirements

Install these before running the project:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 22.12 or newer (Node.js 24 LTS recommended)
- [pnpm](https://pnpm.io/) 11.24.0
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with Compose
- A Devscale gateway API key

If pnpm is not installed, install the version used by this repository:

```sh
npm install --global pnpm@11.24.0
```

## Run locally

1. Clone the repository and enter its directory:

   ```sh
   git clone https://github.com/alroymuhammad/assignment-05.git
   cd assignment-05
   ```

2. Install the dependencies and build the workspace packages:

   ```sh
   pnpm install
   pnpm build
   ```

   The API imports the compiled `@repo/agents` and `@repo/db` packages from their `dist/` directories, so this initial build is required on a fresh clone.

3. Create your local environment file:

   ```sh
   cp .env.example .env
   ```

   On Windows Command Prompt, use `copy .env.example .env` instead.

4. Open `.env` and set your Devscale gateway key:

   ```dotenv
   OPENAI_API_KEY=your_devscale_gateway_key
   ```

   The default database values already match the included Docker Compose configuration. `TAVILY_API_KEY` and the `ANVIA_LENS_*` variables are optional for normal local use.

5. Start PostgreSQL and apply the database migrations:

   ```sh
   pnpm db:up
   pnpm db:migrate
   ```

6. Start the API and web application:

   ```sh
   pnpm dev
   ```

7. Open [http://localhost:5173](http://localhost:5173) in a browser. The API runs at [http://localhost:3000](http://localhost:3000), and its health endpoint is available at [http://localhost:3000/api/health](http://localhost:3000/api/health).

Press `Ctrl+C` to stop the development servers. Stop the database container separately with:

```sh
pnpm db:down
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Devscale gateway API key used by the agent |
| `OPENAI_BASE_URL` | No | Model gateway URL; defaults to `https://gateway.devscale.id/v1` |
| `DATABASE_URL` | Yes | PostgreSQL connection used by the API and migrations |
| `POSTGRES_DB` | No | Database created by Docker Compose |
| `POSTGRES_USER` | No | Local PostgreSQL username |
| `POSTGRES_PASSWORD` | No | Local PostgreSQL password |
| `POSTGRES_PORT` | No | Host port for PostgreSQL; defaults to `5432` |
| `TAVILY_API_KEY` | No | Key for the exported web tools, which are not attached to the chat agent by default |
| `ANVIA_LENS_*` | No | Anvia Lens tracing configuration; tracing stays disabled without the connection credentials |

Do not commit `.env` or expose its API keys in browser code.

## Useful commands

```sh
pnpm dev        # Run the API and web app together
pnpm build      # Build all workspace packages
pnpm typecheck  # Type-check all workspace packages
pnpm db:up      # Start the PostgreSQL container
pnpm db:migrate # Apply pending database migrations
pnpm db:down    # Stop the PostgreSQL container
```

To run one application at a time:

```sh
pnpm --filter @repo/api dev
pnpm --filter @repo/web dev
```

The web development server proxies `/api` requests to the API. For production deployment, configure the hosting platform or reverse proxy to route `/api` to the API service.

## Project structure

```text
apps/
  api/                  Hono API and chat endpoints
  web/                  React customer chat interface
packages/
  agents/               Maju-Telco agent, instructions, catalog, and evals
  db/                   PostgreSQL client, memory store, and migrations
```

The package catalog is maintained in `packages/agents/src/context/document.ts`, while the agent's behavior and scope are defined in `packages/agents/src/instruction.ts`.
