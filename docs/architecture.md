# Carsport architecture

## Runtime services

- **frontend**: React/Vite vehicle designer and Babylon.js rendering surface.
- **backend**: Express REST API, domain services, PostgreSQL persistence, Redis cache.
- **server**: Socket.IO collaboration and configuration update events.
- **postgres**: Primary relational store.
- **redis**: Shared cache and future job/event coordination store.

## Domain boundaries

| Domain | Owner | Responsibility |
| --- | --- | --- |
| Vehicle, catalog, configuration, assets, auth | Backend | API and persistence boundary |
| Compatibility, fit, placement, safety | Rule engine | Configuration validation |
| Quotes, campaigns, formulas, currency | Pricing engine | Price breakdown generation |
| Rendering, anchors, snapping, collision visualization | 3D engine | Client-side Babylon.js layer |

## Contracts

- REST endpoints are served by `backend` under `/api` as domains are added.
- Realtime configuration events use `configuration:updated` through `server`.
- Amounts are represented as integer cents; never floating-point currency values.
- The frontend consumes only API contracts and never accesses PostgreSQL or Redis directly.
- Domain services own business rules; route handlers stay thin.
