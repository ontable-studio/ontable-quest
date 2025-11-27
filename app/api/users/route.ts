import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, User } from "@/types/common";
import { getAllUsers } from "@/app/actions/submit-question";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const allUsers = await getAllUsers();

    // Filter users by search
    let filteredUsers = allUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    filteredUsers.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response: ApiResponse<{
      users: User[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }> = {
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalItems: filteredUsers.length,
          hasNextPage: endIndex < filteredUsers.length,
          hasPrevPage: page > 1,
        },
      },
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