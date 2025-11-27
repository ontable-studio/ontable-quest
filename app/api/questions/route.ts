import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Question } from "@/types/common";
import { getActiveQuestions } from "@/app/actions/submit-question";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const verificationStatus = searchParams.get('verificationStatus') || '';

    const allQuestions = await getActiveQuestions();

    // Filter questions
    let filteredQuestions = allQuestions;

    if (search) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (verificationStatus) {
      filteredQuestions = filteredQuestions.filter(q => {
        if (verificationStatus === 'verified') {
          return q.isVerified === true;
        } else if (verificationStatus === 'unverified') {
          return q.isVerified === false || q.isVerified === undefined;
        }
        return true;
      });
    }

    // Sort by created date (newest first)
    filteredQuestions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    const response: ApiResponse<{
      questions: Question[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }> = {
      data: {
        questions: paginatedQuestions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredQuestions.length / limit),
          totalItems: filteredQuestions.length,
          hasNextPage: endIndex < filteredQuestions.length,
          hasPrevPage: page > 1,
        },
      },
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error fetching questions:", error);
    const response: ApiResponse<Question[]> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to fetch questions",
        status: 500,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}