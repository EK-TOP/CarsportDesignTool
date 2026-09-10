import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.PORT ?? 5000);
const origin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const realtimeEnabled = process.env.REALTIME_ENABLED === 'true';
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin },
  allowRequest: (_request, callback) => callback(null, realtimeEnabled)
});

function isConfigurationUpdate(value) {
  return typeof value === 'object'
    && value !== null
    && typeof value.vehicleId === 'string'
    && /^c[a-z0-9]{24}$/.test(value.vehicleId);
}

io.on('connection', (socket) => {
  socket.emit('session:ready', { sessionId: socket.id });
  socket.on('configuration:updated', (configuration) => {
    if (!isConfigurationUpdate(configuration)) {
      socket.emit('configuration:rejected', { error: 'Invalid configuration update' });
      return;
    }
    socket.broadcast.emit('configuration:updated', configuration);
  });
});

httpServer.listen(port, () => {
  console.log(`Carsport realtime server listening on port ${port}; ${realtimeEnabled ? 'enabled' : 'disabled until authentication is implemented'}`);
});

async function shutdown() {
  await new Promise((resolve) => io.close(resolve));
  await new Promise((resolve) => httpServer.close(resolve));
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
