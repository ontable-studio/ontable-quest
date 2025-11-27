import { ApiResponse, Question } from "@/types/common";

export async function fetchQuestions(): Promise<ApiResponse<Question[]>> {
  const res = await fetch("/api/questions?page=1&limit=50", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const response = await res.json();

  // Handle both old and new API formats
  if (response.data?.questions) {
    // New format: { data: { questions: [...], pagination: {...} } }
    return {
      data: response.data.questions,
      success: response.success,
      error: response.error,
    };
  }

  // Old format: { data: [...] }
  return response;
}

export async function fetchQuestionsPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  verificationStatus?: string;
}): Promise<ApiResponse<{
  questions: Question[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.category) searchParams.append('category', params.category);
  if (params.verificationStatus) searchParams.append('verificationStatus', params.verificationStatus);

  const res = await fetch(`/api/questions?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}