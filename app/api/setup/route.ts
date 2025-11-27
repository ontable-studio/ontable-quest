import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/common";
import { createUser, getUserByEmail } from "@/app/actions/submit-question";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail } = body;

    if (!adminEmail) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Admin email is required",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await getUserByEmail(adminEmail);
    if (existingAdmin) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Admin user already exists",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        message: "Setup completed successfully",
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to setup admin",
        status: 500,
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}