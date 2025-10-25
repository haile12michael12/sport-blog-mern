import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";
import { insertLiveCommentarySchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

export async function registerCommentaryRoutes(app: express.Application, wss: WebSocketServer) {
  // Live commentary routes
  app.get("/api/live-commentary", async (req: express.Request, res: express.Response) => {
    try {
      const commentary = await storage.getLiveCommentary();
      res.json(commentary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/live-commentary", authenticateToken, authorize("admin", "editor"), async (req: any, res: express.Response) => {
    try {
      const data = insertLiveCommentarySchema.parse(req.body);
      const commentary = await storage.createLiveCommentary(data);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "live-commentary", data: commentary }));
        }
      });

      res.status(201).json(commentary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}