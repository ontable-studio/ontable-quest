"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { fetchQuestions, fetchQuestionsPaginated } from "@/lib/api/questions";
import { Question, LikeAction } from "@/types/common";
import { toast } from "sonner";
import { useSSEProper } from "./use-sse-proper";

export interface QuestionsConfig {
  // Data fetching strategy
  mode: "simple" | "paginated" | "infinite";

  // Pagination settings (for paginated/infinite modes)
  pageSize?: number;

  // Initial filters
  initialFilters?: {
    search?: string;
    category?: string;
    verificationStatus?: string;
  };

  // Real-time updates
  enableSSE?: boolean;

  // Auto-loading behavior
  autoLoad?: boolean;

  // Performance optimization
  debounceMs?: number;
}

export interface QuestionsState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  filters: {
    search: string;
    category: string;
    verificationStatus: string;
  };
}

// Default configurations for common use cases
export const QuestionsPresets = {
  // Infinite scroll with real-time updates
  infiniteList: {
    mode: "infinite" as const,
    pageSize: 10,
    enableSSE: true,
    autoLoad: true,
    debounceMs: 300,
  },

  // Simple list with real-time updates
  simpleList: {
    mode: "simple" as const,
    enableSSE: true,
    autoLoad: true,
    debounceMs: 0,
  },

  // Paginated list with filtering
  paginatedList: {
    mode: "paginated" as const,
    pageSize: 20,
    enableSSE: false,
    autoLoad: true,
    debounceMs: 300,
  },

  // Static list (no real-time)
  staticList: {
    mode: "simple" as const,
    enableSSE: false,
    autoLoad: true,
    debounceMs: 0,
  },
} as const;

const defaultConfig: QuestionsConfig = {
  mode: "simple",
  pageSize: 10,
  initialFilters: {
    search: "",
    category: "",
    verificationStatus: "",
  },
  enableSSE: false,
  autoLoad: true,
  debounceMs: 300,
};

