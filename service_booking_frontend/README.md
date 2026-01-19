# Mobile Service Booking – Frontend (React)

Customer booking flow + admin dashboard for the Mobile Service Booking system.

## Requirements

- Node.js + npm
- Backend running at **http://localhost:3001** (Flask)

> The frontend calls the backend directly (no proxy). Backend CORS should allow http://localhost:3000 (already configured per task notes).

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
