# Ko Cho Mobile Bot — Deploy Guide

## Bot Info
- Bot username: @kocho_mobile_service_bot
- Admin ID: 8927464164
- Products: 66 items / 9 categories

## Option 1 — Render (Recommended, Free)
1. Push this folder to a GitHub repository.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
4. Add Environment Variables:
   - `BOT_TOKEN` = your bot token
   - `ADMIN_ID` = 8927464164
   - `BOT_USERNAME` = kocho_mobile_service_bot
   - `PUBLIC_URL` = https://your-app.onrender.com
   - `PORT` = 3000
5. Deploy. The bot will run 24/7.

> Note: Render free tier sleeps after inactivity. For always-on, use a paid plan or Railway.

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
- Deployed static page: https://sites.super.myninja.ai/75628a10-6e0a-49f0-8c93-1b0b53d6e979/3da0a6c5/index.html
- After deploying the bot, the Mini App is also served at: `https://YOUR-DOMAIN/miniapp`
- Set this URL in BotFather → Bot Settings → Menu Button / Web App.

## Security
- Never commit `.env` or the bot token to GitHub.
- If the token is ever exposed, revoke it via @BotFather and generate a new one.
