# Advanced Sports Blog

## Overview

This is a full-stack sports blogging platform built with React, Express, and PostgreSQL. The application provides a modern, SEO-optimized platform for sports journalism with multi-author support, editorial workflows, commenting systems, and real-time live commentary features. It follows a premium sports media design approach inspired by The Athletic, Medium, ESPN, and Bleacher Report.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type safety and modern component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form handling

**UI System:**
- Shadcn/ui components with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme system supporting light/dark modes via React context
- Typography system using Inter (headlines/body) and JetBrains Mono (stats/numbers) from Google Fonts
- Design guidelines emphasizing content-first, editorial excellence, and dynamic energy

**State Management:**
- Auth context for user authentication state (JWT-based)
- Theme context for dark/light mode preferences
- Local storage for persisting user session and preferences
- Query client with custom configuration for API request handling

**Key Features:**
- Responsive design with mobile-first approach
- Real-time WebSocket integration for live commentary
- Image optimization and lazy loading
- SEO meta tags and Open Graph support

### Backend Architecture

**Framework & Server:**
- Express.js as the web framework
- HTTP server with WebSocket support (ws library) for real-time features
- Middleware for JSON parsing, URL encoding, and request logging
- Custom error handling and response formatting

**Authentication & Authorization:**
- JWT-based authentication with access tokens (15min expiry) and refresh tokens (7 day expiry)
- Bcrypt for password hashing
- Role-based access control (reader, author, editor, admin)
- Token verification middleware for protected routes
- Rate limiting on authentication endpoints (5 requests per 15 minutes)

**API Design:**
- RESTful API structure under `/api` prefix
- Rate limiting on all API routes (100 requests per 15 minutes)
- File upload support via Multer (in-memory storage)
- CRUD operations for posts, comments, teams, players, and live commentary
- Search functionality with text-based querying
- Trending algorithm based on views, likes, and recency

**Data Layer:**
- Drizzle ORM for type-safe database queries and schema management
- PostgreSQL as the primary database (using Neon serverless driver)
- Database schema includes users, posts, comments, teams, players, live commentary, and like tracking
- Seeding functionality for development/testing data
- Migration support via Drizzle Kit

**Real-time Features:**
- WebSocket server for live commentary updates
- Pub/sub pattern for broadcasting live events
- Client subscription system for selective updates
- Automatic reconnection handling on the client

**Storage Abstraction:**
- Custom storage interface for database operations
- Separation of concerns between routes and data access
- Support for filtering, searching, and pagination
- Increment operations for view counts

### Database Schema

**Core Tables:**
- `users`: User accounts with role-based permissions, profiles (bio, avatar)
- `posts`: Blog posts with editorial workflow (draft/review/published), SEO fields, categories, tags
- `comments`: Nested commenting system with moderation status and parent-child relationships
- `teams`: Sports team profiles with logos and basic information
- `players`: Player profiles with photos, positions, and stats
- `live_commentary`: Real-time match commentary entries
- `post_likes` and `comment_likes`: User engagement tracking

**Key Design Decisions:**
- UUID primary keys for distributed system compatibility
- Array fields for tags using PostgreSQL array type
- Timestamp fields for tracking creation, updates, and publication
- Status fields for workflow management (posts: draft/review/published, comments: approved/flagged/deleted)
- Counters for performance (viewCount, likeCount) to avoid COUNT queries

### External Dependencies

**Database:**
- Neon Serverless PostgreSQL (@neondatabase/serverless)
- Drizzle ORM for schema definition and migrations
- Connection via DATABASE_URL environment variable

**Authentication:**
- JWT (jsonwebtoken) for token generation and verification
- Bcrypt for password hashing
- Secrets managed via JWT_SECRET and REFRESH_SECRET environment variables

**UI Component Library:**
- Radix UI primitives for accessible components
- Shadcn/ui component system (New York style variant)
- Class Variance Authority for component variants
- Tailwind Merge and CLSX for class name management

**Development Tools:**
- TypeScript for type safety across the stack
- ESBuild for server bundling in production
- TSX for development server execution
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime-error-modal)

**Design Assets:**
- Google Fonts API for Inter and JetBrains Mono
- Generated images stored in attached_assets directory
- Custom favicon support

**Production Deployment:**
- Environment-based configuration (NODE_ENV)
- Static file serving for built frontend
- Single-server deployment (frontend + backend + WebSocket)
- Session management with connect-pg-simple for PostgreSQL-backed sessions