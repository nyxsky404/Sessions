# Sessions

A full-stack marketplace where creators publish bookable sessions and users
browse, book, and pay for them.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Django + Django REST Framework
- **Database:** PostgreSQL
- **Reverse proxy:** Nginx
- **Auth:** GitHub OAuth with backend-issued JWT
- **Payments:** Stripe (test mode)

## Running

Copy the example environment file and start the stack:

```bash
cp .env.example .env
docker-compose up --build
```

The app is served at http://localhost.

## Project structure

```
backend/    Django + DRF API
frontend/   React (Vite) single-page app
nginx/      Reverse proxy config
```
