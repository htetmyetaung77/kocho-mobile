# 📣 Channel Subscriber 532 ယောက်ကို Bot သုံးစေဖို့ လမ်းညွှန်

## 🎯 နည်းလမ်း ၁ — Channel မှာ Post လုပ်ပြီး Pin လုပ်ခြင်း (အလွယ်ဆုံး)

အောက်က စာသားကို copy ကူးပြီး သင့် channel မှာ post လုပ်ပါ။ ပြီးရင် **Pin** လုပ်ထားပါ။

---

### 📋 Copy လုပ်ရန် စာသား (Copy-Paste)

```
🛒 ဖုန်းဈေးနှုန်းတွေ ကြည့်ရန် / မှာယူရန်

📱 iPhone, Xiaomi, Oppo, Vivo, Samsung, Realme, Huawei, Tecno, ROG
အားလုံး ဈေးနှုန်းတွေ ဒီ bot မှာ ကြည့်လို့ရပါပြီ 👇

🤖 Bot ဖွင့်ရန်: https://t.me/kocho_mobile_service_bot

📲 Mini App (ဈေးနှုန်းကြည့်ရန်): https://kocho-mobile-bot.onrender.com/miniapp

✅ ဈေးနှုန်းကြည့်ခြင်း
✅ ဖုန်းမှာယူခြင်း
✅ ရောင်း/ပေါင်/ချိန်း တင်ခြင်း
✅ ငွေလွှဲနည်း ကြည့်ခြင်း

👉 အခုပဲ Start နှိပ်ပြီး စမ်းကြည့်ပါ!
```

---

## 🎯 နည်းလမ်း ၂ — Bot ကနေ Channel မှာ Button ပါတဲ့ Post ပို့ခြင်း (အကောင်းဆုံး)

ဒီနည်းက button ပါတဲ့ post ဖြစ်လို့ subscriber တွေ နှိပ်ရုံနဲ့ bot ဆီ ရောက်ပါတယ်။

### အဆင့် ၁ — Bot ကို Channel Admin ထည့်ပါ

1. သင့် channel ကို ဖွင့်ပါ
2. **Manage Channel** (Channel စီမံ) → **Administrators** (Admin များ) ကို နှိပ်ပါ
3. **Add Admin** (Admin ထည့်) ကို နှိပ်ပါ
4. `@kocho_mobile_service_bot` ကို ရှာပြီး ရွေးပါ
5. **Post Messages** permission ကို ဖွင့်ပါ (ကျန်တာ ပိတ်ထားလို့ရ)
6. **Save** နှိပ်ပါ

> ⚠️ သတိ — သင့်ကို တခြားသူက admin ထည့်ပေးထားတာက သင့်အတွက်ပါ။ Bot အတွက် သင့်ကိုယ်ပိုင် channel မှာ ထည့်ရပါမယ်။ သင့်မှာ channel admin အခွင့်အရေး ရှိရင် bot ကို ထည့်လို့ရပါတယ်။

### အဆင့် ၂ — Bot မှာ Channel သတ်မှတ်ပါ

Bot ကို ဖွင့်ပြီး (admin account နဲ့) ဒီလို ရိုက်ပါ:

```
setchannel: @your_channel_username
```

ဥပမာ — `setchannel: @kocho_mobile`

(Channel က private ဖြစ်ရင် `setchannel: -1001234567890` ဆိုပြီး channel ID ထည့်ပါ)

### အဆင့် ၃ — Post ပို့ပါ

Bot မှာ ဒီလို ရိုက်ပါ:

```
post: 🛒 ဖုန်းဈေးနှုန်းတွေ ကြည့်ရန် / မှာယူရန် ဒီကို နှိပ်ပါ 👇
```

ဒါဆို bot က channel မှာ button ၂ ခုပါတဲ့ message ကို post ပေးပါမယ်:
- 🛒 ဈေးနှုန်းကြည့်ရန် / မှာယူရန်
- 📱 Mini App ဖွင့်ရန်

### အဆင့် ၄ — Admin Menu ကနေ လုပ်လို့လည်း ရပါတယ်

Bot မှာ `/admin` ရိုက်ပြီး **📣 Post to Channel** button ကို နှိပ်လို့လည်း ရပါတယ်။

---

## 🎯 နည်းလမ်း ၃ — Broadcast (Bot ဖွင့်ပြီးသားသူတွေဆီ ပို့ခြင်း)

Bot ကို Start လုပ်ပြီးသား user တွေဆီ admin ကနေ broadcast ပို့လို့ရပါတယ်:

```
broadcast: သင့်စာသား
```

> 💡 ဒါပေမယ့် channel subscriber တွေ bot ကို မဖွင့်ရသေးရင် broadcast မရောက်ပါဘူး။ ဒါကြောင့် နည်းလမ်း ၁/၂ နဲ့ အရင်ဆွဲခေါ်ဖို့ လိုပါတယ်။

---

## 📌 အကြံပြုချက်

1. **နည်းလမ်း ၁ + ၂ ကို တွဲသုံးပါ** — Channel မှာ pin လုပ်ထားတဲ့ post + button ပါတဲ့ post
2. **Channel description** မှာ bot link ထည့်ပါ
3. **Channel ရဲ့ pinned message** ကို bot link ထားပါ
4. Subscriber တွေ bot ဖွင့်ပြီးရင် **broadcast** နဲ့ ဈေးနှုန်းအသစ်တွေ ပို့ပါ

---

## 🔗 Link များ

- **Bot**: https://t.me/kocho_mobile_service_bot
- **Mini App**: https://kocho-mobile-bot.onrender.com/miniapp
- **Admin Panel**: https://kocho-mobile-bot.onrender.com/admin (Password: `kocho2024`)
