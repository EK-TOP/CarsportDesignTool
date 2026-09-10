# Carsport Design Tool

A vehicle configuration foundation with a React/Babylon.js designer, Express API, Socket.IO realtime service, PostgreSQL, and Redis.

## Start the stack

1. Copy `.env.example` to `.env` and change local credentials if required.
2. Run `docker compose up --build`.
3. Open the designer at http://localhost:5173.
4. Check the API at http://localhost:4000/health.

## Project layout

- `frontend/` — React/Vite designer and 3D viewer.
- `backend/` — REST API and Prisma schema.
- `server/` — WebSocket collaboration service.
- `docs/` — Architecture and contracts.
- `aiAgents/` — Agent responsibilities that guide implementation.
