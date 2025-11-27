"use client";
import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { fetchQuestions } from "@/lib/api/questions";
import { Question, LikeAction } from "@/types/common";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  CircleCheck,
  CircleEllipsis,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";

interface QuestionsListProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Component to render the questions list
function QuestionsListContent({
  questions,
  onRefresh,
  loading,
  currentUserId,
}: {
  questions: Question[];
  onRefresh: () => void;
  loading?: boolean;
  currentUserId?: string;
}) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const handleLikeDislike = async (
    questionId: string,
    question: Question,
    buttonType: "like" | "dislike",
  ) => {
    if (!currentUserId) {
      toast.error("Please log in to like/dislike questions");
      return;
    }

    try {
      // Determine the action based on current state and button clicked
      let action: LikeAction;

      if (buttonType === "like") {
        // If user already liked, remove the like (undo)
        if (question.likes?.includes(currentUserId)) {
          action = "remove";
        } else {
          action = "like";
        }
      } else {
        // If user already disliked, remove the dislike (undo)
        if (question.dislikes?.includes(currentUserId)) {
          action = "remove";
        } else {
          action = "dislike";
        }
      }

      const response = await fetch(`/api/questions/${questionId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          action,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (action === "remove") {
            toast.success("Vote removed successfully");
          } else {
            toast.success(
              `${buttonType === "like" ? "Like" : "Dislike"} added successfully`,
            );
          }
          onRefresh(); // Refresh the questions list to show updated counts
        } else {
          toast.error(result.error?.message || "Failed to update like/dislike");
        }
      } else {
        toast.error("Failed to update like/dislike");
      }
    } catch (error) {
      console.error("Failed to update like/dislike:", error);
      toast.error("Failed to update like/dislike");
    }
  };

  if (loading) {
    // Show loading skeleton
    return (
      <div className="flex flex-col h-full space-y-4 overflow-hidden">
        <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-muted rounded-full" />
            <div className="h-4 w-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea variant="card" className="h-full">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="flex flex-col h-full space-y-4 overflow-hidden">
        <CardContent className="py-8 text-center my-auto">
          <div className="space-y-4">
            <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No questions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to ask a question!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      {/* Status indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0">
        <span>{questions.length} questions</span>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Questions list */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea variant="card" className="h-full">
          <div className="space-y-4">
            {questions.map((question: Question) => (
              <Card
                key={question.id}
                className="gap-4 hover:shadow-sm transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {question.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        {question.isVerified ? (
                          <>
                            <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <CircleEllipsis className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                              Unverified
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {question.name || "Anonymous"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeTime(question.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-4">
                    {question.question}
                  </p>

                  {/* Like/Dislike buttons */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleLikeDislike(question.id, question, "like")
                        }
                        className={`h-8 w-20 px-2 justify-center shrink-0 ${
                          question.likes?.includes(currentUserId || "")
                            ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 border border-blue-200 dark:border-blue-800"
                            : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        }`}
                        disabled={!currentUserId}
                        title={
                          question.likes?.includes(currentUserId || "")
                            ? "Remove like"
                            : "Like this question"
                        }
                      >
                        <div className="flex items-center justify-center gap-1">
                          <ThumbsUp className="h-4 w-4 shrink-0" />
                          <span className="font-mono text-sm min-w-[1.5ch] text-center tabular-nums">
                            {question.likes?.length || 0}
                          </span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleLikeDislike(question.id, question, "dislike")
                        }
                        className={`h-8 w-20 px-2 justify-center shrink-0 ${
                          question.dislikes?.includes(currentUserId || "")
                            ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/70 border border-red-200 dark:border-red-800"
                            : "text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        }`}
                        disabled={!currentUserId}
                        title={
                          question.dislikes?.includes(currentUserId || "")
                            ? "Remove dislike"
                            : "Dislike this question"
                        }
                      >
                        <div className="flex items-center justify-center gap-1">
                          <ThumbsDown className="h-4 w-4 shrink-0" />
                          <span className="font-mono text-sm min-w-[1.5ch] text-center tabular-nums">
                            {question.dislikes?.length || 0}
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Error fallback component
function QuestionsListError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="space-y-4">
          <p className="font-medium">Error loading questions</p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component with proper SSE integration
const QuestionsListInner = (
  {
    autoRefresh = true, // Enabled by default
    refreshInterval = 5000, // Kept for compatibility but not used
    currentUserId,
  }: QuestionsListProps & { currentUserId?: string },
  ref: React.ForwardedRef<{ handleRefresh: () => void }>,
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetchQuestions();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch questions");
      }
      setQuestions(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch questions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose the refresh function via ref
  useImperativeHandle(
    ref,
    () => ({
      handleRefresh: loadQuestions,
    }),
    [loadQuestions],
  );

  const handleRefresh = useCallback(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Initial load
  useEffect(() => {
    loadQuestions();
  }, []);

  if (error) {
    return <QuestionsListError onRetry={loadQuestions} />;
  }

  return (
    <QuestionsListContent
      questions={questions}
      onRefresh={handleRefresh}
      loading={loading}
      currentUserId={currentUserId}
    />
  );
};

// Forward ref wrapper
export const QuestionsList = forwardRef<
  { handleRefresh: () => void },
  QuestionsListProps & { currentUserId?: string }
>(QuestionsListInner);

QuestionsList.displayName = "QuestionsList";
