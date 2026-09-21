# Ko Cho Mobile — Telegram Bot

🏪 **Ko Cho Mobile (Good Evening Mobile Shop)** — Telegram business bot for a phone shop in Myanmar.

## Features
- 📱 **Phone catalog** — 66 products across 9 categories (iPhone, Xiaomi/Redmi, Oppo, Vivo, Huawei/Honor, Samsung, Realme, Tecno/Infinix, ROG)
- 🔍 **Search** — find phones by model / keyword
- 🛒 **Orders** — place orders, admin gets notified
- 💳 **Payment info** — KBZ / Wave / AYA / Credit card installment
- 🔄 **Sell / Pawn / Trade-in** — customer request flow
- 🤖 **AI chat** — OpenAI-ready (graceful FAQ fallback)
- 🏪 **Shop info** — about, services, contact
- 🔐 **Admin panel** — statistics, orders, requests, users, broadcast
- 🖼️ **Mini App** — web page with logo at `/miniapp`
- 🗄️ **SQLite** database
- ❤️ **Health endpoint** at `/health`

## Environment variables
```
BOT_TOKEN=...
ADMIN_ID=...
BOT_USERNAME=kocho_mobile_service_bot
PUBLIC_URL=https://your-app.onrender.com
OPENAI_API_KEY=            # optional, enables AI chat
PORT=3000
```

## Run locally
```
npm install
npm start
```

## Deploy on Render
1. Create a **Web Service** from this repo.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Health Check Path: `/health`
5. Add environment variables: `BOT_TOKEN`, `ADMIN_ID`, `BOT_USERNAME`, `PUBLIC_URL`, `OPENAI_API_KEY`, `PORT`

## Deploy on Railway
1. New Project → Deploy from GitHub repo.
2. Add the same variables.
3. Start command: `npm start`.

## Mini App
After deployment, open `https://YOUR-DOMAIN/miniapp`.
Set this URL in BotFather → Bot Settings → Menu Button / Web App.

## Security
- Never commit `.env` or the bot token.
- If a token is exposed, revoke it via @BotFather and generate a new one.

## Contact
- 📱 Ph – 09779944100
- 🌐 Facebook: https://www.facebook.com/Rinooo00
- 📢 Telegram Channel: https://t.me/kochomobile
- 📍 Google Map: https://maps.app.goo.gl/gC1GB5WLWMwjYsuX8
