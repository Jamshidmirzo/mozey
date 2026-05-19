# O'zbekiston Muzeylari Platform

Managed content platform for the O'zbekiston Muzeylari mobile application — 281 museums and 101 historical places across Uzbekistan, in 3 languages (uz, ru, en).

## Architecture

| Component | Tech | Port |
|-----------|------|------|
| Backend API | NestJS 10 + Prisma + PostgreSQL 16 | 3000 |
| Admin Panel | Next.js 14 + shadcn/ui | 3001 |
| Landing Page | Next.js 14 + Tailwind | 3002 |
| Mobile App | Flutter (Dart ^3.6.1) | — |

## Quick Start

```bash
# 1. Copy environment
cp .env.example .env

# 2. Start infrastructure
npm run docker:up

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run db:migrate

# 5. Seed the database
npm run db:seed

# 6. Start the API
npm run dev:api
```

## Project Structure

```
ozbekiston-platform/
├── apps/
│   ├── api/          # NestJS backend
│   ├── admin/        # Next.js admin panel
│   ├── landing/      # Next.js landing page
│   └── mobile/       # Flutter app
├── packages/
│   ├── shared-types/ # TypeScript types from OpenAPI
│   └── ui/           # Shared React components
├── infra/
│   ├── docker-compose.yml
│   └── github-actions/
└── AGENT_PM.md       # Full project specification
```

## API Documentation

Once running, Swagger UI is available at: `http://localhost:3000/api/docs`
