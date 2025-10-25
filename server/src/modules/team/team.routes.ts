import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";
import { insertTeamSchema } from "@shared/schema";

export async function registerTeamRoutes(app: express.Application) {
  // Teams routes
  app.get("/api/teams", async (req: express.Request, res: express.Response) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams", authenticateToken, authorize("admin"), async (req: any, res: express.Response) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(data);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}