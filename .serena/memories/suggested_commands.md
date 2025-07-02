### General

- `pnpm install`: Install all dependencies across the workspace.
- `pnpm dev`: Run both the frontend and backend development servers concurrently.
- `pnpm deploy`: Deploy both the frontend and backend to Cloudflare.

### Backend (`excalidraw-backend`)

- `pnpm --filter excalidraw-backend run cf-typegen`: Generate Cloudflare types.
- `pnpm --filter excalidraw-backend run dev`: Start the development server.
- `pnpm --filter excalidraw-backend run deploy`: Deploy to Cloudflare Workers.

### Frontend (`excalidraw-multi-user-state`)

- `pnpm --filter excalidraw-multi-user-state run cf-typegen`: Generate Cloudflare types.
- `pnpm --filter excalidraw-multi-user-state run dev`: Start the development server.
- `pnpm --filter excalidraw-multi-user-state run build`: Build the application.
- `pnpm --filter excalidraw-multi-user-state run preview`: Preview the built application.
- `pnpm --filter excalidraw-multi-user-state run deploy`: Deploy to Cloudflare Pages.