# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

### dsb-12-github (Python Developer Frameworks Hub)
- **Kind**: react-vite web app
- **Preview path**: `/`
- **Title**: dsb-12-github
- **Public**: yes — anyone can view and contribute
- **Purpose**: Discover, star, and explore Python frameworks and project templates. Community-curated directory.

Pages:
- `/` — Home dashboard: stats, trending frameworks, recent templates
- `/frameworks` — Browse all frameworks (searchable/filterable by category)
- `/frameworks/:id` — Framework detail with star upvoting and linked templates
- `/templates` — Browse all project templates (filterable by framework)
- `/templates/:id` — Template detail
- `/submit` — Submit a new framework or template

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/dsb-12-github run dev` — run frontend locally

## Database Tables

- `frameworks` — Python framework records (name, category, stars, tags, links, etc.)
- `templates` — Project templates linked to frameworks

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
