import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { changePassword } from "@/lib/auth/utils";
import { getCurrentUser, createUnauthorizedResponse } from "@/lib/auth/admin-auth";
import * as z from "zod";

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
});

export async function PATCH(request: NextRequest) {
  try {
    // Get the current authenticated user
    const currentUser = await getCurrentUser(request);

    if (!currentUser?.id) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Invalid input: " + validation.error.issues.map(e => e.message).join(", "),
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    // Check if new password is the same as current password
    if (currentPassword === newPassword) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "New password must be different from current password",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Change password using auth utility
    const result = await changePassword(currentUser.id, currentPassword, newPassword);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: {
          message: "Password changed successfully",
          requiresReauth: false // Password change doesn't require re-authentication
        },
      };
      return NextResponse.json(response);
    } else {
      let statusCode = 500;
      const message = result.error || "Failed to change password";

      // Set appropriate status code based on error type
      if (message.includes("OAuth users")) {
        statusCode = 403;
      } else if (message.includes("incorrect")) {
        statusCode = 400;
      }

      const response: ApiResponse = {
        success: false,
        error: {
          message,
          status: statusCode,
        },
      };
      return NextResponse.json(response, { status: statusCode });
    }
  } catch (error) {
    console.error("Password change error:", error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Internal server error",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}