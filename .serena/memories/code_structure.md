The project is a pnpm monorepo with two main packages:

- `apps/excalidraw-backend`: A Cloudflare Worker that handles the backend logic. It uses Durable Objects to store the state of each drawing and to broadcast changes to all connected clients.
- `apps/excalidraw-multi-user-state`: A React application that provides the frontend for the Excalidraw editor. It uses a WebSocket to communicate with the backend and to receive real-time updates.