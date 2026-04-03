# Planning Tool

A shared availability grid for coordinating trip dates with friends. Everyone sees the same calendar — click a cell to toggle your availability, and changes are saved instantly.

## How it works

The app shows a grid with people as rows and every day (April–December) as columns. Each cell is green (available) or red (unavailable). Click any cell to toggle it. Weekends are highlighted. All changes are persisted to a SQLite database on the server.

**Stack:** Node.js, Express, SQLite, vanilla HTML/JS. No build step.

## Running locally

```bash
npm install
node server.js
```

Open http://localhost:3000.

## Deploying to Fly.io

### First time

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Log in
fly auth login

# Launch the app (picks a name and region)
fly launch

# Create a persistent volume for the database
fly volumes create data --size 1 --region fra

# Deploy
fly deploy
```

The app will be live at `https://<your-app-name>.fly.dev` with automatic SSL.

### Subsequent deploys

```bash
fly deploy
```

This rebuilds from your local files and deploys. If you set up the GitHub Actions workflow (`.github/workflows/fly-deploy.yml`), deploys also happen automatically on push to `master`.

### Persistent storage

The `fly.toml` mounts a Fly volume at `/data`. The server stores `availability.db` there so data survives deploys and restarts. Without the volume, the database resets on every deploy.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/availability` | Get all availability data |
| `POST` | `/api/availability` | Set availability (`{ person, day, available }`) |
| `POST` | `/api/reset` | Clear all data |

## Customization

Edit `public/index.html` to change:
- **People** — the `people` array (line 45)
- **Months** — the `months` object (line 46)
- **Year** — the `Date` constructor in `getWeekday` (line 53)
