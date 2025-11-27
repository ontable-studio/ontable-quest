import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { toggleLike } from "@/app/actions/submit-question";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action || !['like', 'dislike', 'remove'].includes(action)) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Missing required fields: userId and action (like/dislike/remove)",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const result = await toggleLike(questionId, userId, action);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: "Like/dislike updated successfully" },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to update like/dislike",
          status: 500,
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to update like/dislike",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}