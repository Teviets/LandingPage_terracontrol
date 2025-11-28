# TerraControl Landing (Vite)

React 19 landing page powered by Vite + SWC. All static assets live in `/public` and routes are handled client-side with React Router.

## Scripts

- `npm run dev` – start the Vite dev server on port 5173.
- `npm run build` – create a production build in `dist/`.
- `npm run preview` – preview the optimized build locally.
- `npm run test` – run Vitest + Testing Library.

## Environment variables

Vite exposes variables that start with `VITE_`. Copy `.env.example` into `.env.development` or `.env.production` to configure the API base URL:

```
VITE_API_BASE_URL=http://localhost:5174/api
```

When building inside Docker the default is `/api`, so frontend network requests are routed through Nginx and end up in the Express API container.
