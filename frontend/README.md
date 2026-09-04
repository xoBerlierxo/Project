# Career Connect — Frontend

This directory is owned and maintained independently by the frontend
engineer. The backend does not create, modify, or depend on anything here.

## Talking to the backend

- Base URL (local dev): `http://localhost:3000/api`
- Full endpoint contract: [`../docs/API.md`](../docs/API.md)
- Data model reference: [`../docs/DATABASE.md`](../docs/DATABASE.md)

## Running the backend locally

```bash
cd ../backend
npm install
npm run setup   # creates the SQLite db, tables, and demo seed data
npm run dev     # starts the API on http://localhost:3000
```

Verify it's alive: `GET http://localhost:3000/api/health`

## CORS

The backend allows the origin set in `backend/.env` as `FRONTEND_URL`
(defaults to `http://localhost:5173`). Update that value if your dev server
runs on a different port.

## Demo admin login

See `../backend/README.md` for demo admin credentials (development only).
