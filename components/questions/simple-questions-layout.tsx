"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { StatusBar } from "@/components/ui/status-bar";
import { User } from "lucide-react";
import { useQuestions, QuestionsPresets } from "@/hooks/use-questions";
import { QuestionItem, QuestionItemPresets } from "./question-item";
import { QuestionsListError } from "./questions-list-error";

interface SimpleQuestionsLayoutProps {
  currentUserId?: string;
  autoRefresh?: boolean;
  maxHeight?: string;
  fixedHeight?: string;
  questionConfig?: {
    showLikeDislike?: boolean;
    showCategory?: boolean;
    showVerificationStatus?: boolean;
    showTimestamp?: boolean;
    showAuthor?: boolean;
  };
  searchAndFilters?: React.ReactNode;
}

export function SimpleQuestionsLayout({
  currentUserId,
  maxHeight,
  fixedHeight,
  questionConfig,
  searchAndFilters,
}: SimpleQuestionsLayoutProps) {
  const { questions, loading, error, refresh, handleLikeDislike } =
    useQuestions(QuestionsPresets.simpleList);

  const itemConfig = useMemo(
    () => ({
      ...QuestionItemPresets.compact,
      ...questionConfig,
    }),
    [questionConfig],
  );

  if (error) {
    return <QuestionsListError onRetry={refresh} />;
  }

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      {/* Search and Filters */}
      {searchAndFilters}

      {/* Questions container */}
      <div
        className="flex-1 min-h-0 overflow-hidden"
        style={{
          maxHeight: maxHeight || "none",
          height: fixedHeight || "auto",
        }}
      >
        {questions.length === 0 && !loading ? (
          <Empty className="h-full flex items-center justify-center border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <User className="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No questions yet</EmptyTitle>
              <EmptyDescription>
                Be the first to ask a question!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col h-full space-y-4 overflow-hidden">
            {/* Status indicator */}
            <StatusBar
              count={questions.length}
              countLabel="question"
              onRefresh={refresh}
              isLoading={loading}
            />

            {/* Questions list */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea variant="card" className="h-full">
                <div className="space-y-4">
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
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
