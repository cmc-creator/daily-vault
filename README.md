# Daily Vault

Daily Vault is a compact full-stack daily roguelike deckbuilder. Players sign in, start a seeded daily run, battle through encounters, track a real-time leaderboard, and unlock cosmetics through a Stripe-ready shop and battle pass.

## Stack

- **Client:** React 19, TypeScript, Vite, Socket.IO client
- **Server:** Node.js, Express, TypeScript, Mongoose, Socket.IO, Stripe
- **Database:** MongoDB
- **Local orchestration:** Docker Compose
- **Deployment targets:** Vercel (client) + Railway (server)

## Project Structure

```text
client/   React app and UI
server/   Express API, game logic, MongoDB models, Socket.IO
```

## Environment Variables

Copy `.env.example` to `.env` for local overrides.

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port |
| `CLIENT_URL` | Allowed browser origin for CORS |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key for real checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `ALLOW_DEMO_CHECKOUT` | Enables local demo purchase fulfillment when Stripe is absent |
| `FRONTEND_URL` | Redirect base URL for Stripe success/cancel URLs |
| `VITE_API_BASE_URL` | Client API base URL |
| `VITE_SOCKET_PATH` | Client Socket.IO path |
| `VITE_SOCKET_URL` | Optional absolute Socket.IO server URL for split deployments |
| `VITE_DEV_PROXY_TARGET` | Optional Vite dev proxy target for containerized local dev |

## Local Development

### Option 1: Docker Compose

```bash
docker compose up --build
```

Services:

- Client: http://localhost:5173
- Server API: http://localhost:4000/api
- MongoDB: mongodb://localhost:27017/daily-vault

### Option 2: Run services manually

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/players/me`
- `PATCH /api/players/me`
- `GET /api/runs/daily`
- `POST /api/runs`
- `GET /api/runs/:runId`
- `POST /api/runs/:runId/actions`
- `GET /api/leaderboard`
- `GET /api/shop/catalog`
- `POST /api/shop/checkout-session`
- `POST /api/shop/webhook`

## Gameplay Loop

1. Register or sign in.
2. Start the seeded daily run.
3. Play cards to defeat the three daily encounters.
4. Earn score, gems, and battle pass XP.
5. Watch the leaderboard update in real time through Socket.IO.
6. Buy cosmetics or boosters through the shop.

## Stripe Integration

- Without Stripe keys, checkout falls back to a safe **demo purchase** mode for local development.
- Set `ALLOW_DEMO_CHECKOUT=true` only in local/demo environments where free fulfillment is acceptable.
- With `STRIPE_SECRET_KEY` configured, the server creates a real Stripe Checkout session.
- With `STRIPE_WEBHOOK_SECRET`, configure your Stripe webhook endpoint to:

```text
https://your-railway-app.up.railway.app/api/shop/webhook
```

## Deployment

### Vercel (client)

1. Import the repository into Vercel.
2. Set the root directory to `client`.
3. Configure:
   - `VITE_API_BASE_URL=https://your-railway-app.up.railway.app/api`
   - `VITE_SOCKET_PATH=/socket.io`
   - `VITE_SOCKET_URL=https://your-railway-app.up.railway.app`
4. Deploy.

### Railway (server)

1. Import the repository into Railway.
2. Set the root directory to `server`.
3. Add environment variables from `.env.example`.
4. Set `MONGODB_URI` to MongoDB Atlas or Railway Mongo.
5. Start command:

```bash
npm run start
```

6. Build command:

```bash
npm run build
```

### Production notes

- Set `CLIENT_URL` to the deployed Vercel URL.
- Set `FRONTEND_URL` to the same Vercel URL for Stripe redirects.
- Keep `ALLOW_DEMO_CHECKOUT=false` in production.
- Use a production MongoDB instance.
- Configure the Stripe webhook endpoint after the first deployment.

## CI/CD

The GitHub Actions workflow in `.github/workflows/ci-cd.yml` installs dependencies, builds both apps, and can deploy to Vercel and Railway when the required secrets are configured.
