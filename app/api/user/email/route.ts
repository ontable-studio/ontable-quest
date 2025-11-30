import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { changeEmail } from "@/lib/auth/utils";
import { getCurrentUser, createUnauthorizedResponse } from "@/lib/auth/admin-auth";
import * as z from "zod";

// Validation schema for email change
const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
    const validation = changeEmailSchema.safeParse(body);
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

    const { newEmail, password } = validation.data;

    // Check if user is trying to change to the same email
    if (newEmail === currentUser.email) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "New email must be different from current email",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Change email using auth utility
    const result = await changeEmail(currentUser.id, newEmail, password);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: {
          message: "Email updated successfully. Please check your new email for verification.",
          requiresReauth: true // User needs to re-authenticate with new email
        },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to change email",
          status: 500,
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error("Email change error:", error);
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