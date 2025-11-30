"use client";

import { SimpleQuestionsLayout } from "./simple-questions-layout";
import { StandardQuestionsLayout } from "./standard-questions-layout";
import { SearchAndFilters } from "./search-and-filters";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useQuestions, QuestionsPresets } from "@/hooks/use-questions";

interface QuestionsListProps {
  // User context
  currentUserId?: string;

  // Display options
  variant: "infinite" | "simple" | "paginated";

  // Customization
  showSearch?: boolean;
  showHeader?: boolean;
  autoRefresh?: boolean;

  // Height constraints
  maxHeight?: string;
  fixedHeight?: string;

  // Custom question item config
  questionConfig?: {
    showLikeDislike?: boolean;
    showCategory?: boolean;
    showVerificationStatus?: boolean;
    showTimestamp?: boolean;
    showAuthor?: boolean;
  };
}

export function QuestionsList({
  currentUserId,
  variant,
  showSearch = true,
  showHeader = true,
  autoRefresh = true,
  maxHeight,
  fixedHeight,
  questionConfig,
}: QuestionsListProps) {
  // Get proper filters state using the hook
  const { filters, updateFilters, clearFilters } = useQuestions(QuestionsPresets.simpleList);

  const searchAndFilters = showSearch ? (
    <SearchAndFilters
      filters={filters}
      onFiltersChange={updateFilters}
      onClear={clearFilters}
    />
  ) : null;

  return (
    <ErrorBoundary
      title="Questions Error"
      description="An error occurred while loading questions. Please try refreshing the page."
    >
      {variant === "simple" && fixedHeight ? (
        <SimpleQuestionsLayout
          currentUserId={currentUserId}
          autoRefresh={autoRefresh}
          maxHeight={maxHeight}
          fixedHeight={fixedHeight}
          questionConfig={questionConfig}
          searchAndFilters={searchAndFilters}
        />
      ) : (
        <StandardQuestionsLayout
          currentUserId={currentUserId}
          autoRefresh={autoRefresh}
          showSearch={showSearch}
          showHeader={showHeader}
          variant={variant as "infinite" | "paginated"}
          searchAndFilters={searchAndFilters}
        />
      )}
    </ErrorBoundary>
  );
}

// Predefined wrappers for common use cases - keeping for backward compatibility
export function InfiniteScrollList(props: Omit<QuestionsListProps, "variant">) {
  return <QuestionsList variant="infinite" {...props} />;
}

export function SimpleScrollList(props: Omit<QuestionsListProps, "variant">) {
  return <QuestionsList variant="simple" fixedHeight="500px" {...props} />;
}

export function PaginatedList(props: Omit<QuestionsListProps, "variant">) {
  return <QuestionsList variant="paginated" {...props} />;
}
