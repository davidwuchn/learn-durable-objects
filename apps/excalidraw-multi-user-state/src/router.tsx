import {
  createRootRoute,
  createRouter,
  createRoute,
  Outlet,
} from "@tanstack/react-router";

import ExcalidrawComponent from "./pages/Excalidraw";
import Home from "./pages/Home";

// Define the root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const excalidrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/excalidraw/$id",
  component: ExcalidrawComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

// Define route tree
const routeTree = rootRoute.addChildren([excalidrawRoute, indexRoute]);

// Create router instance
const router = createRouter({ routeTree });

// Export the router and routes for use elsewhere
export { router, rootRoute };
