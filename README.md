# Ko Cho Mobile — Telegram Bot

🏪 **Ko Cho Mobile (Good Evening Mobile Shop)** — Telegram business bot for a phone shop in Myanmar.

## Live URLs
- 🤖 **Bot**: https://t.me/kocho_mobile_service_bot
- 🛍️ **Mini App**: https://kocho-mobile-bot.onrender.com/miniapp
- 🔐 **Admin Panel**: https://kocho-mobile-bot.onrender.com/admin (password: `kocho2024`)
- 📢 **Channel**: https://t.me/kochomobile
- ❤️ **Health**: https://kocho-mobile-bot.onrender.com/health

## Features

### Customer side
- 📱 **Phone catalog** — 66 products across 9 categories (iPhone, Xiaomi/Redmi, Oppo, Vivo, Huawei/Honor, Samsung, Realme, Tecno/Infinix, ROG)
- 🔍 **Search** — find phones by model / keyword
- 🛒 **Orders** — full order flow (name → phone → address → quantity), stock check, delivery fee, payment screenshot upload
- 📦 **My Orders** — view order status, cancel an order (stock auto-restored)
- 💳 **Payment info** — KBZ / Wave / AYA / Credit card installment
- 🔄 **Sell / Pawn / Trade-in** — customer request flow with admin reply
- 🤖 **AI chat** — OpenAI-ready (graceful FAQ fallback)
- 🏪 **Shop info** — about, services, contact
- 🛍️ **Mini App** — web shop with search bar + category filter at `/miniapp`
- 🚪 **Channel join gate** — optional (REQUIRE_CHANNEL_JOIN)

### Admin side
- 🔐 **Admin panel** (bot + web) — statistics, products, orders, requests, users, broadcast
- ➕ **Product CRUD** — add / edit / toggle / delete
- 📦 **Stock In/Out** — with stock log
- 📊 **Order management** — status change (pending/confirmed/delivered/cancelled) + customer notify
- 📥 **Request management** — reply to sell/pawn/trade-in requests
- 📢 **Broadcast** — message all users
- 📣 **Post to Channel** — promo post with inline buttons
- 🔄 **Channel auto-post** — new products & price changes auto-posted to channel
- 💾 **DB persistence** — SQLite snapshot backed up to GitHub (survives Render restarts)

## Environment variables
```
BOT_TOKEN=...                 # from @BotFather
ADMIN_ID=...                  # your numeric Telegram ID
ADMIN_PASSWORD=kocho2024      # web admin panel password
BOT_USERNAME=kocho_mobile_service_bot
PUBLIC_URL=https://your-app.onrender.com
CHANNEL_ID=@kochomobile       # channel for auto-post
REQUIRE_CHANNEL_JOIN=false    # true = users must join channel first
DELIVERY_FEE=0                # optional delivery fee (MMK)
GITHUB_TOKEN=                 # PAT for DB persistence
GITHUB_REPO=htetmyetaung77/kocho-mobile
OPENAI_API_KEY=               # optional, enables AI chat
PORT=3000
```

## Run locally
```
npm install
npm approve-scripts better-sqlite3
npm rebuild better-sqlite3
npm start
```

## Deploy on Render
1. Create a **Web Service** from this repo (branch `main`).
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Health Check Path: `/health`
5. Add the environment variables above.

> Render free tier sleeps after inactivity. The bot self-pings `/health` every 10 minutes to stay awake.

## Mini App
After deployment, open `https://YOUR-DOMAIN/miniapp`.
The bot automatically sets this as its **Menu Button** on startup.

## Security
- Never commit `.env` or the bot token.
- If a token is exposed, revoke it via @BotFather and generate a new one.

## Contact
- 📱 Ph – 09779944100
- 🌐 Facebook: https://www.facebook.com/Rinooo00
- 📢 Telegram Channel: https://t.me/kochomobile
- 📍 Google Map: https://maps.app.goo.gl/gC1GB5WLWMwjYsuX8
