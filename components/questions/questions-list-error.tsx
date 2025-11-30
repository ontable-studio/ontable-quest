"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";

interface QuestionsListErrorProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

export function QuestionsListError({
  onRetry,
  title = "Error loading questions",
  description = "Failed to fetch questions. Please try again."
}: QuestionsListErrorProps) {
  return (
    <Empty className="border border-red-200 bg-red-50/50">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </EmptyMedia>
        <EmptyTitle className="text-red-800">{title}</EmptyTitle>
        <EmptyDescription className="text-red-700">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-200 text-red-800 hover:bg-red-100"
        >
          Try Again
        </Button>
      </EmptyContent>
    </Empty>
  );
}