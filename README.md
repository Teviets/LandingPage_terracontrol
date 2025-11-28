# TerraControl Landing Platform

Docker-ready mono-repo that contains the marketing site (Vite + React 19) and a lightweight Express API backed by PostgreSQL + Prisma. Two docker-compose files cover both day-to-day development and the production stack that will run behind `terracontrolgt.com` on Nginx.

## Project layout

```
/landing   → Vite frontend code
/server    → Express API + Prisma schema
```

## Local development (without Docker)

1. **Frontend**
   ```bash
   cd landing
   npm install
   npm run dev
   ```
2. **Backend**
   ```bash
   cd server
   cp .env.example .env
   # Update DATABASE_URL to point to your local PostgreSQL instance
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```
3. Point the frontend to the API by setting `landing/.env.development` with `VITE_API_BASE_URL=http://localhost:5174/api`.

## Environment variables

- `landing/.env.*` → Vite variables (prefixed with `VITE_`).
- `server/.env` → Express + Prisma variables, notably `DATABASE_URL`, `PORT`, `CORS_ORIGIN`.

Example connection string for Docker compose:
```
postgresql://terra:terra@db:5432/terracontrol?schema=public
```

## Prisma migrations & seeders

- Create a new migration: `npm run migrate:dev -- --name descriptive-name` inside `server/`.
- Apply migrations in prod (or inside Docker): `npm run migrate:deploy`.
- Seed the database: `npm run seed` (runs `prisma/seed.js`). The sample seeder inserts two `ContactRequest` rows.

## Docker workflows

### Development stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:
- `db` – PostgreSQL 16 with a bind-mounted volume.
- `api` – Express + Prisma running through Nodemon with hot reload.
- `frontend` – Vite dev server with HMR (available on `http://localhost:5175` on the host while talking to `http://api:5174` inside the network).

Use `docker compose -f docker-compose.dev.yml exec api npm run migrate:dev -- --name add-table` whenever you evolve the schema.

### Production stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Services:
- `db` – PostgreSQL with a persistent `postgres-data` volume.
- `api` – Production Express container that runs `prisma migrate deploy` before starting.
- `frontend` – Nginx image that serves the Vite build and proxies `/api` traffic to the `api` service while responding for `terracontrolgt.com`.

Point DNS for `terracontrolgt.com` (and `www`) to the host that runs this compose file. TLS can be handled either on the host or by extending the Nginx image with certbot.
