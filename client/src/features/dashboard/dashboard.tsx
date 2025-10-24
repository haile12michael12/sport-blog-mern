import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useLocation } from "wouter";
import { Plus, Edit, Trash2, Eye, Heart, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/my-posts"],
  });

  const { data: stats } = useQuery<{
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  }>({
    queryKey: ["/api/posts/stats"],
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("DELETE", `/api/posts/${postId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/stats"] });
      toast({ title: "Post deleted successfully" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: string }) =>
      apiRequest("PATCH", `/api/posts/${postId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/my-posts"] });
      toast({ title: "Post status updated" });
    },
  });

  if (!user || (user.role !== "author" && user.role !== "editor" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be an author to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" data-testid="page-dashboard">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your posts and content</p>
          </div>
          <Button className="gap-2" onClick={() => setLocation("/dashboard/new-post")} data-testid="button-new-post">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-3xl" data-testid="stat-total-posts">
                {stats?.totalPosts || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Total Views
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="stat-total-views">
                {stats?.totalViews || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Total Likes
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="stat-total-likes">
                {stats?.totalLikes || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Comments
              </CardDescription>
              <CardTitle className="text-3xl" data-testid="stat-total-comments">
                {stats?.totalComments || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Posts</CardTitle>
            <CardDescription>Manage and edit your published content</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                        <TableCell className="font-medium max-w-md truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : post.status === "review"
                                ? "outline"
                                : "secondary"
                            }
                            data-testid={`badge-status-${post.status}`}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>{post.viewCount}</TableCell>
                        <TableCell>{post.likeCount}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => window.location.href = `/post/${post.slug}`} data-testid={`button-view-${post.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setLocation(`/dashboard/edit-post/${post.id}`)} data-testid={`button-edit-${post.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this post?")) {
                                  deleteMutation.mutate(post.id);
                                }
                              }}
                              data-testid={`button-delete-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't created any posts yet</p>
                <Button onClick={() => setLocation("/dashboard/new-post")} data-testid="button-create-first-post">Create your first post</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
