import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken, authorize } from "../../middlewares/auth.middleware";
import { insertPostSchema } from "@shared/schema";

export async function registerPostRoutes(app: express.Application) {
  // Posts routes
  app.get("/api/posts", async (req: express.Request, res: express.Response) => {
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

  app.get("/api/posts/featured", async (req: express.Request, res: express.Response) => {
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

  app.get("/api/posts/trending", async (req: express.Request, res: express.Response) => {
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

  app.get("/api/posts/search", async (req: express.Request, res: express.Response) => {
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

  app.get("/api/posts/my-posts", authenticateToken, async (req: any, res: express.Response) => {
    try {
      const posts = await storage.getPosts({ authorId: req.user!.id });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/posts/stats", authenticateToken, async (req: any, res: express.Response) => {
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

  app.get("/api/posts/:slug", async (req: express.Request, res: express.Response) => {
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

  app.post("/api/posts", authenticateToken, authorize("author", "editor", "admin"), async (req: any, res: express.Response) => {
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

  app.patch("/api/posts/:id", authenticateToken, authorize("author", "editor", "admin"), async (req: any, res: express.Response) => {
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

  app.patch("/api/posts/:id/status", authenticateToken, authorize("author", "editor", "admin"), async (req: any, res: express.Response) => {
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

  app.delete("/api/posts/:id", authenticateToken, authorize("author", "editor", "admin"), async (req: any, res: express.Response) => {
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

  app.post("/api/posts/:id/like", authenticateToken, async (req: any, res: express.Response) => {
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
}