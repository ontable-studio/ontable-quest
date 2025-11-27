"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { fetchQuestionsPaginated } from "@/lib/api/questions";
import { Question } from "@/types/common";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  User,
  Search,
  Filter,
  ChevronUp,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  CircleCheck,
  CircleEllipsis,
} from "lucide-react";
import { toast } from "sonner";
import { useSSEProper } from "@/hooks/use-sse-proper";

interface InfiniteQuestionsListProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  currentUserId?: string;
}

interface FilterState {
  search: string;
  category: string;
  verificationStatus: string;
}

// Custom debounce function
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const CATEGORIES = [
  "Programming",
  "Design",
  "Marketing",
  "3D",
  "Unity",
  "Project Management",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Business",
  "Other",
];

const VERIFICATION_STATUS = [
  { value: "", label: "All Status" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

// Question Item Component
function QuestionItem({ question }: { question: Question }) {
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

  return (
    <Card className="gap-4 hover:shadow-sm transition-shadow">
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
        <p className="text-sm leading-relaxed">{question.question}</p>
      </CardContent>
    </Card>
  );
}

// Error fallback component
function InfiniteQuestionsListError({ onRetry }: { onRetry: () => void }) {
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

// Scroll to top button
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className="fixed bottom-8 right-8 z-40 rounded-full w-12 h-12 p-0 shadow-lg"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}

// Search and Filter component
function SearchAndFilters({
  filters,
  onFiltersChange,
  onClear,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFiltersChange({ ...filters, search: value });
      }, 300),
    [filters, onFiltersChange],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleVerificationStatusChange = (verificationStatus: string) => {
    onFiltersChange({ ...filters, verificationStatus });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.verificationStatus;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions or names..."
                defaultValue={filters.search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.category || filters.verificationStatus) && (
                <Badge variant="secondary" className="ml-1">
                  {(filters.category ? 1 : 0) +
                    (filters.verificationStatus ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={onClear} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category and Status filters */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            {/* Category filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={
                      filters.category === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Verification status filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Verification Status</h4>
              <div className="flex flex-wrap gap-2">
                {VERIFICATION_STATUS.map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      filters.verificationStatus === status.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleVerificationStatusChange(status.value)}
                    className="text-xs"
                  >
                    {status.value === "verified" && (
                      <CircleCheck className="h-3 w-3 mr-1" />
                    )}
                    {status.value === "unverified" && (
                      <CircleEllipsis className="h-3 w-3 mr-1" />
                    )}
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

// Main infinite scroll component with proper SSE
export function InfiniteQuestionsList({
  autoRefresh = true, // Enabled by default
  refreshInterval = 10000, // Kept for compatibility but not used
  currentUserId,
}: InfiniteQuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    verificationStatus: "",
  });
  const [totalCount, setTotalCount] = useState(0);

  const loadMoreRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, connect, disconnect } = useSSEProper({
    onNewQuestion: (newQuestion: Question) => {
      // Check if the new question matches current filters
      const matchesSearch =
        !filters.search ||
        newQuestion.question
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        newQuestion.name?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category ||
        (newQuestion.category &&
          newQuestion.category.toLowerCase() ===
            filters.category.toLowerCase());

      const matchesVerificationStatus =
        !filters.verificationStatus ||
        (filters.verificationStatus === "verified" && newQuestion.isVerified) ||
        (filters.verificationStatus === "unverified" &&
          !newQuestion.isVerified);

      if (matchesSearch && matchesCategory && matchesVerificationStatus) {
        setQuestions((prev) => [newQuestion, ...prev]);
        setTotalCount((prev) => prev + 1);

        toast.success("New question received!", {
          description: `${newQuestion.name || "Anonymous"} asked a question`,
          duration: 3000,
        });
      }
    },
    autoConnect: false, // We'll manually control connection
  });

  const loadQuestions = useCallback(
    async (
      pageNum: number,
      reset: boolean = false,
      currentFilters: FilterState = filters,
      showLoading: boolean = true,
    ) => {
      if (loading && showLoading) return;

      if (showLoading) {
        setLoading(true);
      }
      try {
        const response = await fetchQuestionsPaginated({
          page: pageNum,
          limit: 10,
          search: currentFilters.search,
          category: currentFilters.category,
          verificationStatus: currentFilters.verificationStatus,
        });

        if (!response.success || !response.data) {
          throw new Error(
            response.error?.message || "Failed to fetch questions",
          );
        }

        const { questions: newQuestions, pagination } = response.data;

        if (reset) {
          setQuestions(newQuestions);
          setPage(1);
        } else {
          setQuestions((prev) => [...prev, ...newQuestions]);
        }

        setHasMore(pagination.hasNextPage);
        setTotalCount(pagination.totalItems);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch questions";
        setError(errorMessage);
        if (showLoading) {
          toast.error(errorMessage);
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [loading, filters],
  );

  // Initial load
  useEffect(() => {
    loadQuestions(1, true, filters);
  }, []);

  // Manage SSE connection based on autoRefresh
  useEffect(() => {
    if (autoRefresh) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [autoRefresh, connect, disconnect]);

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        !loading &&
        hasMore &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
      ) {
        loadQuestions(page + 1, false, filters);
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page, loadQuestions, filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      loadQuestions(1, true, newFilters);
    },
    [loadQuestions],
  );

  // Clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters = { search: "", category: "", verificationStatus: "" };
    setFilters(clearedFilters);
    loadQuestions(1, true, clearedFilters);
  }, [loadQuestions]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    loadQuestions(1, true, filters, false); // Don't show loading for manual refresh
  }, [loadQuestions, filters]);

  if (error) {
    return (
      <InfiniteQuestionsListError
        onRetry={() => loadQuestions(1, true, filters)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ScrollToTopButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Questions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "question" : "questions"}
          </span>
          {autoRefresh && (
            <>
              {isConnected ? (
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
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="space-y-4">
                <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No questions found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))
        )}

        {/* Loading indicator */}
        {loading && hasMore && (
          <Card>
            <CardContent className="py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading more questions...
              </div>
            </CardContent>
          </Card>
        )}

        {/* End of results */}
        {!loading && !hasMore && questions.length > 0 && (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You've reached the end! That's all {totalCount} questions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
