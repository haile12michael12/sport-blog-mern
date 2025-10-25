import { App } from './app';
import { setupVite, serveStatic, log } from "../vite";

async function startServer() {
  try {
    const appInstance = new App();
    const app = await appInstance.initialize();

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.app.get("env") === "development") {
      await setupVite(app.app, app.server);
    } else {
      serveStatic(app.app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Check if we're on Windows to avoid unsupported reusePort option
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      app.listen(port, () => {
        log(`Server running on port ${port}`);
      });
    } else {
      app.listen(port, () => {
        log(`Server running on port ${port}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();