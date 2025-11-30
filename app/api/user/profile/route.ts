import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { updateUserProfile } from "@/app/actions/submit-question";
import { getCurrentUser, createUnauthorizedResponse } from "@/lib/auth/admin-auth";

export async function PATCH(request: NextRequest) {
  try {
    // Get the current authenticated user
    const currentUser = await getCurrentUser(request);

    if (!currentUser?.id) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { name, avatar } = body;

    // Validate the request body
    if (!name && !avatar) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "At least one field (name or avatar) must be provided",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate name length if provided
    if (name && (typeof name !== 'string' || name.length > 100)) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Name must be a string with maximum 100 characters",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate avatar URL if provided
    if (avatar && (typeof avatar !== 'string' || avatar.length > 500)) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Avatar must be a valid URL string with maximum 500 characters",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const result = await updateUserProfile(currentUser.id, { name, avatar });

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: "Profile updated successfully" },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to update profile",
          status: 500,
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error("Profile update error:", error);
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