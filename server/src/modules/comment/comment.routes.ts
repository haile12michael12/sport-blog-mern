import express from "express";
import { storage } from "../../database/storage";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { insertCommentSchema } from "@shared/schema";

export async function registerCommentRoutes(app: express.Application) {
  // Comments routes
  app.get("/api/comments/:postId", async (req: express.Request, res: express.Response) => {
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

  app.post("/api/posts/:id/comments", authenticateToken, async (req: any, res: express.Response) => {
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
}