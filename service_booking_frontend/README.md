# Mobile Service Booking – Frontend (React)

Customer booking flow + admin dashboard for the Mobile Service Booking system.

## Requirements

- Node.js + npm
- Backend running locally (default: **http://localhost:3001**)

## Environment variables

This frontend supports environment-based API configuration:

- `REACT_APP_API_BASE_URL` (recommended): Base URL for API requests.
  - Default: `/api` (relative)
  - Examples:
    - `/api` (use CRA dev proxy in development)
    - `https://your-backend.example.com/api`
- `REACT_APP_USE_MOCKS`:
  - `true` enables demo/mock data for brands/models/problems (and simulates booking creation).
  - If not set, the app will automatically fall back to mock data when the backend is unreachable or returns 5xx during option loading.

Note: other environment variables may exist for other parts of the app, but these are the ones relevant to networking/mock mode.

## Proxy behavior (development)

This project is configured with a CRA `proxy` so that in development you can call:

- `GET /api/brands`
- `GET /api/models?brand=...`
- `GET /api/problems`
- etc.

…without CORS issues. By default, the proxy targets `http://localhost:3001`.

In production builds, the app uses the configured `REACT_APP_API_BASE_URL` (defaulting to relative `/api`), so you should host the frontend behind a reverse proxy that forwards `/api/*` to the backend.

## Run

```bash
npm install
npm start
```

Open: http://localhost:3000

## Routes

- `/` – Home (links to booking + admin)
- `/booking` – Customer multi-step booking flow
- `/booking/confirmation` – Confirmation screen (navigated to after successful submit)
- `/admin` – Admin dashboard (list bookings + update status)

## Backend endpoints used

- `GET /api/brands`
- `GET /api/models?brand=<brand_id>`
- `GET /api/problems`
- `POST /api/booking` (creates booking, returns `{ booking_id }`)
- `GET /api/admin/bookings`
- `POST /api/admin/update_status` (body: `{ booking_id, status }`)
