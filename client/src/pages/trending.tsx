import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import type { Post } from "@shared/schema";

export default function Trending() {
  const { data: posts, isLoading } = useQuery<(Post & { author?: { displayName: string; avatar?: string } })[]>({
    queryKey: ["/api/posts/trending"],
  });

  return (
    <div className="min-h-screen" data-testid="page-trending">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Trending Posts</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Most popular sports stories right now
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No trending posts at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
