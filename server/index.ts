import { App } from "./src/app";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import express from "express";

/**
 * Finds an available port starting from the preferred port
 */
function findAvailablePort(preferredPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(preferredPort, () => {
      const { port } = server.address() as { port: number };
      server.close(() => {
        resolve(port);
      });
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Try the next port
        findAvailablePort(preferredPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

async function startServer() {
  try {
    // Create and initialize the app
    const appInstance = new App();
    const app = await appInstance.initialize();

    // Get the HTTP server instance
    const server = app.server;

    // Setup Vite in development or serve static files in production
    if (process.env.NODE_ENV === "development") {
      // @ts-ignore - Type mismatch but works in practice
      await setupVite(app.app, server);
    } else {
      // @ts-ignore - Type mismatch but works in practice
      serveStatic(app.app);
    }

    // Find an available port starting from the preferred port
    const preferredPort = parseInt(process.env.PORT || '5000', 10);
    const availablePort = await findAvailablePort(preferredPort);
    
    // Start the server on the available port
    app.listen(availablePort, () => {
      log(`Server running on port ${availablePort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();