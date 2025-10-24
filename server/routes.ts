import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { authenticateToken, authorize, hashPassword, comparePassword, generateAccessToken, generateRefreshToken, type AuthRequest } from "./auth";
import { loginSchema, registerSchema, insertPostSchema, insertCommentSchema, insertTeamSchema, insertPlayerSchema, insertLiveCommentarySchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", limiter);

  // Auth routes
  app.post("/api/auth/register", authLimiter, async (req, res) => {
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

  app.post("/api/auth/login", authLimiter, async (req, res) => {
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

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts({ status: "published" });
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
          };
        })
      );
      res.json(postsWithAuthors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/featured", async (req, res) => {
    try {
      const posts = await storage.getPosts({ status: "published", isFeatured: true });
      const postsWithAuthors = await Promise.all(
        posts.slice(0, 3).map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
          };
        })
      );
      res.json(postsWithAuthors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/trending", async (req, res) => {
    try {
      const posts = await storage.getPosts({ status: "published" });
      const trending = posts
        .sort((a, b) => {
          const scoreA = a.viewCount * 0.3 + a.likeCount * 0.7;
          const scoreB = b.viewCount * 0.3 + b.likeCount * 0.7;
          return scoreB - scoreA;
        })
        .slice(0, 10);

      const postsWithAuthors = await Promise.all(
        trending.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
          };
        })
      );
      res.json(postsWithAuthors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/search", async (req, res) => {
    try {
      const search = req.query.q as string;
      if (!search) {
        return res.json([]);
      }

      const posts = await storage.getPosts({ status: "published", search });
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
          };
        })
      );
      res.json(postsWithAuthors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/my-posts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const posts = await storage.getPosts({ authorId: req.user!.id });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const posts = await storage.getPosts({ authorId: req.user!.id });
      const totalPosts = posts.length;
      const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
      const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);

      let totalComments = 0;
      for (const post of posts) {
        const comments = await storage.getComments(post.id);
        totalComments += comments.length;
      }

      res.json({ totalPosts, totalViews, totalLikes, totalComments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      await storage.incrementPostViews(post.id);

      const author = await storage.getUser(post.authorId);
      res.json({
        ...post,
        author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", authenticateToken, authorize("author", "editor", "admin"), async (req: AuthRequest, res) => {
    try {
      const data = insertPostSchema.omit({ authorId: true }).parse(req.body);
      const post = await storage.createPost({
        ...data,
        authorId: req.user!.id,
      });
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/posts/:id", authenticateToken, authorize("author", "editor", "admin"), async (req: AuthRequest, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.authorId !== req.user!.id && req.user!.role !== "admin" && req.user!.role !== "editor") {
        return res.status(403).json({ error: "Not authorized to edit this post" });
      }

      const updated = await storage.updatePost(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/posts/:id/status", authenticateToken, authorize("author", "editor", "admin"), async (req: AuthRequest, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.authorId !== req.user!.id && req.user!.role !== "admin" && req.user!.role !== "editor") {
        return res.status(403).json({ error: "Not authorized to edit this post" });
      }

      const updated = await storage.updatePost(req.params.id, { status: req.body.status });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, authorize("author", "editor", "admin"), async (req: AuthRequest, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }

      await storage.deletePost(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const hasLiked = await storage.hasUserLikedPost(req.params.id, req.user!.id);
      if (hasLiked) {
        await storage.deletePostLike(req.params.id, req.user!.id);
        res.json({ liked: false });
      } else {
        await storage.createPostLike(req.params.id, req.user!.id);
        res.json({ liked: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comments routes
  app.get("/api/comments/:postId", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.postId);
      const commentsWithAuthors = await Promise.all(
        comments.map(async (comment) => {
          const author = await storage.getUser(comment.authorId);
          return {
            ...comment,
            author: author ? { displayName: author.displayName, avatar: author.avatar } : null,
          };
        })
      );
      res.json(commentsWithAuthors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertCommentSchema.omit({ postId: true, authorId: true }).parse(req.body);
      const comment = await storage.createComment({
        ...data,
        postId: req.params.id,
        authorId: req.user!.id,
      });
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Teams routes
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams", authenticateToken, authorize("admin"), async (req: AuthRequest, res) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(data);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Players routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/players", authenticateToken, authorize("admin"), async (req: AuthRequest, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(data);
      res.status(201).json(player);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Live commentary routes
  app.get("/api/live-commentary", async (req, res) => {
    try {
      const commentary = await storage.getLiveCommentary();
      res.json(commentary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/live-commentary", authenticateToken, authorize("admin", "editor"), async (req: AuthRequest, res) => {
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

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", async (message) => {
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

  return httpServer;
}
