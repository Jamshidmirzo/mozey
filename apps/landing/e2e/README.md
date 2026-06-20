# Landing E2E (Playwright)

## Setup

```bash
cd web/apps/landing
npm i -D @playwright/test
npx playwright install --with-deps chromium
```

## Запуск

1. Backend (`cd ../api && npm run dev`) — :3030 в этом монорепо (см. `.env` → PORT=3030).
2. Засеяйте БД (`npm run db:seed` + руками добавьте несколько музеев через admin).
3. Landing (`cd web/apps/landing && npm run dev`) — :3200.
4. ```bash
   cd web/apps/landing
   npx playwright test
   ```

## Известное

- TC-F-10 — skip, нужен mock сетевых запросов (page.route).
- TC-F-02 — сейчас soft-warn если запрос ушёл не на canonical API. Сделать hard-fail когда CORS и DEV-режимы выровнены.
