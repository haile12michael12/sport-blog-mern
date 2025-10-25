import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("reader"), // reader, author, editor, admin
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Blog posts with editorial workflow
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  featuredImage: text("featured_image"),
  authorId: varchar("author_id").notNull(),
  status: text("status").notNull().default("draft"), // draft, review, published
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  isFeatured: boolean("is_featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

// Nested comments system
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  authorId: varchar("author_id").notNull(),
  parentId: varchar("parent_id"), // null for top-level comments
  content: text("content").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  isModerated: boolean("is_moderated").notNull().default(false),
  status: text("status").notNull().default("approved"), // approved, flagged, deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Team profiles
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sport: text("sport").notNull(),
  logo: text("logo"),
  bio: text("bio"),
  foundedYear: integer("founded_year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player profiles
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sport: text("sport").notNull(),
  position: text("position"),
  teamId: varchar("team_id"),
  photo: text("photo"),
  bio: text("bio"),
  stats: text("stats"), // JSON string of stats
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Live commentary for real-time updates
export const liveCommentary = pgTable("live_commentary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  teamHome: text("team_home").notNull(),
  teamAway: text("team_away").notNull(),
  scoreHome: integer("score_home").notNull().default(0),
  scoreAway: integer("score_away").notNull().default(0),
  commentary: text("commentary").notNull(),
  matchTime: text("match_time"), // e.g., "45' + 2" or "Half Time"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Post likes tracking
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comment likes tracking
export const commentLikes = pgTable("comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewCount: true,
  likeCount: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  likeCount: true,
  isModerated: true,
  status: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertLiveCommentarySchema = createInsertSchema(liveCommentary).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type LiveCommentary = typeof liveCommentary.$inferSelect;
export type InsertLiveCommentary = z.infer<typeof insertLiveCommentarySchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
