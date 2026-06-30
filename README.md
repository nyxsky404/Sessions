# Sessions

A full-stack marketplace where creators publish bookable sessions (workshops,
mentoring, fitness, photography, and more) and users browse, book, and pay for
them.

## Features

- GitHub OAuth login (no passwords). JWT access tokens with an httpOnly refresh cookie.
- Dual roles: every account starts as a **user** and can switch to **creator** and back.
- Creators: create, edit, and manage rich session listings; view bookings per session.
- Users: browse a filterable catalog, view session details, and book seats.
- Seat-based capacity with pending-booking holds that expire automatically.
- Stripe checkout for paid sessions (test mode).
- Seeded demo data: sample creators, sessions, and reviews.

## Tech Stack

| Layer    | Stack                                                        |
| -------- | ------------------------------------------------------------ |
| Backend  | Django 5, Django REST Framework, SimpleJWT                   |
| Frontend | React 18, Vite, React Router, TanStack Query, Tailwind CSS   |
| Database | PostgreSQL 16                                                |
| Payments | Stripe                                                       |
| Infra    | Docker Compose, Nginx (reverse proxy + static/media)         |

## Architecture

Nginx is the single entrypoint on port 80. It serves the built frontend, proxies
`/api/*` to the Django backend, and serves `/static` and `/media`.

```
Browser ──▶ Nginx (:80)
              ├─ /            ──▶ Frontend (React static build)
              ├─ /api/*       ──▶ Backend (Django + Gunicorn :8000)
              ├─ /static, /media (shared volumes)
              └─ Backend ──▶ PostgreSQL (:5432)
```

## Project Structure

```
.
├── backend/                Django project
│   ├── config/             Settings, root URLs, WSGI
│   ├── accounts/           Custom user, GitHub OAuth, JWT, profile/role
│   ├── sessions_app/       Session model, catalog & creator endpoints, seeder
│   ├── bookings/           Booking model, seat holds, booking endpoints
│   ├── payments/           Stripe checkout + webhook
│   ├── reviews/            Review model (display-only, seeded)
│   ├── common/             Shared permissions and upload helpers
│   └── entrypoint.sh       Migrate, collectstatic, seed, run gunicorn
├── frontend/               React + Vite app
│   └── src/                pages, components, api client, auth context
├── nginx/                  Reverse proxy config
├── docker-compose.yml
└── .env.example
```

## Setup

### Prerequisites

- Docker and Docker Compose
- A GitHub OAuth app (see below)

### Steps

1. Clone the repository.

   ```bash
   git clone https://github.com/nyxsky404/Sessions.git
   cd "Sessions"
   ```

2. Create your environment file from the template and edit the values.

   ```bash
   cp .env.example .env
   ```

3. Build and start the stack.

   ```bash
   docker compose up --build
   ```

4. Open http://localhost in your browser. Migrations and demo data are applied
   automatically on backend startup.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable                                          | Description                                          |
| ------------------------------------------------- | ---------------------------------------------------- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Postgres credentials.                            |
| `DATABASE_URL`                                    | Connection string used by Django.                    |
| `DJANGO_SECRET_KEY`                               | Long random string. Change for any real deployment.  |
| `DJANGO_DEBUG`                                    | `True` for local dev, `False` in production.         |
| `DJANGO_ALLOWED_HOSTS`                            | Comma-separated allowed hosts.                       |
| `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`   | Comma-separated frontend origins.                    |
| `ACCESS_TOKEN_LIFETIME_MIN`                       | Access token lifetime in minutes.                    |
| `REFRESH_TOKEN_LIFETIME_DAYS`                     | Refresh token (cookie) lifetime in days.             |
| `COOKIE_SECURE`                                   | `True` only behind HTTPS; marks the refresh cookie Secure. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`       | From your GitHub OAuth app.                           |
| `GITHUB_REDIRECT_URI`                             | OAuth callback URL, e.g. `http://localhost/auth/callback`. |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe test keys.              |
| `FRONTEND_URL`                                    | Base frontend URL.                                   |
| `VITE_API_URL`                                    | API base path for the frontend (default `/api`).     |
| `VITE_STRIPE_PUBLISHABLE_KEY`                     | Stripe publishable key exposed to the frontend.      |

## Docker Commands

```bash
docker compose up --build        # Build and start all services
docker compose up -d             # Start in the background
docker compose logs -f backend   # Tail backend logs
docker compose down              # Stop and remove containers
docker compose down -v           # Stop and wipe the database volume

# Run management commands inside the backend container
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py seed_demo
```

## GitHub OAuth Setup

Login uses GitHub OAuth.

1. Go to GitHub → Settings → Developer settings → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name**: anything (e.g. `Sessions`).
   - **Homepage URL**: `http://localhost`
   - **Authorization callback URL**: `http://localhost/auth/callback`
3. Create the app, then copy the **Client ID** and generate a **Client Secret**.
4. Put them in `.env`:

   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_REDIRECT_URI=http://localhost/auth/callback
   ```

5. Restart the stack. The frontend fetches the authorize URL from the backend, so
   the callback URL must match exactly.

## API Overview

All routes are prefixed with `/api`.

### Auth

| Method | Path                  | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/auth/github/url/`   | Get the GitHub authorize URL.        |
| POST   | `/auth/github/`       | Exchange OAuth `code` for JWTs.      |
| POST   | `/auth/refresh/`      | Refresh access token via cookie.     |
| POST   | `/auth/logout/`       | Clear the refresh cookie.            |

### Accounts

| Method | Path           | Description                       |
| ------ | -------------- | --------------------------------- |
| GET    | `/me/`         | Current user profile.             |
| POST   | `/me/avatar/`  | Upload an avatar.                 |
| POST   | `/me/role/`    | Switch between user and creator.  |

### Sessions

| Method | Path                        | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/sessions/`                | List/filter the catalog.             |
| POST   | `/sessions/`                | Create a session (creator).          |
| GET    | `/sessions/{id}/`           | Session detail.                      |
| PUT    | `/sessions/{id}/`           | Update a session (creator).          |
| DELETE | `/sessions/{id}/`           | Delete a session (creator).          |
| GET    | `/creator/sessions/`        | The current creator's sessions.      |

### Bookings

| Method | Path                                       | Description                       |
| ------ | ------------------------------------------ | --------------------------------- |
| GET    | `/bookings/`                               | Current user's bookings.          |
| POST   | `/bookings/`                               | Book a session.                   |
| POST   | `/bookings/{id}/cancel/`                   | Cancel a booking.                 |
| GET    | `/creator/sessions/{id}/bookings/`         | Bookings for a creator's session. |

### Payments

| Method | Path                    | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/payments/checkout/`   | Create a Stripe checkout.    |
| POST   | `/payments/webhook/`    | Stripe webhook receiver.     |

## Demo Flow

1. **Login** — Open http://localhost, click Login, and authorize with GitHub.
   You land back in the app authenticated as a user.

2. **Create a session** — Open the profile menu and switch your role to
   **Creator**. Go to the Creator Dashboard and create a new session: fill in the
   title, description, category, price, schedule, and capacity, then publish it.

3. **Book a session** — Switch back to the **User** role (or use another account).
   Browse the catalog, open a session, and click Book. Free sessions confirm
   immediately; paid sessions go through Stripe checkout. The booking then appears
   in your User Dashboard, where you can cancel it.
