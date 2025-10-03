/**
 * WebSocket Chat API Route - Initializes real-time chat server
 */

import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeChatServer } from '@/lib/websocket/websocket-server';

// Extend NextApiResponse to include socket server
interface NextApiResponseServerIO extends NextResponse {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
}

export async function GET(request: NextRequest) {
  // This endpoint provides WebSocket connection info
  return NextResponse.json({
    success: true,
    websocket: {
      path: '/api/socket/chat',
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      status: 'available'
    },
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        // WebSocket server initialization is handled in the custom server
        return NextResponse.json({
          success: true,
          message: 'WebSocket server initialization requested',
          timestamp: new Date().toISOString()
        });

      case 'status':
        // Return WebSocket server status
        return NextResponse.json({
          success: true,
          status: {
            websocketEnabled: true,
            path: '/api/socket/chat',
            connectionUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/socket/chat`
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('WebSocket API error:', error);
    
    return NextResponse.json(
      { 
        error: 'WebSocket API error',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}