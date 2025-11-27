import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth/utils";
import { ApiResponse } from "@/types/common";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Token and password are required",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (password.length < 6) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Password must be at least 6 characters long",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const result = await resetPassword(token, password);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: {
          message: "Password reset successfully",
        },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to reset password",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: "Internal server error",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}