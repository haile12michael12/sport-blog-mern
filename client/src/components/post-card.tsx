import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { formatDate, formatReadTime, truncate } from "@/lib/utils";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post & { author?: { displayName: string; avatar?: string } };
  variant?: "standard" | "featured" | "list";
}

export function PostCard({ post, variant = "standard" }: PostCardProps) {
  if (variant === "list") {
    return (
      <Link href={`/post/${post.slug}`}>
        <div className="flex gap-4 hover-elevate active-elevate-2 p-3 rounded-lg" data-testid={`card-post-${post.id}`}>
          <img
            src={post.featuredImage || ""}
            alt={post.title}
            className="w-24 h-24 object-cover rounded-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base line-clamp-2 mb-1">{post.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(post.createdAt)}</span>
              <span>·</span>
              <span>{formatReadTime(post.content)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/post/${post.slug}`}>
        <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-post-${post.id}`}>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5 relative">
              <img
                src={post.featuredImage || ""}
                alt={post.title}
                className="w-full h-64 lg:h-full object-cover"
              />
              <Badge className="absolute top-4 left-4" data-testid={`badge-category-${post.category}`}>
                {post.category}
              </Badge>
            </div>
            <div className="lg:w-3/5 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 line-clamp-2">{post.title}</h2>
                <p className="text-muted-foreground text-lg mb-4 line-clamp-3">{post.excerpt}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar} alt={post.author?.displayName} />
                    <AvatarFallback>{post.author?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.author?.displayName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>·</span>
                      <span>{formatReadTime(post.content)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1" data-testid={`stat-views-${post.id}`}>
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid={`stat-likes-${post.id}`}>
                    <Heart className="h-4 w-4" />
                    <span>{post.likeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/post/${post.slug}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer h-full flex flex-col" data-testid={`card-post-${post.id}`}>
        <div className="relative">
          <img
            src={post.featuredImage || ""}
            alt={post.title}
            className="w-full aspect-video object-cover"
          />
          <Badge className="absolute top-3 left-3" data-testid={`badge-category-${post.category}`}>
            {post.category}
          </Badge>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{truncate(post.excerpt, 120)}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar} alt={post.author?.displayName} />
                <AvatarFallback>{post.author?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <p className="font-medium">{post.author?.displayName}</p>
                <p className="text-muted-foreground">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1" data-testid={`stat-views-${post.id}`}>
                <Eye className="h-3 w-3" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center gap-1" data-testid={`stat-likes-${post.id}`}>
                <Heart className="h-3 w-3" />
                <span>{post.likeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
