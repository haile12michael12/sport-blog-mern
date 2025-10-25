import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";
import { insertPlayerSchema } from "@shared/schema";

export async function registerPlayerRoutes(app: express.Application) {
  // Players routes
  app.get("/api/players", async (req: express.Request, res: express.Response) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players", authenticateToken, authorize("admin"), async (req: any, res: express.Response) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(data);
      res.status(201).json(player);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}