import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { deleteQuestion, verifyQuestion, unverifyQuestion } from "@/app/actions/submit-question";
import { requireAdmin, createAdminForbiddenResponse } from "@/lib/auth/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    // Check admin authentication
    const adminAuth = await requireAdmin(request);
    if (!adminAuth) {
      return createAdminForbiddenResponse();
    }

    const result = await deleteQuestion(questionId, adminAuth.user.id);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: "Question deleted successfully" },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to delete question",
          status: 500,
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to delete question",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const body = await request.json();

    // Check admin authentication
    const adminAuth = await requireAdmin(request);
    if (!adminAuth) {
      return createAdminForbiddenResponse();
    }

    let result;
    let actionMessage;

    // Handle different payload formats
    if (body.action === 'verify' || (typeof body.isVerified === 'boolean' && body.isVerified === true)) {
      result = await verifyQuestion(questionId);
      actionMessage = "Question verified successfully";
    } else if (body.action === 'unverify' || (typeof body.isVerified === 'boolean' && body.isVerified === false)) {
      result = await unverifyQuestion(questionId);
      actionMessage = "Question unverified successfully";
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Invalid action. Use { action: 'verify' }, { action: 'unverify' }, or { isVerified: true/false }",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: actionMessage },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to update question",
          status: 500,
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to update question",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}