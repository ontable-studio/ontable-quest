import { NextRequest } from "next/server";

// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";

// Store active SSE connections
const connections = new Set<ReadableStreamDefaultController>();

// Broadcast to all connected clients
export function broadcastToClients(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      // Connection was closed, remove it
      connections.delete(controller);
    }
  });
}

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  // Broadcast to all connected clients
  broadcastToClients({
    type: "new-question",
    question,
    timestamp: new Date().toISOString(),
  });

  return Response.json({ success: true });
}

export async function GET() {
  const encoder = new TextEncoder();

  // Create a streaming response
  const customReadable = new ReadableStream({
    start(controller) {
      // Add this connection to our active connections
      connections.add(controller);

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "connected",
            timestamp: new Date().toISOString(),
          })}\n\n`
        )
      );
    },
    cancel() {
      // Connection was closed
      connections.forEach((c) => {
        if (c === this) {
          connections.delete(c);
        }
      });
    },
  });

  // Return the stream response and keep the connection alive
  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}