# Excalidraw Multi-User App

[![Watch the demo video](https://img.youtube.com/vi/FgWVoryZ8PU/0.jpg)](https://youtu.be/FgWVoryZ8PU?si=XbUy-88CP2OI3psK)

This project consists of two applications:
1. A backend service (excalidraw-backend) built with Cloudflare Workers and Durable Objects
2. A frontend application (excalidraw-multi-user-state) built with React and Excalidraw

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm (for workspace management)
- Cloudflare account with Workers subscription (for deployment)

## Setup

First, install dependencies at the workspace root:

```bash
# Install all dependencies across the workspace
pnpm install
```

## Backend Setup (excalidraw-backend)

### Local Development

```bash
# Generate Cloudflare types
pnpm --filter excalidraw-backend run cf-typegen

# Start the development server
pnpm --filter excalidraw-backend run dev
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm --filter excalidraw-backend run deploy
```

## Frontend Setup (excalidraw-multi-user-state)

### Local Development

```bash
# Generate Cloudflare types
pnpm --filter excalidraw-multi-user-state run cf-typegen

# Start the development server
pnpm --filter excalidraw-multi-user-state run dev
```

### Building and Previewing

```bash
# Build the application
pnpm --filter excalidraw-multi-user-state run build

# Preview the built application
pnpm --filter excalidraw-multi-user-state run preview
```

### Deployment

```bash
# Deploy to Cloudflare Pages
pnpm --filter excalidraw-multi-user-state run deploy
```

## Schemas

Both applications use shared schemas from the `@repo/schemas` package, which ensures type safety and consistency between the frontend and backend. This is managed within the pnpm workspace.
