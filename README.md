# Ensiklopedia Flora & Fauna Papua Barat Daya

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)

A species catalog and interactive map for the flora and fauna of Southwest Papua (Papua Barat Daya). Browse species by family, conservation status, and region on a live map, or drill into a full taxonomic record with photos and distribution data. An admin panel handles species entry, spatial range drawing, and bulk import from spreadsheets.

## Features

- Full-screen interactive map (`maplibre-gl`) with clustering and per-species detail views
- Species catalog with filtering by family, conservation status, and region
- Admin CRUD for species and categories, backed by Postgres via Drizzle ORM
- Spatial drawing tools (`terra-draw`) for marking species range on the map
- Bulk import from an Excel spreadsheet (`pnpm db:import`)
- Session-based admin auth (`jose`)

## Table of contents

- [Tech stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL 17
- [maplibre-gl](https://maplibre.org) + [terra-draw](https://github.com/JamesLMilner/terra-draw) for the map
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4
- [jose](https://github.com/panva/jose) for signed session cookies
- [Zod](https://zod.dev) for form/schema validation

## Installation

Requires Node.js, [pnpm](https://pnpm.io), and Docker (for local Postgres).

```bash
pnpm install
```

Copy the env template and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string, matches `docker-compose.yml` |
| `ADMIN_EMAIL` | Login for the single admin account |
| `ADMIN_PASSWORD` | Password for the admin account |
| `SESSION_SECRET` | Long random string used to sign the session cookie |

Start Postgres and set up the schema:

```bash
docker compose up -d
pnpm db:push
```

Load data, either the seed script or the bundled spreadsheet:

```bash
pnpm db:seed
# or
pnpm db:import
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Public routes

| Route | Page |
| --- | --- |
| `/` | Home — full-screen species map, search, stats |
| `/katalog` | Species catalog, filterable grid |
| `/katalog/[slug]` | Species detail: taxonomy, photos, mini map |
| `/tentang` | About — project background and data sources |
| `/login` | Admin login |

### Admin routes

Sign in at `/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

| Route | Page |
| --- | --- |
| `/admin` | Dashboard — metrics and species counts |
| `/admin/spesies` | Species data table |
| `/admin/spesies/tambah` | Add species (multi-step form, including map drawing) |
| `/admin/spesies/[id]/edit` | Edit species |
| `/admin/kategori` | Manage categories (order, family, conservation status) |

Inspect the database directly with:

```bash
pnpm db:studio
```

## Contributing

This is a solo project. Bug reports and suggestions are welcome as GitHub issues. For anything larger than a small fix, open an issue first to discuss the change before sending a pull request.

## License

[MIT](./LICENSE)
