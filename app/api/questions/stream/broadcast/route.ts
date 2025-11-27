import { NextRequest, NextResponse } from "next/server";
import { broadcastToClients } from "../route";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Broadcast the message to all connected clients
    broadcastToClients(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to broadcast" },
      { status: 500 }
    );
  }
}