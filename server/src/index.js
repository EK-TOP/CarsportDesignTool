import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.PORT ?? 5000);
const origin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin } });

io.on('connection', (socket) => {
  socket.emit('session:ready', { sessionId: socket.id });
  socket.on('configuration:updated', (configuration) => {
    socket.broadcast.emit('configuration:updated', configuration);
  });
});

httpServer.listen(port, () => {
  console.log(`Carsport realtime server listening on port ${port}`);
});
