import { App } from "./src/app";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import express from "express";

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

    // Start the server with port conflict handling
    const basePort = parseInt(process.env.PORT || '5000', 10);
    let port = basePort;
    const maxPortAttempts = 10;

    const listenOnPort = (portToTry: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const serverInstance = app.listen(portToTry, () => {
          log(`Server running on port ${portToTry}`);
          resolve();
        });
        
        serverInstance.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            reject(new Error(`Port ${portToTry} is already in use`));
          } else {
            reject(err);
          }
        });
      });
    };

    // Try to listen on the base port first, then try alternatives
    try {
      await listenOnPort(port);
    } catch (portError) {
      log(`Port ${port} is in use, trying alternative ports...`);
      
      let foundPort = false;
      for (let i = 1; i < maxPortAttempts; i++) {
        const alternativePort = basePort + i;
        try {
          await listenOnPort(alternativePort);
          foundPort = true;
          break;
        } catch (err) {
          // Continue trying the next port
        }
      }
      
      if (!foundPort) {
        throw new Error(`Could not find an available port after ${maxPortAttempts} attempts`);
      }
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();