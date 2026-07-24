# Lakshmi Hospital — Backend API

A small Express API that powers the appointment request and contact forms on
the website. Stores submissions as JSON files (no database server to set up),
optionally emails staff on each new submission, and includes a lightweight
admin page to review submissions.

## What it does

- `POST /api/appointments` — receives appointment requests from the Contact
  page form (name, phone, department, branch, message)
- `POST /api/contact` — receives general contact messages
- `GET /api/appointments` and `GET /api/contact` — admin-only, protected by
  an `x-admin-key` header, used by `admin.html`
- `GET /api/doctors` — public, returns the doctor directory as JSON.
- `GET /api/departments` — public, returns the department directory as JSON.
- `POST /api/doctors`, `PUT /api/doctors/:id`, `DELETE /api/doctors/:id` —
  admin-only, add/edit/remove a doctor without touching code. Same pattern
  for `/api/departments`.
- `GET /api/health` — uptime check

## Local setup

cd backend
npm install
cp .env.example .env
npm start

## Deploying

Deploys easily to Render, Railway, or any Node 18+ host. Set the
environment variables from `.env.example` in your host's dashboard, then
point `FRONTEND_ORIGIN` at your real site domain once live.

## Security notes

- Set a strong, unique `ADMIN_KEY`.
- Set `FRONTEND_ORIGIN` to the real site domain in production (not `*`).
- The rate limiter caps form submissions at 20 per IP per 15 minutes.
