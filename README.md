# Daily Vault 🎮

A fast, addictive daily roguelike deckbuilder with leaderboards, cosmetics, and seasonal content.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (free tier at Atlas)

### Local Development

1. Clone the repo:
```bash
git clone https://github.com/cmc-creator/daily-vault.git
cd daily-vault
```

2. Setup environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Install dependencies:
```bash
# Frontend
cd client && npm install && npm run dev

# Backend (in another terminal)
cd server && npm install && npm run dev
```

4. Open http://localhost:5173 in your browser

## Deployment

### Vercel (Frontend)
1. Go to vercel.com
2. Import this repo
3. Set Root Directory: `client`
4. Deploy

### Railway (Backend)
1. Go to railway.app
2. Create new project from GitHub
3. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - STRIPE_SECRET_KEY
   - FRONTEND_URL
4. Deploy

## Architecture

- **Frontend**: React 19 + Vite + Phaser 3
- **Backend**: Express + Node.js + Socket.io
- **Database**: MongoDB
- **Payments**: Stripe
- **Hosting**: Vercel (frontend) + Railway (backend)

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/leaderboard/daily` - Daily leaderboard
- `GET /api/shop/cosmetics` - Shop cosmetics

## Development

See `/docs` for detailed documentation.

## License

MIT
