# 📱 Render ပေါ် ဖုန်းကနေ တင်နည်း (အဆင့်ဆင့်)

> ကွန်ပြူတာ မလိုပါ။ ဖုန်း browser နဲ့သာ လုပ်လို့ရပါတယ်။

---

## 🔑 လိုအပ်တဲ့ အချက်အလက်များ (copy လုပ်ထားပါ)

| Key | Value |
|---|---|
| BOT_TOKEN | `8941636635:AAEJUcZSuMa743TAMPwy25LaknxSj7bK-1U` |
| ADMIN_ID | `8927464164` |
| ADMIN_PASSWORD | `kocho2024` (ကိုယ်ပိုင် ပြောင်းနိုင်) |
| BOT_USERNAME | `kocho_mobile_service_bot` |

---

## အဆင့် ၁ — Render Account ဖွင့်

1. ဖုန်း browser မှာ **https://render.com** ဖွင့်ပါ
2. **Get Started** / **Sign Up** နှိပ်ပါ
3. **GitHub** နဲ့ sign up လုပ်ပါ (အလွယ်ဆုံး — GitHub account ရှိပြီးသားမို့)
4. GitHub က authorize လုပ်ခွင့်ပြုပါ

---

## အဆင့် ၂ — Blueprint Deploy (အလွယ်ဆုံးနည်း)

1. ဒီ link ကို ဖုန်း browser မှာ ဖွင့်ပါ —
   **https://render.com/deploy?repo=https://github.com/htetmyetaung77/kocho-mobile**
2. Render က `render.yaml` ကို ဖတ်ပြီး service အလိုအလျောက် ပြင်ဆင်ပေးပါမယ်
3. **Apply** / **Create** နှိပ်ပါ
4. Environment Variables ဖြည့်ရပါမယ် (အဆင့် ၃ ကြည့်)

---

## အဆင့် ၃ — Environment Variables ဖြည့်

Render dashboard မှာ service ကို ရွေးပြီး **Environment** tab ကို ဖွင့်ပါ။ အောက်ပါတို့ ဖြည့်ပါ —

| Key | Value |
|---|---|
| `BOT_TOKEN` | `8941636635:AAEJUcZSuMa743TAMPwy25LaknxSj7bK-1U` |
| `ADMIN_ID` | `8927464164` |
| `ADMIN_PASSWORD` | `kocho2024` |
| `BOT_USERNAME` | `kocho_mobile_service_bot` |
| `PUBLIC_URL` | (deploy ပြီးမှ ရလာတဲ့ URL — ဥပမာ `https://kocho-mobile-bot.onrender.com`) |

> `PUBLIC_URL` ကို deploy ပြီး URL ရလာတဲ့အခါ ပြန်ထည့်ပါ။ (self-ping အတွက်)

---

## အဆင့် ၄ — Deploy စောင့်

- **Logs** tab မှာ ကြည့်ပါ
- `Bot started: @kocho_mobile_service_bot` ပေါ်ရင် အောင်မြင်ပါပြီ ✅
- `HTTP server running on 3000` လည်း ပေါ်ရပါမယ်

---

## အဆင့် ၅ — အသုံးပြု

Deploy ပြီးရင် သင့် URL က ဒီလို ဖြစ်ပါမယ် —
`https://kocho-mobile-bot.onrender.com`

- **Admin Panel:** `https://kocho-mobile-bot.onrender.com/admin`
- **Mini App:** `https://kocho-mobile-bot.onrender.com/miniapp`
- **Bot:** Telegram မှာ `@kocho_mobile_service_bot` → `/admin`

---

## ⚠️ Render Free Plan အကြောင်း

- Free plan က **၁၅ မိနစ်** မလှုပ်ရှားရင် sleep ဖြစ်ပါတယ်
- ဒါကို ကာကွယ်ဖို့ **self-ping** စနစ် ထည့်ပြီးပါပြီ (၁၀ မိနစ်တစ်ခါ ကိုယ့်ကိုယ်ကို ping)
- `PUBLIC_URL` ထည့်ထားဖို့ လိုပါတယ် (မထည့်ရင် self-ping အလုပ်မလုပ်ပါ)

---

## 🆘 အကူအညီ

တစ်ဆင့်ချင်း မရရင် screenshot ပို့ပါ — ကူညီပေးပါမယ်။
