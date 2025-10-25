import express from "express";
import { createServer, Server } from "http";
import { WebSocketServer, WebSocket as WSWebSocket } from "ws";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { storage } from "./database/storage";
import { seedDatabase } from "./database/seed";

const upload = multer({ storage: multer.memoryStorage() });

export class App {
  public app: express.Application;
  public server!: Server;
  private wss!: WebSocketServer;

  constructor() {
    this.app = express();
    this.app.use(express.json({
      verify: (req: any, _res: express.Response, buf: Buffer) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson: any, ...args: any[]) {
        capturedJsonResponse = bodyJson;
        // @ts-ignore - Type mismatch but works in practice
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          console.log(logLine);
        }
      });

      next();
    });
  }

  async initialize() {
    // Initialize database
    await seedDatabase();

    // Setup routes
    await this.setupRoutes();

    // Setup error handling
    this.setupErrorHandling();

    // Setup WebSocket
    this.setupWebSocket();

    return this;
  }

  private async setupRoutes() {
    // Import and register user routes
    const { registerUserRoutes } = await import('./modules/user/user.routes');
    await registerUserRoutes(this.app);

    // Import and register post routes
    const { registerPostRoutes } = await import('./modules/post/post.routes');
    await registerPostRoutes(this.app);

    // Import and register comment routes
    const { registerCommentRoutes } = await import('./modules/comment/comment.routes');
    await registerCommentRoutes(this.app);

    // Import and register team routes
    const { registerTeamRoutes } = await import('./modules/team/team.routes');
    await registerTeamRoutes(this.app);

    // Import and register player routes
    const { registerPlayerRoutes } = await import('./modules/player/player.routes');
    await registerPlayerRoutes(this.app);

    // Import and register commentary routes
    const { registerCommentaryRoutes } = await import('./modules/commentary/commentary.routes');
    await registerCommentaryRoutes(this.app, this.wss);
  }

  private setupErrorHandling() {
    this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });
  }

  private setupWebSocket() {
    this.server = createServer(this.app);
    
    this.wss = new WebSocketServer({ server: this.server, path: "/ws" });

    this.wss.on("connection", (ws: WSWebSocket) => {
      console.log("WebSocket client connected");

      ws.on("message", async (message: any) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === "subscribe" && data.channel === "live-commentary") {
            const commentary = await storage.getLiveCommentary();
            ws.send(JSON.stringify({ type: "live-commentary-history", data: commentary }));
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      });

      ws.on("close", () => {
        console.log("WebSocket client disconnected");
      });
    });
  }

  listen(port: number, callback?: () => void) {
    // Check if we're on Windows to avoid unsupported reusePort option
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      this.server.listen({
        port,
        host: "0.0.0.0",
      }, callback);
    } else {
      this.server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, callback);
    }
  }
}