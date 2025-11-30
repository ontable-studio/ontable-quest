"use client";

import { memo, useMemo, useCallback } from "react";
import { Question } from "@/types/common";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  CircleCheck,
  CircleEllipsis,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";

export interface QuestionItemConfig {
  showActions?: boolean;
  showVerificationStatus?: boolean;
  showUserInfo?: boolean;
  showTimestamp?: boolean;
  showCategory?: boolean;
  compactMode?: boolean;
  actionSize?: "sm" | "default" | "lg";
  layout?: "default" | "compact" | "detailed";
}

export interface QuestionItemProps {
  question: Question;
  config?: QuestionItemConfig;
  currentUserId?: string;
  onLikeDislike?: (
    questionId: string,
    question: Question,
    buttonType: "like" | "dislike",
  ) => void;
  className?: string;
}

// Default configuration
const defaultConfig: QuestionItemConfig = {
  showActions: false,
  showVerificationStatus: true,
  showUserInfo: true,
  showTimestamp: true,
  showCategory: true,
  compactMode: false,
  actionSize: "sm",
  layout: "default",
};

// Predefined configurations for common use cases
export const QuestionItemPresets = {
  // For infinite scroll list (with actions)
  infiniteList: {
    ...defaultConfig,
    showActions: true,
    layout: "default" as const,
  },

  // For sidebar/compact view
  compact: {
    ...defaultConfig,
    compactMode: true,
    showActions: false,
    showTimestamp: false,
    layout: "compact" as const,
  },

  // For detailed view
  detailed: {
    ...defaultConfig,
    showActions: true,
    layout: "detailed" as const,
    actionSize: "default" as const,
  },

  // For minimal display
  minimal: {
    ...defaultConfig,
    showActions: false,
    showVerificationStatus: false,
    showUserInfo: false,
    showTimestamp: false,
    layout: "compact" as const,
  },
} as const;

const QuestionItem = memo(function QuestionItem({
  question,
  config = defaultConfig,
  currentUserId,
  onLikeDislike,
  className = "",
}: QuestionItemProps) {
  const finalConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );

  const handleLikeDislike = useCallback(
    (buttonType: "like" | "dislike") => {
      if (onLikeDislike) {
        onLikeDislike(question.id, question, buttonType);
      }
    },
    [onLikeDislike, question],
  );

  const isLiked = useMemo(
    () => question.likes?.includes(currentUserId || ""),
    [question.likes, currentUserId],
  );
  const isDisliked = useMemo(
    () => question.dislikes?.includes(currentUserId || ""),
    [question.dislikes, currentUserId],
  );

  return (
    <Card className={`gap-4 hover:shadow-sm transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            {finalConfig.showCategory && question.category && (
              <Badge variant="secondary" className="text-xs">
                {question.category}
              </Badge>
            )}

            {finalConfig.showVerificationStatus && (
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
            )}

            {finalConfig.showUserInfo && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {question.name || "Anonymous"}
              </span>
            )}
          </div>

          {finalConfig.showTimestamp && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(question.createdAt)}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p
          className={`text-sm leading-relaxed ${finalConfig.showActions ? "mb-4" : ""}`}
        >
          {question.question}
        </p>

        {/* Like/Dislike buttons */}
        {finalConfig.showActions && onLikeDislike && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size={finalConfig.actionSize}
                onClick={() => handleLikeDislike("like")}
                className={`${
                  finalConfig.actionSize === "sm"
                    ? "h-8 w-20 px-2"
                    : finalConfig.actionSize === "default"
                      ? "h-9 w-24 px-3"
                      : "h-10 w-28 px-4"
                } justify-center shrink-0 ${
                  isLiked
                    ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 border border-blue-200 dark:border-blue-800"
                    : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
                disabled={!currentUserId}
                title={isLiked ? "Remove like" : "Like this question"}
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
                size={finalConfig.actionSize}
                onClick={() => handleLikeDislike("dislike")}
                className={`${
                  finalConfig.actionSize === "sm"
                    ? "h-8 w-20 px-2"
                    : finalConfig.actionSize === "default"
                      ? "h-9 w-24 px-3"
                      : "h-10 w-28 px-4"
                } justify-center shrink-0 ${
                  isDisliked
                    ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/70 border border-red-200 dark:border-red-800"
                    : "text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                }`}
                disabled={!currentUserId}
                title={isDisliked ? "Remove dislike" : "Dislike this question"}
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
        )}
      </CardContent>
    </Card>
  );
});

export { QuestionItem };
