import { NextRequest, NextResponse } from "next/server";
import { createUserWithPassword } from "@/lib/auth/utils";
import { ApiResponse } from "@/types/common";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Email and password are required",
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

    const result = await createUserWithPassword(email, name || "", password);

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: {
          message: "User created successfully",
        },
      };
      return NextResponse.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: result.error || "Failed to create user",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error("Registration error:", error);
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