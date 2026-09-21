# Ko Cho Mobile Bot — Deploy Guide

## Bot Info
- Bot username: @kocho_mobile_service_bot
- Admin ID: 8927464164
- Products: 66 items / 9 categories
- Live URL: https://kocho-mobile-bot.onrender.com

## Option 1 — Render (Recommended, Free)
1. Push this folder to a GitHub repository (branch `main`).
2. Go to https://render.com → New → Web Service → connect your repo.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
4. Add Environment Variables:
   - `BOT_TOKEN` = your bot token
   - `ADMIN_ID` = 8927464164
   - `ADMIN_PASSWORD` = kocho2024
   - `BOT_USERNAME` = kocho_mobile_service_bot
   - `PUBLIC_URL` = https://kocho-mobile-bot.onrender.com
   - `CHANNEL_ID` = @kochomobile
   - `REQUIRE_CHANNEL_JOIN` = false
   - `DELIVERY_FEE` = 0
   - `GITHUB_TOKEN` = your GitHub PAT (for DB persistence)
   - `GITHUB_REPO` = htetmyetaung77/kocho-mobile
   - `PORT` = 3000
5. Deploy. The bot will run 24/7 and self-ping to avoid free-tier spin-down.

> Note: Render free tier sleeps after inactivity. The bot self-pings `/health` every 10 minutes.

## Option 2 — Railway
1. Go to https://railway.app → New Project → Deploy from GitHub repo.
2. Add the same environment variables as above.
3. Start command: `npm start`.

## Option 3 — VPS / Docker
```
npm install
npm start
```
Use pm2 for persistence:
```
npm install -g pm2
pm2 start index.js --name kocho-bot
pm2 save
pm2 startup
```

## Mini App
- Served at: `https://kocho-mobile-bot.onrender.com/miniapp`
- The bot sets this as its Menu Button automatically on startup.
- You can also set it manually in BotFather → Bot Settings → Menu Button / Web App.

## Security
- Never commit `.env` or the bot token to GitHub.
- If the token is ever exposed, revoke it via @BotFather and generate a new one.
