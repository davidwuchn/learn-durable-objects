Here are some suggested commands for developing in this project:

### Workspace Commands
- `pnpm install`: Install all dependencies across the workspace.
- `pnpm dev`: Start the development servers for both the frontend and backend concurrently.
- `pnpm deploy`: Deploy both the frontend and backend applications to Cloudflare.

### Frontend (`excalidraw-multi-user-state`)
- `pnpm --filter excalidraw-multi-user-state run dev`: Start the frontend development server.
- `pnpm --filter excalidraw-multi-user-state run build`: Build the frontend application.
- `pnpm --filter excalidraw-multi-user-state run lint`: Run ESLint to check for code quality and style issues.
- `pnpm --filter excalidraw-multi-user-state run preview`: Preview the built application locally.
- `pnpm --filter excalidraw-multi-user-state run deploy`: Deploy the frontend to Cloudflare Pages.
- `pnpm --filter excalidraw-multi-user-state run cf-typegen`: Generate Cloudflare types for the frontend.

### Backend (`excalidraw-backend`)
- `pnpm --filter excalidraw-backend run dev`: Start the backend development server.
- `pnpm --filter excalidraw-backend run deploy`: Deploy the backend to Cloudflare Workers.
- `pnpm --filter excalidraw-backend run cf-typegen`: Generate Cloudflare types for the backend.