import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, User } from "@/types/common";
import { getAllUsers } from "@/app/actions/submit-question";
import { requireAdmin, createAdminForbiddenResponse } from "@/lib/auth/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = await requireAdmin(request);
    if (!adminAuth) {
      return createAdminForbiddenResponse();
    }

    const users = await getAllUsers();

    const response: ApiResponse<User[]> = {
      data: users,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<User[]> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to fetch users",
        status: 500,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}