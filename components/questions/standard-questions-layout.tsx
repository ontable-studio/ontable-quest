"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, Search } from "lucide-react";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { LoadingState } from "@/components/ui/loading-state";
import { useQuestions, QuestionsPresets } from "@/hooks/use-questions";
import { QuestionItem, QuestionItemPresets } from "./question-item";
import { QuestionsListError } from "./questions-list-error";

interface StandardQuestionsLayoutProps {
  currentUserId?: string;
  autoRefresh?: boolean;
  showSearch?: boolean;
  showHeader?: boolean;
  variant: "infinite" | "paginated";
  searchAndFilters?: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function StandardQuestionsLayout({
  currentUserId,
  autoRefresh = true,
  showSearch = true,
  showHeader = true,
  variant,
  searchAndFilters,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: StandardQuestionsLayoutProps) {
  const {
    questions,
    loading,
    error,
    refresh,
    totalCount,
    sseConnected,
    handleLikeDislike,
  } = useQuestions(
    QuestionsPresets[variant === "infinite" ? "infiniteList" : "paginatedList"],
  );

  const itemConfig = useMemo(
    () => ({
      ...QuestionItemPresets.detailed,
    }),
    [],
  );

  if (error) {
    return <QuestionsListError onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Questions</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "question" : "questions"}
            </span>

            {autoRefresh && (
              <>
                {sseConnected ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      Live
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <WifiOff className="h-3 w-3" />
                      Connecting
                    </span>
                  </>
                )}
              </>
            )}

            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {showSearch && searchAndFilters}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 && !loading ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No questions found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search or filters
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {questions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                config={itemConfig}
                currentUserId={currentUserId}
                onLikeDislike={(questionId, questionItem, buttonType) =>
                  handleLikeDislike(
                    questionId,
                    questionItem,
                    buttonType,
                    currentUserId,
                  )
                }
              />
            ))}
          </>
        )}

        {/* Loading indicator */}
        {loading && !isLoadingMore && <LoadingState />}

        {/* Loading more indicator (for infinite scroll) */}
        {isLoadingMore && <LoadingState message="Loading more questions..." />}

        {/* End of results */}
        {!loading && !hasMore && questions.length > 0 && (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end! That&apos;s all {totalCount}{" "}
                questions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Load More button (for paginated mode) */}
        {variant === "paginated" && hasMore && !loading && onLoadMore && (
          <div className="text-center">
            <Button onClick={onLoadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Scroll to top (for infinite scroll) */}
      {variant === "infinite" && <ScrollToTopButton />}
    </div>
  );
}
