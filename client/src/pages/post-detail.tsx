import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { formatDate, formatReadTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Post, Comment } from "@shared/schema";

export default function PostDetail() {
  const [, params] = useRoute("/post/:slug");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: post, isLoading: loadingPost } = useQuery<Post & { author: { displayName: string; avatar?: string } }>({
    queryKey: ["/api/posts", params?.slug],
    enabled: !!params?.slug,
  });

  const { data: comments, isLoading: loadingComments } = useQuery<(Comment & { author: { displayName: string; avatar?: string }; replies?: Comment[] })[]>({
    queryKey: ["/api/comments", post?.id],
    enabled: !!post?.id,
  });

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/posts/${post?.id}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", params?.slug] });
      toast({ title: "Post liked!" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      apiRequest("POST", `/api/posts/${post?.id}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", post?.id] });
      setCommentContent("");
      setReplyTo(null);
      toast({ title: "Comment posted!" });
    },
  });

  const handleComment = () => {
    if (!commentContent.trim()) return;
    commentMutation.mutate({
      content: commentContent,
      parentId: replyTo || undefined,
    });
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-96 w-full" />
        <div className="container mx-auto max-w-4xl px-6 py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const topLevelComments = comments?.filter((c) => !c.parentId) || [];

  return (
    <div className="min-h-screen" data-testid="page-post-detail">
      <div className="relative h-96 flex items-center justify-center overflow-hidden">
        <img
          src={post.featuredImage || ""}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 container mx-auto max-w-4xl px-6 text-center">
          <Badge className="mb-4" data-testid="badge-category">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight" data-testid="text-post-title">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium" data-testid="text-author">{post.author.displayName}</span>
            </div>
            <span>·</span>
            <span className="text-muted-foreground">{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span className="text-muted-foreground">{formatReadTime(post.content)}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => window.location.href = '/'} data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <div className="flex items-center justify-center gap-6 mb-8 py-4 border-y">
          <div className="flex items-center gap-2 text-muted-foreground" data-testid="stat-views">
            <Eye className="h-5 w-5" />
            <span>{post.viewCount} views</span>
          </div>
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => isAuthenticated && likeMutation.mutate()}
            disabled={!isAuthenticated || likeMutation.isPending}
            data-testid="button-like"
          >
            <Heart className="h-5 w-5" />
            <span>{post.likeCount}</span>
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{comments?.length || 0} comments</span>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12" data-testid="content-post">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-12 flex-wrap">
            <span className="text-sm font-medium">Tags:</span>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <section className="border-t pt-12" data-testid="section-comments">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments?.length || 0})</h2>

          {isAuthenticated ? (
            <div className="mb-8 p-4 border rounded-lg">
              <Textarea
                placeholder={replyTo ? "Write a reply..." : "Share your thoughts..."}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="mb-3"
                data-testid="input-comment"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleComment}
                  disabled={!commentContent.trim() || commentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  {commentMutation.isPending ? "Posting..." : replyTo ? "Post Reply" : "Post Comment"}
                </Button>
                {replyTo && (
                  <Button variant="ghost" onClick={() => setReplyTo(null)} data-testid="button-cancel-reply">
                    Cancel Reply
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 border rounded-lg text-center bg-muted/30">
              <p className="text-muted-foreground mb-4">Please log in to comment</p>
              <Button onClick={() => window.location.href = '/login'} data-testid="button-login-to-comment">Login</Button>
            </div>
          )}

          {loadingComments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topLevelComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={() => setReplyTo(comment.id)}
                  replies={comments?.filter((c) => c.parentId === comment.id) || []}
                />
              ))}
              {topLevelComments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  replies,
}: {
  comment: Comment & { author: { displayName: string; avatar?: string } };
  onReply: () => void;
  replies: Comment[];
}) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="border-l-2 pl-4 py-3" data-testid={`comment-${comment.id}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.displayName} />
          <AvatarFallback>{comment.author.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.displayName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={onReply}
              disabled={!isAuthenticated}
              data-testid={`button-reply-${comment.id}`}
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </Button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              <span>{comment.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-6 mt-3 space-y-3">
          {replies.map((reply: any) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} replies={[]} />
          ))}
        </div>
      )}
    </div>
  );
}
