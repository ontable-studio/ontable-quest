import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

const redis = new Redis({
  url: env.STORAGE_KV_REST_API_URL,
  token: env.STORAGE_KV_REST_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    // This is a one-time endpoint - it should be deleted after use
    const { email, name, password } = await request.json();

    // Check if user already exists
    const existingUserId = await redis.get(`user_email:${email}`);
    if (existingUserId) {
      return NextResponse.json({
        success: false,
        error: "User with this email already exists"
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const id = Date.now().toString();
    const newUser = {
      id,
      email,
      name,
      role: 'admin',
      status: 'verified',
      provider: 'credentials',
      passwordHash,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Store user in Redis
    await redis.hset(`user:${id}`, newUser);
    await redis.set(`user_email:${email}`, id);

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id,
        email,
        name,
        role: 'admin',
        status: 'verified'
      }
    });

  } catch (error) {
    console.error("Failed to create admin account:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create admin account"
    }, { status: 500 });
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}