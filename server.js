/**
 * Custom Next.js Server with WebSocket Support
 * Enables real-time AI chat functionality
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeChatServer } = require('./dist/lib/websocket/websocket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server for AI chat
  try {
    initializeChatServer(server);
    console.log('🚀 WebSocket server initialized for AI chat');
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error);
  }

  // Start server
  server
    .once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 SmartingGoods AI Platform ready on http://${hostname}:${port}`);
      console.log(`💬 WebSocket chat available at ws://${hostname}:${port}/api/socket/chat`);
    });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});