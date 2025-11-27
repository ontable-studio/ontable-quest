import { NextRequest, NextResponse } from "next/server";
import { generatePasswordResetToken } from "@/lib/auth/utils";
import { ApiResponse } from "@/types/common";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: "Email is required",
          status: 400,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const result = await generatePasswordResetToken(email);

    // Always return success to prevent email enumeration attacks
    const response: ApiResponse = {
      success: true,
      data: {
        message: "If an account with this email exists, password reset instructions have been sent.",
      },
    };

    if (result.success && result.token) {
      // In a real application, you would send an email here
      // For now, we'll just log the token (in production, remove this)
      console.log(`Password reset token for ${email}: ${result.token}`);
      console.log(`Reset link: ${env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${result.token}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Forgot password error:", error);

    // Still return success to prevent email enumeration
    const response: ApiResponse = {
      success: true,
      data: {
        message: "If an account with this email exists, password reset instructions have been sent.",
      },
    };
    return NextResponse.json(response);
  }
}
