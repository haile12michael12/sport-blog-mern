import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken, authorize, generateAccessToken, generateRefreshToken, hashPassword, comparePassword } from "./user.controller";
import { loginSchema, registerSchema } from "@shared/schema";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});

export async function registerUserRoutes(app: express.Application) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  });

  app.use("/api", limiter);

  // Auth routes
  app.post("/api/auth/register", authLimiter, async (req: express.Request, res: express.Response) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName,
        role: data.role,
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: accessToken, refreshToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req: express.Request, res: express.Response) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: accessToken, refreshToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  // Add other user-related routes here
  // For example, profile management, user settings, etc.
}