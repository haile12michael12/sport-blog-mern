import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import type { Post } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results, isLoading } = useQuery<(Post & { author?: { displayName: string; avatar?: string } })[]>({
    queryKey: ["/api/posts/search", searchQuery],
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen" data-testid="page-search">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">Search Posts</h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <Input
              type="text"
              placeholder="Search for posts, tags, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              data-testid="input-search"
            />
            <Button type="submit" className="gap-2" data-testid="button-search">
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {!searchQuery ? (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Enter a search term to find posts</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Found {results.length} result{results.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((post) => (
                <PostCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No results found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
