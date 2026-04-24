# Real Estate Board – Backend

A lightweight Express.js server that serves a JSON REST API and static frontend files for the real estate board application.

## Architecture

```
src/backend/
└── server.js        # Single-file Express app

legacy/
├── data/            # JSON flat-file "database"
│   ├── properties.json
│   ├── agents.json
│   └── locations.json
└── app/             # Static frontend (AngularJS, served as-is)
    └── index.html
```

The server reads data from `../../legacy/data/` on every request (no in-memory cache). Static frontend files from `../../legacy/app/` are served directly by Express. Any non-API route falls back to `index.html` to support client-side routing.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/properties` | List properties. Supports query params: `type`, `status`, `location`, `bedroomsMin`, `priceMin`, `priceMax` |
| GET | `/api/properties/:id` | Get a single property by ID |
| GET | `/api/agents` | List all agents |
| GET | `/api/agents/:id` | Get a single agent by ID |
| GET | `/api/locations` | List all locations |

## How to Run

**Prerequisites:** Node.js 18+

```bash
cd src/backend
npm install
```

Start (production):
```bash
npm start
```

Start with auto-reload (development):
```bash
npm run dev
```

The server listens on `http://localhost:3000` by default. Override with the `PORT` environment variable:

```bash
PORT=8080 npm start
```
