# PeerNotes (Next.js + Node) Walkthrough

This repository runs as **three services**:

- **frontend/**: Next.js (App Router) UI
- **backend-node/**: Central Node/Express API + DB (auth, metadata, search)
- **file_peer/**: Local Node/Express peer file service (stores and serves files)

---

## Quick Start

Open **3 terminals** (PowerShell) at repo root.

### 1) Central API (backend-node) — `http://localhost:8000`

```powershell
cd backend-node
npm install
npm start
```

### 2) Peer file service (file_peer) — `http://localhost:8080`

```powershell
cd file_peer
npm install
npm start
```

You should see:

- `file_peer (node) listening on port 8080`

### 3) Frontend (Next.js) — `http://localhost:5173`

```powershell
cd frontend
npm install
npm run dev
```

---

## Environment / Configuration

The frontend reads base URLs via `frontend/.env`:

- `NEXT_PUBLIC_CENTRAL_SERVER` (default expected: `http://localhost:8000`)
- `NEXT_PUBLIC_PEER_SERVICE` (default expected: `http://localhost:8080`)

If you do not set these, the frontend falls back to local defaults in `frontend/src/utils/env.ts`.

---

## Application Flow (What calls what)

### Authentication

- **Login**: `POST {CENTRAL}/api/login/`
- **Signup**: `POST {CENTRAL}/api/signup/`

On successful login, the frontend stores the JWT in:

- `localStorage['authToken']`

All authenticated requests send:

- Header `Authorization: Token <jwt>`

(See `frontend/src/utils/getAuthHeaders.ts`.)

### Polling / Presence

The app periodically reports the user as “online” and updates peer IP information:

- Frontend polling hook: `frontend/src/hooks/usePoll.ts`
- Central endpoint: `POST {CENTRAL}/api/poll/`

### Search + Results

- Search filters are fetched from the central API (`/api/professors/`, `/api/courses/`, `/api/topics/`, `/api/semesters/`).
- Results page queries:
  - `GET {CENTRAL}/api/files/filter/?professor=...&course=...&topic=...&semester=...`

### Upload Notes (Register)

Upload is a **two-step** process:

1) **Register metadata on the central server**

- `POST {CENTRAL}/api/register/`
- Body: `{ filename, topic, professor?, course?, semester? }`
- Response includes a generated `id`

2) **Copy the actual file into the local peer service**

- `POST {PEER}/copy-file` (multipart/form-data)
- Form fields:
  - `file` (uploaded file)
  - `file_id` (the id from step 1)

The peer service stores files as:

- `file_peer/uploads/<file_id>_<filename>`

The `/register` page compares:

- central “files registered by this user” vs
- peer “files physically hosted on this machine”

using:

- `GET {CENTRAL}/api/get-peer-files/`
- `GET {PEER}/files`

### Download Notes

When downloading a file from another peer:

- Frontend requests:
  - `POST {PEER}/request` with `{ id, filename, ip }`
- The peer service fetches from the remote peer:
  - `GET http://<ip>:8080/send?id=...&filename=...`

---

## Peer Service API (file_peer)

- `GET /ip`
  - Returns this machine’s LAN IPv4 address (best-effort)
- `GET /files`
  - Returns `{ files: ["filename1", ...] }`
- `POST /copy-file`
  - Accepts multipart/form-data with `file` and `file_id`
- `GET /send?id=...&filename=...`
  - Sends a stored file to another peer
- `POST /request`
  - Downloads a file from another peer and stores it locally

---

## Repo Structure (Current)

- `frontend/src/app/(auth)/...`
  - `/login`, `/signup`
- `frontend/src/app/(app)/...`
  - `/search`, `/results`, `/register`
- `frontend/src/components/`
  - `AppShell`, `Navbar`
- `backend-node/controllers/`
  - `authController.js`, `fileController.js`, etc.
- `file_peer/server.js`
  - Node peer service implementation

---

## Troubleshooting

### "ERR_CONNECTION_REFUSED" to `http://localhost:8080/...`
- The peer service is not running.
- Start it:
  - `cd file_peer; npm start`

### Upload works in central DB but file is not hosted
- Check peer service logs.
- Ensure `POST /copy-file` is returning `200`.
- Ensure the peer service `uploads/` folder is writable.

### 401 Unauthorized
- You’re missing/invalid `authToken`.
- Log in again and confirm `localStorage['authToken']` exists.

---

## Development Notes

- The frontend dev server is pinned to port **5173**.
- The central API is expected at **8000**.
- The peer service is expected at **8080**.
