import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { LiveCommentaryWidget } from "@/components/live-commentary-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Post } from "@shared/schema";
import heroImage from "@assets/generated_images/Stadium_hero_background_image_3a311780.png";

export default function Home() {
  const { data: featuredPosts, isLoading: loadingFeatured } = useQuery<(Post & { author?: { displayName: string; avatar?: string } })[]>({
    queryKey: ["/api/posts/featured"],
  });

  const { data: trendingPosts, isLoading: loadingTrending } = useQuery<(Post & { author?: { displayName: string; avatar?: string } })[]>({
    queryKey: ["/api/posts/trending"],
  });

  const { data: latestPosts, isLoading: loadingLatest } = useQuery<(Post & { author?: { displayName: string; avatar?: string } })[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden" data-testid="section-hero">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <Badge className="mb-6" variant="outline" data-testid="badge-hero-live">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live Coverage
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Your Premier Sports<br />News Destination
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get in-depth analysis, breaking news, and live commentary from the world's best sports journalists
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="gap-2" onClick={() => window.location.href = '/trending'} data-testid="button-view-trending">
              <TrendingUp className="h-5 w-5" />
              View Trending
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm bg-background/30" onClick={() => window.location.href = '/register'} data-testid="button-join">
              Join Community
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section data-testid="section-featured">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Featured Stories</h2>
              </div>
              {loadingFeatured ? (
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : featuredPosts && featuredPosts.length > 0 ? (
                <div className="space-y-6">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <PostCard key={post.id} post={post} variant="featured" />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">No featured posts yet</p>
              )}
            </section>

            <section data-testid="section-trending">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-7 w-7 text-primary" />
                  Trending Now
                </h2>
                <Button variant="ghost" className="gap-2" onClick={() => window.location.href = '/trending'} data-testid="link-view-all-trending">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {loadingTrending ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="min-w-[300px] h-80" />
                  ))}
                </div>
              ) : trendingPosts && trendingPosts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {trendingPosts.slice(0, 6).map((post) => (
                    <div key={post.id} className="min-w-[300px]">
                      <PostCard post={post} variant="standard" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">No trending posts yet</p>
              )}
            </section>

            <section data-testid="section-latest">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Latest Posts</h2>
              </div>
              {loadingLatest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-96" />
                  ))}
                </div>
              ) : latestPosts && latestPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestPosts.map((post) => (
                    <PostCard key={post.id} post={post} variant="standard" />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">No posts available yet</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <LiveCommentaryWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
