The project is a pnpm monorepo with the following structure:

- `apps/excalidraw-backend`: The backend service built with Cloudflare Workers and Durable Objects.
- `apps/excalidraw-multi-user-state`: The frontend application built with React and Excalidraw.
- `packages/schemas`: A shared package for Zod schemas to ensure type safety between the frontend and backend.