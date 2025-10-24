import {
  type User,
  type InsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Team,
  type InsertTeam,
  type Player,
  type InsertPlayer,
  type LiveCommentary,
  type InsertLiveCommentary,
  type PostLike,
  type CommentLike,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  getPost(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(filters?: { status?: string; authorId?: string; category?: string; isFeatured?: boolean; search?: string }): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  incrementPostViews(id: string): Promise<void>;

  getComments(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;

  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamBySlug(slug: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;

  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerBySlug(slug: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  getLiveCommentary(): Promise<LiveCommentary[]>;
  createLiveCommentary(commentary: InsertLiveCommentary): Promise<LiveCommentary>;

  createPostLike(postId: string, userId: string): Promise<PostLike>;
  deletePostLike(postId: string, userId: string): Promise<boolean>;
  hasUserLikedPost(postId: string, userId: string): Promise<boolean>;

  createCommentLike(commentId: string, userId: string): Promise<CommentLike>;
  deleteCommentLike(commentId: string, userId: string): Promise<boolean>;
  hasUserLikedComment(commentId: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private comments: Map<string, Comment>;
  private teams: Map<string, Team>;
  private players: Map<string, Player>;
  private liveCommentary: Map<string, LiveCommentary>;
  private postLikes: Map<string, PostLike>;
  private commentLikes: Map<string, CommentLike>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.liveCommentary = new Map();
    this.postLikes = new Map();
    this.commentLikes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      bio: null,
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find((post) => post.slug === slug);
  }

  async getPosts(filters?: { status?: string; authorId?: string; category?: string; isFeatured?: boolean; search?: string }): Promise<Post[]> {
    let posts = Array.from(this.posts.values());

    if (filters?.status) {
      posts = posts.filter((p) => p.status === filters.status);
    }
    if (filters?.authorId) {
      posts = posts.filter((p) => p.authorId === filters.authorId);
    }
    if (filters?.category) {
      posts = posts.filter((p) => p.category === filters.category);
    }
    if (filters?.isFeatured !== undefined) {
      posts = posts.filter((p) => p.isFeatured === filters.isFeatured);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.content.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const now = new Date();
    const post: Post = {
      ...insertPost,
      id,
      viewCount: 0,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: insertPost.status === "published" ? now : null,
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updated = {
      ...post,
      ...updates,
      updatedAt: new Date(),
      publishedAt: updates.status === "published" && !post.publishedAt ? new Date() : post.publishedAt,
    };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementPostViews(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.viewCount++;
      this.posts.set(id, post);
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      likeCount: 0,
      isModerated: false,
      status: "approved",
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamBySlug(slug: string): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find((team) => team.slug === slug);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = {
      ...insertTeam,
      id,
      logo: insertTeam.logo || null,
      bio: insertTeam.bio || null,
      foundedYear: insertTeam.foundedYear || null,
      createdAt: new Date(),
    };
    this.teams.set(id, team);
    return team;
  }

  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerBySlug(slug: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find((player) => player.slug === slug);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      position: insertPlayer.position || null,
      teamId: insertPlayer.teamId || null,
      photo: insertPlayer.photo || null,
      bio: insertPlayer.bio || null,
      stats: insertPlayer.stats || null,
      createdAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getLiveCommentary(): Promise<LiveCommentary[]> {
    return Array.from(this.liveCommentary.values())
      .filter((c) => c.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }

  async createLiveCommentary(insertCommentary: InsertLiveCommentary): Promise<LiveCommentary> {
    const id = randomUUID();
    const commentary: LiveCommentary = {
      ...insertCommentary,
      id,
      createdAt: new Date(),
    };
    this.liveCommentary.set(id, commentary);
    return commentary;
  }

  async createPostLike(postId: string, userId: string): Promise<PostLike> {
    const id = randomUUID();
    const like: PostLike = {
      id,
      postId,
      userId,
      createdAt: new Date(),
    };
    this.postLikes.set(id, like);

    const post = this.posts.get(postId);
    if (post) {
      post.likeCount++;
      this.posts.set(postId, post);
    }
    return like;
  }

  async deletePostLike(postId: string, userId: string): Promise<boolean> {
    const like = Array.from(this.postLikes.values()).find(
      (l) => l.postId === postId && l.userId === userId
    );
    if (like) {
      this.postLikes.delete(like.id);
      const post = this.posts.get(postId);
      if (post && post.likeCount > 0) {
        post.likeCount--;
        this.posts.set(postId, post);
      }
      return true;
    }
    return false;
  }

  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    return Array.from(this.postLikes.values()).some(
      (l) => l.postId === postId && l.userId === userId
    );
  }

  async createCommentLike(commentId: string, userId: string): Promise<CommentLike> {
    const id = randomUUID();
    const like: CommentLike = {
      id,
      commentId,
      userId,
      createdAt: new Date(),
    };
    this.commentLikes.set(id, like);

    const comment = this.comments.get(commentId);
    if (comment) {
      comment.likeCount++;
      this.comments.set(commentId, comment);
    }
    return like;
  }

  async deleteCommentLike(commentId: string, userId: string): Promise<boolean> {
    const like = Array.from(this.commentLikes.values()).find(
      (l) => l.commentId === commentId && l.userId === userId
    );
    if (like) {
      this.commentLikes.delete(like.id);
      const comment = this.comments.get(commentId);
      if (comment && comment.likeCount > 0) {
        comment.likeCount--;
        this.comments.set(commentId, comment);
      }
      return true;
    }
    return false;
  }

  async hasUserLikedComment(commentId: string, userId: string): Promise<boolean> {
    return Array.from(this.commentLikes.values()).some(
      (l) => l.commentId === commentId && l.userId === userId
    );
  }
}

export const storage = new MemStorage();