export function useQuestions(customConfig: Partial<QuestionsConfig> = {}) {
  const config = { ...defaultConfig, ...customConfig };

  // State
  const [state, setState] = useState<QuestionsState>({
    questions: [],
    loading: false,
    error: null,
    hasMore: true,
    totalCount: 0,
    filters: {
      search: config.initialFilters?.search || "",
      category: config.initialFilters?.category || "",
      verificationStatus: config.initialFilters?.verificationStatus || "",
    },
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Refs
  const debouncedFiltersRef = useRef(state.filters);

  // Debounce function
  const debounce = useMemo(
    () => (func: () => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
      };
    },
    []
  );

  // Fetch data based on mode
  const fetchQuestionsData = useCallback(async (
    page: number = 1,
    reset: boolean = false,
    filters = state.filters
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response;

      if (config.mode === "simple") {
        response = await fetchQuestions();
      } else {
        // paginated or infinite mode
        response = await fetchQuestionsPaginated({
          page,
          limit: config.pageSize,
          ...filters,
        });
      }

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch questions");
      }

      if (config.mode === "simple") {
        // For simple mode, response.data is directly the questions array
        const questionsArray = response.data as Question[];
        setState(prev => ({
          ...prev,
          questions: questionsArray,
          loading: false,
          totalCount: questionsArray?.length || 0,
        }));
      } else {
        // For paginated mode, response.data has questions and pagination
        const paginatedData = response.data as {
          questions: Question[];
          pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
        };
        const { questions: newQuestions, pagination } = paginatedData;

        setState(prev => ({
          ...prev,
          questions: reset ? newQuestions : [...prev.questions, ...newQuestions],
          hasMore: pagination.hasNextPage,
          totalCount: pagination.totalItems,
          loading: false,
        }));
      }

      if (reset) {
        setCurrentPage(1);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch questions";
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [config.mode, config.pageSize, state.filters]);

  // Load more (for infinite scroll)
  const loadMore = useCallback(() => {
    if (config.mode === "infinite" && !state.loading && state.hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchQuestionsData(nextPage, false);
    }
  }, [config.mode, state.loading, state.hasMore, currentPage, fetchQuestionsData]);

  // Load page (for paginated mode)
  const loadPage = useCallback((page: number) => {
    if (config.mode === "paginated") {
      setCurrentPage(page);
      fetchQuestionsData(page, true);
    }
  }, [config.mode, fetchQuestionsData]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchQuestionsData(1, true);
  }, [fetchQuestionsData]);

  // Handle filter changes
  const updateFilters = useCallback((newFilters: Partial<QuestionsState["filters"]>) => {
    const updatedFilters = { ...state.filters, ...newFilters };

    setState(prev => ({ ...prev, filters: updatedFilters }));

    // Debounced fetch
    const debouncedFetch = debounce(() => {
      fetchQuestionsData(1, true, updatedFilters);
    }, config.debounceMs || 0);

    debouncedFetch();
  }, [state.filters, fetchQuestionsData, config.debounceMs, debounce]);

  // Clear filters
  const clearFilters = useCallback(() => {
    updateFilters({
      search: "",
      category: "",
      verificationStatus: "",
    });
  }, [updateFilters]);

  // Handle like/dislike
  const handleLikeDislike = useCallback(
    async (
      questionId: string,
      question: Question,
      buttonType: "like" | "dislike",
      currentUserId?: string,
    ) => {
      if (!currentUserId) {
        toast.error("Please log in to like/dislike questions");
        return;
      }

      try {
        // Determine the action
        let action: LikeAction;

        if (buttonType === "like") {
          action = question.likes?.includes(currentUserId) ? "remove" : "like";
        } else {
          action = question.dislikes?.includes(currentUserId) ? "remove" : "dislike";
        }

        const response = await fetch(`/api/questions/${questionId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, action }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            toast.success(
              action === "remove"
                ? "Vote removed successfully"
                : `${buttonType === "like" ? "Like" : "Dislike"} added successfully`
            );
            // Refresh current data
            refresh();
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
    },
    [refresh]
  );

  // Create a stable callback for SSE to prevent infinite re-connections
  const onNewQuestionCallback = useCallback((newQuestion: Question) => {
    if (!config.enableSSE) return;

    // Check if new question matches current filters
    const matchesSearch = !state.filters.search ||
      newQuestion.question.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      newQuestion.name?.toLowerCase().includes(state.filters.search.toLowerCase());

    const matchesCategory = !state.filters.category ||
      (newQuestion.category && newQuestion.category.toLowerCase() === state.filters.category.toLowerCase());

    const matchesVerificationStatus = !state.filters.verificationStatus ||
      (state.filters.verificationStatus === "verified" && newQuestion.isVerified) ||
      (state.filters.verificationStatus === "unverified" && !newQuestion.isVerified);

    if (matchesSearch && matchesCategory && matchesVerificationStatus) {
      setState(prev => ({
        ...prev,
        questions: [newQuestion, ...prev.questions],
        totalCount: prev.totalCount + 1,
      }));

      toast.success("New question received!", {
        description: `${newQuestion.name || "Anonymous"} asked a question`,
        duration: 3000,
      });
    }
  }, [config.enableSSE, state.filters]);

  // SSE Integration - now uses stable callback
  const { isConnected, connect, disconnect } = useSSEProper({
    onNewQuestion: onNewQuestionCallback,
    autoConnect: false,
  });

  // Initial load
  useEffect(() => {
    if (config.autoLoad && !hasLoaded) {
      fetchQuestionsData(1, true);
      setHasLoaded(true);
    }
  }, [config.autoLoad, hasLoaded, fetchQuestionsData]);

  // SSE connection management - only depends on enableSSE, not on functions
  useEffect(() => {
    if (config.enableSSE) {
      connect();
    } else {
      disconnect();
    }

    return () => disconnect();
  }, [config.enableSSE]); // Removed connect and disconnect from dependencies

  // Infinite scroll handler
  const setupInfiniteScroll = useCallback(() => {
    if (config.mode !== "infinite") return;

    const handleScroll = () => {
      if (
        !state.loading &&
        state.hasMore &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [config.mode, state.loading, state.hasMore, loadMore]);

  useEffect(() => {
    return setupInfiniteScroll();
  }, [setupInfiniteScroll]);

  return {
    // State
    ...state,
    currentPage,

    // Actions
    refresh,
    loadMore,
    loadPage,
    updateFilters,
    clearFilters,
    handleLikeDislike,

    // SSE
    sseConnected: isConnected,

    // Utilities
    config,
    isLoadingMore: state.loading && currentPage > 1,
  };
}