import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AdminStats } from "@/types/common";
import { getAdminStats } from "@/app/actions/submit-question";
import { requireAdmin, createAdminForbiddenResponse } from "@/lib/auth/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = await requireAdmin(request);
    if (!adminAuth) {
      return createAdminForbiddenResponse();
    }

    const stats = await getAdminStats();

    const response: ApiResponse<AdminStats> = {
      data: stats,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<AdminStats> = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to fetch admin stats",
        status: 500,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}