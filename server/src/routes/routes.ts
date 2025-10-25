import express, { type Express } from "express";

/**
 * Register all application routes
 * This function imports and registers routes for all modules
 */
export async function registerRoutes(app: Express) {
  // Import and register user routes
  const { registerUserRoutes } = await import('../modules/user/user.routes');
  await registerUserRoutes(app);

  // Import and register post routes
  const { registerPostRoutes } = await import('../modules/post/post.routes');
  await registerPostRoutes(app);

  // Import and register comment routes
  const { registerCommentRoutes } = await import('../modules/comment/comment.routes');
  await registerCommentRoutes(app);

  // Import and register team routes
  const { registerTeamRoutes } = await import('../modules/team/team.routes');
  await registerTeamRoutes(app);

  // Import and register player routes
  const { registerPlayerRoutes } = await import('../modules/player/player.routes');
  await registerPlayerRoutes(app);

  // Import and register commentary routes
  const { registerCommentaryRoutes } = await import('../modules/commentary/commentary.routes');
  // Note: WebSocket setup is handled in the main app
}