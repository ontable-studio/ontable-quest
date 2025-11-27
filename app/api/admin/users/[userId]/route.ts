import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { updateUserRole, updateUserStatus } from "@/app/actions/submit-question";
import { requireAdmin, createAdminForbiddenResponse } from "@/lib/auth/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    // Check admin authentication
    const adminAuth = await requireAdmin(request);
    if (!adminAuth) {
      return createAdminForbiddenResponse();
    }

    let result;

    if (body.action === 'updateRole' && body.role) {
      result = await updateUserRole(userId, body.role);
    } else if (body.action === 'updateStatus' && body.status) {
      result = await updateUserStatus(userId, body.status);
    } else {
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid action or missing parameters",
          status: 400,
        },
      }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { message: "User updated successfully" },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: {
          message: result.error || "Failed to update user",
          status: 500,
        },
      }, { status: 500 });
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to update user",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}