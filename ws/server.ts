// server.ts
import { createServer } from 'http';
import next from 'next';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

// Set up environment
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();

  const server = createServer(expressApp);

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message: string) => {
      console.log(`Received: ${message}`);

      // Echo the message back to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log("sending to clinets")
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Express route (optional, can be used for custom routes)
  expressApp.get('/', (req, res) => {
    res.send('Hello from Express!');
  });

  // Handle all other requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  server.listen(3001, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
