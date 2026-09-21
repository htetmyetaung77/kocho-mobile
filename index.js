require("dotenv").config();
const express = require("express");
const path = require("path");
const { Bot, InlineKeyboard, InputFile } = require("grammy");
const Database = require("better-sqlite3");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = String(process.env.ADMIN_ID || "").trim();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = process.env.PUBLIC_URL || "";
const BOT_USERNAME = process.env.BOT_USERNAME || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kocho2024";
const CHANNEL_ID = process.env.CHANNEL_ID || ""; // e.g. @kocho_channel or -1001234567890

if (!TOKEN || TOKEN === "PASTE_NEW_BOT_TOKEN_HERE") {
  console.error("BOT_TOKEN is missing. Put your NEW token in .env / Render Variables.");
  process.exit(1);
}

const bot = new Bot(TOKEN);
const db = new Database("bot.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'Other',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name TEXT,
  price INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  detail TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stock_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  product_name TEXT,
  change INTEGER,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);
`);

// ---- Settings helpers ----
function getSetting(key, fallback = "") {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
    return row ? row.value : fallback;
  } catch (e) { return fallback; }
}
function setSetting(key, value) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, String(value));
}
function getChannelId() { return getSetting("channel_id", CHANNEL_ID); }

// ---------------------------------------------------------------------------
// PRODUCT CATALOG  (Ko Cho Mobile)
// ---------------------------------------------------------------------------
const CATALOG = [
  ["iPhone & Accessories", "iPhone 16 Pro Max 256Gb VC/A", "Canada Region • BT 94% • Black Titanium • ဘူးစုံ", 4600000],
  ["iPhone & Accessories", "iPhone 16 Pro 128Gb ZP/A", "BT 97% • Black Titanium • ဘူးစုံ", 3950000],
  ["iPhone & Accessories", "iPhone 16 128Gb HN/A", "BT 89% • Blue • Ph Only • Warranty 2 months left", 3100000],
  ["iPhone & Accessories", "iPhone 15 Plus 128Gb CH/A", "BT 87% • Pink • Original အလုံး ဘူးစုံ", 2950000],
  ["iPhone & Accessories", "iPhone 15 256Gb ZP/A", "BT 91% • Yellow • ဘူးစုံ", 3100000],
  ["iPhone & Accessories", "iPhone 15 128Gb ZP/A", "BT 89% • Blue • ဘူးစုံ • Warranty 6 months left", 2850000],
  ["iPhone & Accessories", "iPhone 15 256Gb ZP/A", "BT 92% • Green • ဘူးစုံ", 3100000],
  ["iPhone & Accessories", "iPhone 11 Pro Max 256Gb KH/A", "BT 91% • Green • ဘူးစုံ", 1400000],
  ["iPhone & Accessories", "iPhone 11 Pro 256Gb KH/A", "BT 92% • Gray • ဘူးစုံ", 1250000],
  ["iPhone & Accessories", "iPhone 11 Pro 64Gb ZP/A", "BT 90% • Green • ဘူးစုံ", 1050000],
  ["iPhone & Accessories", "iPhone 11 128Gb ZP/A", "BT 86% • Black • ဘူးစုံ", 950000],
  ["iPhone & Accessories", "iPhone 11 64Gb ZD/A", "BT 93% • Black • ဘူးစုံ", 850000],

  ["Xiaomi & Redmi", "Xiaomi 17 Pro 16/512Gb", "Green • Ph Only", 2800000],
  ["Xiaomi & Redmi", "Redmi K80 Ultra 12/256Gb", "White • Ph Only", 1450000],
  ["Xiaomi & Redmi", "Redmi K70 Pro 12/256Gb", "Black • Ph Only", 1030000],
  ["Xiaomi & Redmi", "Redmi Turbo 5 Max 12/256Gb", "Black • Ph Only", 1550000],
  ["Xiaomi & Redmi", "Redmi Turbo 4 12/256Gb", "White • Ph Only", 1050000],
  ["Xiaomi & Redmi", "Redmi Turbo 4 12/256Gb", "Blue • Ph Only", 1050000],
  ["Xiaomi & Redmi", "Xiaomi Civi 5 Pro 12/256Gb", "Purple • Phone Only", 1530000],
  ["Xiaomi & Redmi", "Mi 13T 8/256Gb", "Blue • Ph Only", 1050000],
  ["Xiaomi & Redmi", "Xiaomi Civi 4 Pro 12/256Gb", "Green • Ph Only", 1080000],
  ["Xiaomi & Redmi", "Xiaomi Civi 3 12/256Gb", "Gray • Ph Only", 900000],
  ["Xiaomi & Redmi", "Redmi Note 15 Pro 8/256Gb", "Blue • ဘူးစုံ", 1050000],
  ["Xiaomi & Redmi", "Redmi Note 15 Pro 8/256Gb", "Purple • ဘူးစုံ", 1050000],
  ["Xiaomi & Redmi", "Redmi Note 15 Pro 8/256Gb", "White • ဘူးစုံ", 1050000],
  ["Xiaomi & Redmi", "Redmi Note 15 Pro 8/256Gb", "Black • Ph Only", 970000],
  ["Xiaomi & Redmi", "Redmi Note 15 8/256Gb", "Black • Official Global • ဘူးစုံ", 890000],
  ["Xiaomi & Redmi", "Redmi Note 15 8/128Gb", "Black • Phone Only", 750000],
  ["Xiaomi & Redmi", "Redmi Note 14 Pro Plus 12/256Gb", "White • Ph Only", 900000],
  ["Xiaomi & Redmi", "Redmi 17 4/128Gb", "Black • ပါကင်ဖောက်စစ် • Warranty Full", 830000],
  ["Xiaomi & Redmi", "Redmi Note 13 Pro Plus 8/256Gb", "Black • ဘူးစုံ Global", 950000],
  ["Xiaomi & Redmi", "Redmi Note 13 Pro Plus 5G 8/256Gb", "Black • Ph Only", 880000],
  ["Xiaomi & Redmi", "Redmi Note 13 Pro Plus 12/256Gb", "Black • Ph Only", 850000],
  ["Xiaomi & Redmi", "Redmi Note 14 Pro 8/128Gb", "Black • Ph Only", 770000],
  ["Xiaomi & Redmi", "Redmi Note 14 Pro 8/256Gb", "Green • Ph Only", 820000],
  ["Xiaomi & Redmi", "Redmi Note 14 Pro 8/256Gb", "White • Ph Only", 820000],
  ["Xiaomi & Redmi", "Redmi Note 14 Pro 12/256Gb", "Black • Ph Only", 850000],
  ["Xiaomi & Redmi", "Redmi Note 11 5G 6/128Gb", "Gray • Ph Only", 380000],
  ["Xiaomi & Redmi", "Redmi Pad 2 6/128Gb", "Gray • Box Only", 0],

  ["Oppo", "Oppo Reno 10 8/256Gb", "Blue • Ph Only", 890000],
  ["Oppo", "Oppo Reno 12F 8/256Gb", "Black • Ph Only", 850000],
  ["Oppo", "Oppo A38 4/128Gb", "Yellow • Ph Only", 430000],
  ["Oppo", "Oppo A6X 4/64Gb", "ဘူးစုံ • Warranty 7 months left", 530000],
  ["Oppo", "Oppo F19 Pro 8/128Gb", "Gray • Ph Only", 280000],
  ["Oppo", "Oppo A16 4/64Gb", "Gray • Ph Only", 310000],
  ["Oppo", "Oppo A18 4/64Gb", "Blue • Ph Only", 360000],
  ["Oppo", "Oppo A16 3/32Gb", "Blue • Phone Only", 260000],
  ["Oppo", "Oppo A16 3/32Gb", "Blue • Phone Only", 250000],
  ["Oppo", "Oppo A17k 3/64Gb", "Blue • Ph Only", 260000],

  ["Vivo", "Vivo Y300 Pro 12/256Gb", "Blue • Ph Only", 880000],
  ["Vivo", "Vivo V29E 8/256Gb", "Green • Phone Only", 690000],
  ["Vivo", "Vivo Y100 8/256Gb", "Green • Ph Only", 680000],
  ["Vivo", "Vivo S17 12/512Gb", "Black • Phone Only", 850000],

  ["Huawei & Honor", "Honor 200 12/512Gb", "Blue • Ph Only China", 1120000],
  ["Huawei & Honor", "Huawei Nova 11 8/256Gb", "Black • Ph Only", 750000],
  ["Huawei & Honor", "Huawei Mate Pad SE 4/128Gb", "Black • Sim ရ • Pad Only", 520000],

  ["Samsung", "Samsung A06 4/64Gb", "Blue • Ph Only", 350000],

  ["Realme", "Realme Note 60X 3/64Gb", "Blue • Ph Only • အလင်းပေါက်", 250000],

  ["Tecno & Infinix", "Tecno Camon 40 Pro 8/256Gb", "Gray • Ph Only", 795000],
  ["Tecno & Infinix", "Tecno Spark Go 2024 4/128Gb", "Blue • Ph Only", 330000],
  ["Tecno & Infinix", "Tecno Spark Go 2023 3/64Gb", "Blue • Ph Only", 250000],
  ["Tecno & Infinix", "Itel S25 Ultra 8/256Gb", "Ph Only", 650000],
  ["Tecno & Infinix", "Infinix Smart 9 3/128Gb", "Blue • Ph Only", 330000],
  ["Tecno & Infinix", "Itel S23 4/128Gb", "White • Ph Only", 350000],
  ["Tecno & Infinix", "Itel A90 3/64Gb", "Black • Ph Only", 290000],

  ["ROG", "ROG 8 Pro 16/512Gb", "Black • Charger Only", 2450000],
];

const seed = db.prepare("SELECT COUNT(*) AS c FROM products").get();
if (seed.c === 0) {
  const add = db.prepare(
    "INSERT INTO products (category, name, description, price, stock) VALUES (?, ?, ?, ?, ?)"
  );
  const tx = db.transaction((rows) => {
    for (const [category, name, description, price] of rows) add.run(category, name, description, price, 1);
  });
  tx(CATALOG);
  console.log(`Seeded ${CATALOG.length} products.`);
}

// ---------------------------------------------------------------------------
// SHOP INFO
// ---------------------------------------------------------------------------
const SHOP_INFO = `🏪 𝗞𝗼 𝗖𝗵𝗼 𝗠𝗼𝗯𝗶𝗹𝗲 (𝗚𝗼𝗼𝗱 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 𝗠𝗼𝗯𝗶𝗹𝗲 𝗦𝗵𝗼𝗽)

"ဝယ်ရင်စိတ်ချရပြီး… ရောင်းရင်ဈေးကောင်းရမယ့်ဆိုင်"

📱 ဖုန်းတလုံးရှိရုံနဲ့… အခက်အခဲတချို့ကို "အလွယ်တကူ" ဖြေရှင်းနိုင်ပါတယ်။

ငွေလိုနေပြီလား…?
ဖုန်းအသစ်ပြောင်းချင်လား…?
အသုံးမလိုတော့တဲ့ဖုန်းကို ဈေးကောင်းကောင်းနဲ့ ပြန်ရောင်းချင်လား…?

👉 "𝗞𝗼 𝗖𝗵𝗼 𝗠𝗼𝗯𝗶𝗹𝗲" ကိုသာလာခဲ့ပါ။

━━━━━━━━━━━

✅ 𝗣𝗵𝗼𝗻𝗲 / 𝗟𝗮𝗽𝘁𝗼𝗽 / 𝗢𝘁𝗵𝗲𝗿 𝗗𝗲𝘃𝗶𝗰𝗲𝘀
🔹 ရောင်းမလား / ဝယ်မလား / ပေါင်မလား / အနိမ့်အမြင့်ချိန်းမလား
👉 အားလုံးအဆင်ပြေအောင် ဆောင်ရွက်ပေးပါတယ်။

✅ အရစ်ကျလိုချင်သူများအတွက်
💳 မဟာဘောဂအရစ်ကျ
💳 𝗖𝗕 𝗕𝗮𝗻𝗸 / 𝗔𝗬𝗔 𝗕𝗮𝗻𝗸 𝗖𝗿𝗲𝗱𝗶𝘁 𝗖𝗮𝗿𝗱

━━━━━━━━━━━━━━━━━━━━

🔸 ပြန်ရောင်းချင်တဲ့ဖုန်းတွေကို "ဈေးမနှိမ်ပဲ" 𝗦𝗲𝗰𝗼𝗻𝗱 𝗠𝗮𝗿𝗸𝗲𝘁 ပေါက်ဈေးအတိုင်း 10% လျော့ပြီး ပြန်ဝယ်ပေးပါတယ်။
🔸 𝗠𝗼𝗱𝗲𝗹 အနိမ့် / အမြင့် မရွေးဝယ်ယူပါတယ်။
🔸 𝗣𝗵𝗼𝗻𝗲 အားလုံးကို 𝗘𝗿𝗿𝗼𝗿 ၁ ပတ်တိတိ တာဝန်ယူပေးပါတယ်။ ✅
🔸 ဥပဒေနဲ့မကင်းလွတ်တဲ့ ဖုန်းများကို လုံးဝမဝယ်ပါ။ 🚫

━━━━━━━━━━━━━━━━━━━━

🚚 နယ်ဝယ်ယူသူများအတွက် 𝗠𝗚𝗟 / 𝗥𝗼𝘆𝗮𝗹 𝗘𝘅𝗽𝗿𝗲𝘀𝘀 ဖြင့် အိမ်အရောက် အမြန်ပို့ဆောင်ပေးပါတယ်။`;

const CONTACT_INFO = `📌 𝗣𝗮𝗴𝗲 / 𝗠𝗮𝗽 / 𝗠𝗲𝘀𝘀𝗲𝗻𝗴𝗲𝗿

🌐 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗣𝗮𝗴𝗲
https://www.facebook.com/Rinooo00

📍 𝗚𝗼𝗼𝗴𝗹𝗲 𝗠𝗮𝗽
https://maps.app.goo.gl/gC1GB5WLWMwjYsuX8

💌 𝗩𝗶𝗯𝗲𝗿
viber.me/959779944100

📢 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 𝗖𝗵𝗮𝗻𝗻𝗲𝗹
https://t.me/kochomobile

━━━━━━━━━━━━━━━━━━━━

📱 𝗣𝗵 – 09779944100

🏠 အမှတ် 112/F ၊ မြေညီထပ် သမိုင်းဘူတာရုံလမ်း ၊ သမိုင်းလမ်းဆုံ ၊ City Mart အနီး။`;

const PAYMENT_INFO = `💳 𝗣𝗮𝘆𝗺𝗲𝗻𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻

ငွေလွှဲရန် အောက်ပါ နည်းလမ်းများကို အသုံးပြုနိုင်ပါတယ် 👇

🏦 𝗞𝗕𝗭 𝗕𝗮𝗻𝗸
   အကောင့်: 09779944100 (Ko Cho Mobile)

🏦 𝗪𝗮𝘃𝗲 𝗠𝗼𝗻𝗲𝘆
   ဖုန်း: 09779944100

🏦 𝗔𝗬𝗔 𝗕𝗮𝗻𝗸
   အကောင့်: 09779944100

💳 𝗖𝗿𝗲𝗱𝗶𝘁 𝗖𝗮𝗿𝗱 အရစ်ကျ
   𝗖𝗕 𝗕𝗮𝗻𝗸 / 𝗔𝗬𝗔 𝗕𝗮𝗻𝗸 / မဟာဘောဂ

━━━━━━━━━━━━━━━━━━━━

📌 ငွေလွှဲပြီးပါက ငွေလွှဲပြေစာ (Screenshot) ကို ဒီ Bot ဆီ ပို့ပေးပါ။
Admin မှ အတည်ပြုပြီး Order ကို ဆက်လက် ဆောင်ရွက်ပေးပါမည်။

📞 ဆက်သွယ်ရန်: 09779944100`;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function saveUser(ctx) {
  const u = ctx.from;
  db.prepare(`
    INSERT INTO users (id, username, first_name) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET username=excluded.username, first_name=excluded.first_name
  `).run(u.id, u.username || "", u.first_name || "");
}

function isAdmin(ctx) { return ADMIN_ID && String(ctx.from.id) === ADMIN_ID; }

function money(n) {
  if (!n || Number(n) === 0) return "စျေးနှုန်း မေးမြန်းပါ";
  return Number(n).toLocaleString("en-US") + " MMK";
}

function mainMenu() {
  return new InlineKeyboard()
    .text("📱 ဖုန်းစျေးနှုန်းများ", "shop").text("🔍 ရှာဖွေရန်", "search").row()
    .text("🔄 ရောင်း/ပေါင်/ချိန်း", "sell").text("💳 ငွေလွှဲနည်း", "payment").row()
    .text("🏪 ဆိုင်အကြောင်း", "about").text("📞 ဆက်သွယ်ရန်", "contact").row()
    .text("🤖 AI အကူအညီ", "ai").text("🆘 Help", "help");
}

function adminMenu() {
  return new InlineKeyboard()
    .text("📊 Statistics", "stats").text("📱 Products", "admin_products").row()
    .text("➕ Add Product", "admin_add").text("📦 Stock In/Out", "admin_stock").row()
    .text("📈 Orders", "admin_orders").text("📥 Requests", "admin_requests").row()
    .text("👥 Users", "users").text("📢 Broadcast", "broadcast").row()
    .text("📣 Post to Channel", "post_channel").row()
    .text("⚙️ Settings", "settings").row()
    .text("🏠 Main Menu", "home");
}

function categoryMenu() {
  const cats = db.prepare("SELECT DISTINCT category FROM products WHERE active=1 ORDER BY category").all();
  const kb = new InlineKeyboard();
  let i = 0;
  for (const c of cats) {
    kb.text(c.category, `cat:${c.category}`);
    i++;
    if (i % 2 === 0) kb.row();
  }
  if (i % 2 !== 0) kb.row();
  kb.text("🏠 Main Menu", "home");
  return kb;
}

async function showShop(ctx, edit = false) {
  const text = "📱 **ဖုန်းစျေးနှုန်းများ**\n\nကြည့်လိုသော အမျိုးအစားကို ရွေးပါ 👇";
  if (edit) {
    try { return await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: categoryMenu() }); } catch (e) {}
  }
  await ctx.reply(text, { parse_mode: "Markdown", reply_markup: categoryMenu() });
}

async function showCategory(ctx, category) {
  const products = db.prepare("SELECT * FROM products WHERE category=? AND active=1 ORDER BY id").all(category);
  if (!products.length) return ctx.reply("ဤအမျိုးအစားတွင် Product မရှိပါ။");
  const kb = new InlineKeyboard();
  for (const p of products) kb.text(`${p.name} — ${money(p.price)}`, `product:${p.id}`).row();
  kb.text("⬅️ အမျိုးအစားများ", "shop").row().text("🏠 Main Menu", "home");
  await ctx.reply(`📱 **${category}**\n\nProduct ကိုရွေး၍ အသေးစိတ်ကြည့်ပါ 👇`, {
    parse_mode: "Markdown", reply_markup: kb,
  });
}

async function showOrders(ctx) {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 20").all(ctx.from.id);
  if (!rows.length) return ctx.reply("📦 Order မရှိသေးပါ။", { reply_markup: mainMenu() });
  const text = rows.map(o => `#${o.id} • ${o.product_name}\n💰 ${money(o.price)}\n📌 ${o.status}`).join("\n\n");
  await ctx.reply(`📦 My Orders\n\n${text}`, { reply_markup: mainMenu() });
}

// ---------------------------------------------------------------------------
// AI CHAT
// ---------------------------------------------------------------------------
async function aiReply(userText) {
  if (!OPENAI_API_KEY) {
    return (
      "🤖 AI အကူအညီ\n\n" +
      "ကျွန်ုပ်တို့ဆိုင်ရဲ့ ဝန်ဆောင်မှုများအကြောင်း မေးမြန်းနိုင်ပါတယ်:\n" +
      "• ဖုန်းစျေးနှုန်းများ → /shop\n" +
      "• ရောင်း/ပေါင်/ချိန်း → Menu မှ ရွေးပါ\n" +
      "• ငွေလွှဲနည်း → /payment\n" +
      "• ဆက်သွယ်ရန် → /contact\n\n" +
      "(AI ကို အပြည့်အဝ အသုံးပြုရန် OPENAI_API_KEY ထည့်သွင်းပါ)"
    );
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful customer service assistant for 'Ko Cho Mobile', a phone shop in Myanmar. Answer in Burmese (Myanmar language) politely and concisely. Help with phone prices, buying, selling, pawning, trade-in, installment plans, and delivery." },
          { role: "user", content: userText },
        ],
        max_tokens: 500,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "AI မှ ပြန်လည်ဖြေကြားနိုင်ခြင်း မရှိပါ။";
  } catch (e) {
    return "AI ချိတ်ဆက်မှု အဆင်မပြေပါ။ နောက်မှ ပြန်စမ်းပါ။";
  }
}

// ---------------------------------------------------------------------------
// STATE (in-memory)
// ---------------------------------------------------------------------------
const pendingSearch = new Set();
const pendingRequest = new Map(); // userId -> type
const adminState = new Map();     // userId -> { action, data }

// ---------------------------------------------------------------------------
// COMMANDS
// ---------------------------------------------------------------------------
bot.command("start", async ctx => {
  saveUser(ctx);
  const payload = (ctx.match || "").trim();
  const caption =
    `👋 မင်္ဂလာပါ ${ctx.from.first_name || ""}!\n\n` +
    `🏪 𝗞𝗼 𝗖𝗵𝗼 𝗠𝗼𝗯𝗶𝗹𝗲 (𝗚𝗼𝗼𝗱 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 𝗠𝗼𝗯𝗶𝗹𝗲 𝗦𝗵𝗼𝗽) မှ ကြိုဆိုပါတယ်။\n\n` +
    `📱 ဖုန်းစျေးနှုန်းများ၊ အရောင်းအဝယ် ဝန်ဆောင်မှုများကို အောက်က Menu ကနေ ရွေးချယ်ကြည့်ရှုနိုင်ပါတယ်။`;
  try {
    await ctx.replyWithPhoto(new InputFile(path.join(__dirname, "public", "logo.png")), {
      caption, reply_markup: mainMenu(),
    });
  } catch (e) {
    await ctx.reply(caption, { reply_markup: mainMenu() });
  }
  // Deep-link: /start shop -> open the shop directly
  if (payload === "shop") {
    try { await showShop(ctx); } catch (e) {}
  }
});

bot.command("help", async ctx => {
  saveUser(ctx);
  await ctx.reply(
    "🆘 Commands\n/start — Main Menu\n/shop — ဖုန်းစျေးနှုန်းများ\n/search — ရှာဖွေရန်\n/orders — My Orders\n/payment — ငွေလွှဲနည်း\n/contact — ဆက်သွယ်ရန်\n/admin — Admin Panel"
  );
});

bot.command("shop", async ctx => { saveUser(ctx); await showShop(ctx); });
bot.command("orders", async ctx => { saveUser(ctx); await showOrders(ctx); });
bot.command("payment", async ctx => { saveUser(ctx); await ctx.reply(PAYMENT_INFO, { reply_markup: mainMenu() }); });
bot.command("contact", async ctx => { saveUser(ctx); await ctx.reply(CONTACT_INFO, { reply_markup: mainMenu() }); });

bot.command("search", async ctx => {
  saveUser(ctx);
  pendingSearch.add(ctx.from.id);
  await ctx.reply("🔍 ရှာလိုသော ဖုန်း Model ကို ရိုက်ထည့်ပါ။\nဥပမာ — iPhone 15, Redmi Note 14, Oppo");
});

bot.command("admin", async ctx => {
  saveUser(ctx);
  if (!isAdmin(ctx)) return ctx.reply("⛔ Admin only.");
  await ctx.reply("🔐 Admin Panel", { reply_markup: adminMenu() });
});

// ---- /post : post a promotional message with buttons to the channel ----
bot.command("post", async ctx => {
  saveUser(ctx);
  if (!isAdmin(ctx)) return ctx.reply("⛔ Admin only.");
  const ch = getChannelId();
  if (!ch) {
    return ctx.reply(
      "⚠️ Channel ID မသတ်မှတ်ရသေးပါ။\n\n" +
      "Channel သတ်မှတ်ရန် ဒီလို ရိုက်ပါ:\n" +
      "`setchannel: @your_channel`\n\n" +
      "သို့မဟုတ် `setchannel: -1001234567890`\n\n" +
      "(Bot ကို channel မှာ Admin ထည့်ထားဖို့ လိုပါတယ်)",
      { parse_mode: "Markdown", reply_markup: adminMenu() }
    );
  }
  await ctx.reply(
    "📢 Channel မှာ ပို့မယ့် စာသားကို ရိုက်ပါ:\n\n" +
    "ဥပမာ — `post: 🛒 ဖုန်းဈေးနှုန်းတွေ ကြည့်ရန် ဒီကို နှိပ်ပါ`\n\n" +
    "ပို့လိုက်ရင် button ပါတဲ့ message ကို channel မှာ post ပေးပါမယ်။",
    { parse_mode: "Markdown", reply_markup: adminMenu() }
  );
});

// ---------------------------------------------------------------------------
// CALLBACKS — CUSTOMER
// ---------------------------------------------------------------------------
bot.callbackQuery("home", async ctx => {
  await ctx.answerCallbackQuery();
  try { await ctx.editMessageText("🏠 Main Menu", { reply_markup: mainMenu() }); }
  catch (e) { await ctx.reply("🏠 Main Menu", { reply_markup: mainMenu() }); }
});

bot.callbackQuery("shop", async ctx => { await ctx.answerCallbackQuery(); await showShop(ctx, true); });

bot.callbackQuery(/^cat:(.+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  await showCategory(ctx, ctx.match[1]);
});

bot.callbackQuery("search", async ctx => {
  await ctx.answerCallbackQuery();
  pendingSearch.add(ctx.from.id);
  await ctx.reply("🔍 ရှာလိုသော ဖုန်း Model ကို ရိုက်ထည့်ပါ။\nဥပမာ — iPhone 15, Redmi Note 14, Oppo");
});

bot.callbackQuery(/^product:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=? AND active=1").get(id);
  if (!p) return ctx.reply("Product မတွေ့ပါ။");
  const kb = new InlineKeyboard()
    .text("🛒 Order တင်ရန်", `order:${p.id}`).row()
    .text("⬅️ နောက်သို့", `cat:${p.category}`);
  await ctx.reply(`📱 ${p.name}\n\n${p.description}\n\n💰 စျေးနှုန်း: ${money(p.price)}`, { reply_markup: kb });
});

bot.callbackQuery(/^order:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=? AND active=1").get(id);
  if (!p) return ctx.reply("Product မတွေ့ပါ။");
  const info = db.prepare("INSERT INTO orders (user_id, product_id, product_name, price) VALUES (?,?,?,?)")
    .run(ctx.from.id, p.id, p.name, p.price);
  const kb = new InlineKeyboard().text("💳 ငွေလွှဲနည်း", "payment").row().text("🏠 Main Menu", "home");
  await ctx.reply(
    `✅ Order တင်ပြီးပါပြီ!\n\n🧾 Order ID: #${info.lastInsertRowid}\n📱 ${p.name}\n💰 ${money(p.price)}\n\n` +
    `ငွေလွှဲရန် "💳 ငွေလွှဲနည်း" ကိုနှိပ်ပါ။ Admin မှ ဆက်လက်ဆောင်ရွက်ပေးပါမည်။`,
    { reply_markup: kb }
  );
  if (ADMIN_ID) {
    try {
      await bot.api.sendMessage(ADMIN_ID,
        `🔔 New Order #${info.lastInsertRowid}\n👤 ${ctx.from.first_name} (@${ctx.from.username || "no_username"})\n📱 ${p.name}\n💰 ${money(p.price)}`);
    } catch (e) {}
  }
});

bot.callbackQuery("payment", async ctx => { await ctx.answerCallbackQuery(); await ctx.reply(PAYMENT_INFO, { reply_markup: mainMenu() }); });

bot.callbackQuery("sell", async ctx => {
  await ctx.answerCallbackQuery();
  const kb = new InlineKeyboard()
    .text("💰 ရောင်းချင်သည်", "req:sell").row()
    .text("🔒 ပေါင်ချင်သည်", "req:pawn").row()
    .text("🔄 အမြင့်ချိန်းချင်သည်", "req:tradein").row()
    .text("🏠 Main Menu", "home");
  await ctx.reply("🔄 **ရောင်း / ပေါင် / ချိန်း ဝန်ဆောင်မှု**\n\nသင်လိုချင်တာကို ရွေးပါ 👇", {
    parse_mode: "Markdown", reply_markup: kb,
  });
});

bot.callbackQuery(/^req:(sell|pawn|tradein)$/, async ctx => {
  await ctx.answerCallbackQuery();
  const type = ctx.match[1];
  pendingRequest.set(ctx.from.id, type);
  const label = { sell: "ရောင်းချခြင်း", pawn: "ပေါင်ချခြင်း", tradein: "အမြင့်ချိန်းခြင်း" }[type];
  await ctx.reply(
    `📝 **${label}**\n\nသင့်ဖုန်းအချက်အလက်ကို အောက်ပါ format ဖြင့် ရိုက်ထည့်ပါ:\n\n` +
    `Model / Storage / အခြေအနေ / စျေးနှုန်း\n\nဥပမာ — iPhone 13 128Gb, BT 90%, ဘူးစုံ, 1500000`,
    { parse_mode: "Markdown" }
  );
});

bot.callbackQuery("about", async ctx => { await ctx.answerCallbackQuery(); await ctx.reply(SHOP_INFO, { reply_markup: mainMenu() }); });
bot.callbackQuery("contact", async ctx => { await ctx.answerCallbackQuery(); await ctx.reply(CONTACT_INFO, { reply_markup: mainMenu() }); });
bot.callbackQuery("ai", async ctx => {
  await ctx.answerCallbackQuery();
  await ctx.reply("🤖 AI အကူအညီ\n\nမေးချင်တဲ့မေးခွန်းကို message အနေနဲ့ ရိုက်ထည့်ပါ။\nဥပမာ — \"iPhone 15 စျေးဘယ်လောက်လဲ?\"", { reply_markup: mainMenu() });
});
bot.callbackQuery("help", async ctx => { await ctx.answerCallbackQuery(); await ctx.reply("🆘 /start /shop /search /orders /payment /contact /admin", { reply_markup: mainMenu() }); });

// ---------------------------------------------------------------------------
// CALLBACKS — ADMIN
// ---------------------------------------------------------------------------
bot.callbackQuery("stats", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const users = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  const orders = db.prepare("SELECT COUNT(*) c FROM orders").get().c;
  const products = db.prepare("SELECT COUNT(*) c FROM products").get().c;
  const requests = db.prepare("SELECT COUNT(*) c FROM requests").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(price),0) s FROM orders WHERE status!='cancelled'").get().s;
  await ctx.reply(
    `📊 Statistics\n\n👥 Users: ${users}\n📦 Orders: ${orders}\n📥 Requests: ${requests}\n📱 Products: ${products}\n💰 Order Value: ${money(revenue)}`,
    { reply_markup: adminMenu() }
  );
});

// ---- Product list (admin) ----
bot.callbackQuery("admin_products", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const rows = db.prepare("SELECT * FROM products ORDER BY category, id").all();
  const kb = new InlineKeyboard();
  for (const p of rows) {
    kb.text(`${p.active ? "🟢" : "🔴"} ${p.name} — ${money(p.price)} (${p.stock})`, `edit:${p.id}`).row();
  }
  kb.text("➕ Add Product", "admin_add").row().text("⬅️ Admin", "admin_home");
  await ctx.reply(`📱 **Products (${rows.length})**\n\nပြင်လိုသော Product ကို ရွေးပါ 👇`, {
    parse_mode: "Markdown", reply_markup: kb,
  });
});

bot.callbackQuery("admin_home", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  try { await ctx.editMessageText("🔐 Admin Panel", { reply_markup: adminMenu() }); }
  catch (e) { await ctx.reply("🔐 Admin Panel", { reply_markup: adminMenu() }); }
});

// ---- Edit single product ----
bot.callbackQuery(/^edit:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(Number(ctx.match[1]));
  if (!p) return ctx.reply("Product မတွေ့ပါ။");
  const kb = new InlineKeyboard()
    .text("✏️ Name", `ef:name:${p.id}`).text("💰 Price", `ef:price:${p.id}`).row()
    .text("📦 Stock", `ef:stock:${p.id}`).text("📝 Desc", `ef:desc:${p.id}`).row()
    .text("🏷️ Category", `ef:category:${p.id}`).row()
    .text(p.active ? "🔴 Deactivate" : "🟢 Activate", `etoggle:${p.id}`).row()
    .text("🗑️ Delete", `edel:${p.id}`).row()
    .text("⬅️ Products", "admin_products");
  await ctx.reply(
    `📱 **${p.name}**\n\n🏷️ ${p.category}\n📝 ${p.description}\n💰 ${money(p.price)}\n📦 Stock: ${p.stock}\n${p.active ? "🟢 Active" : "🔴 Inactive"}`,
    { parse_mode: "Markdown", reply_markup: kb }
  );
});

bot.callbackQuery(/^ef:(name|price|stock|desc|category):(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const field = ctx.match[1];
  const id = Number(ctx.match[2]);
  adminState.set(ctx.from.id, { action: "edit_field", field, id });
  const prompts = {
    name: "အသစ်ဖြစ်တဲ့ Product Name ကို ရိုက်ထည့်ပါ:",
    price: "အသစ်ဖြစ်တဲ့ စျေးနှုန်း (ဂဏန်းသီးသန့်) ကို ရိုက်ထည့်ပါ:",
    stock: "အသစ်ဖြစ်တဲ့ Stock အရေအတွက် (ဂဏန်း) ကို ရိုက်ထည့်ပါ:",
    desc: "အသစ်ဖြစ်တဲ့ Description ကို ရိုက်ထည့်ပါ:",
    category: "အသစ်ဖြစ်တဲ့ Category ကို ရိုက်ထည့်ပါ:",
  };
  await ctx.reply(`✏️ ${prompts[field]}\n\n(မလုပ်တော့ရင် /cancel ရိုက်ပါ)`);
});

bot.callbackQuery(/^etoggle:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return;
  db.prepare("UPDATE products SET active=? WHERE id=?").run(p.active ? 0 : 1, id);
  await ctx.reply(`✅ ${p.name} ကို ${p.active ? "🔴 Deactivated" : "🟢 Activated"} လုပ်ပြီးပါပြီ။`, { reply_markup: adminMenu() });
});

bot.callbackQuery(/^edel:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return;
  const kb = new InlineKeyboard().text("✅ ဟုတ်ကဲ့ ဖျက်ပါ", `edelok:${id}`).row().text("❌ မဖျက်တော့ပါ", `edit:${id}`);
  await ctx.reply(`🗑️ "${p.name}" ကို ဖျက်မှာ သေချာပါသလား?`, { reply_markup: kb });
});

bot.callbackQuery(/^edelok:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return;
  db.prepare("DELETE FROM products WHERE id=?").run(id);
  await ctx.reply(`✅ "${p.name}" ကို ဖျက်ပြီးပါပြီ။`, { reply_markup: adminMenu() });
});

// ---- Add product flow ----
bot.callbackQuery("admin_add", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  adminState.set(ctx.from.id, { action: "add", step: "category", data: {} });
  await ctx.reply("➕ **Add Product**\n\n1️⃣ Category ကို ရိုက်ထည့်ပါ:\n(ဥပမာ — iPhone & Accessories, Oppo, Vivo)", { parse_mode: "Markdown" });
});

// ---- Stock In/Out flow ----
bot.callbackQuery("admin_stock", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const rows = db.prepare("SELECT * FROM products WHERE active=1 ORDER BY category, id").all();
  const kb = new InlineKeyboard();
  for (const p of rows) kb.text(`${p.name} (${p.stock})`, `stk:${p.id}`).row();
  kb.text("⬅️ Admin", "admin_home");
  await ctx.reply("📦 **Stock In/Out**\n\nပြင်လိုသော Product ကို ရွေးပါ 👇", { parse_mode: "Markdown", reply_markup: kb });
});

bot.callbackQuery(/^stk:(\d+)$/, async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const id = Number(ctx.match[1]);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return;
  adminState.set(ctx.from.id, { action: "stock", id });
  await ctx.reply(
    `📦 **${p.name}**\nလက်ရှိ Stock: ${p.stock}\n\n` +
    `Stock အဝင်/အထွက် ရိုက်ထည့်ပါ:\n` +
    `• အဝင် (ပေါင်း) → ဥပမာ: +5\n` +
    `• အထွက် (နုတ်) → ဥပမာ: -2\n` +
    `• အတိအကျ သတ်မှတ် → ဥပမာ: =10`,
    { parse_mode: "Markdown" }
  );
});

// ---- Orders / Requests / Users / Broadcast / Settings ----
bot.callbackQuery("admin_orders", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 20").all();
  const text = rows.length
    ? rows.map(o => `#${o.id} • User ${o.user_id}\n${o.product_name} • ${money(o.price)} • ${o.status}`).join("\n\n")
    : "No orders";
  await ctx.reply(`📈 Orders\n\n${text}`, { reply_markup: adminMenu() });
});

bot.callbackQuery("admin_requests", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const rows = db.prepare("SELECT * FROM requests ORDER BY id DESC LIMIT 20").all();
  const text = rows.length
    ? rows.map(r => `#${r.id} • ${r.type} • User ${r.user_id}\n${r.detail}`).join("\n\n")
    : "No requests";
  await ctx.reply(`📥 Requests\n\n${text}`, { reply_markup: adminMenu() });
});

bot.callbackQuery("users", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const rows = db.prepare("SELECT id, first_name, username FROM users ORDER BY created_at DESC LIMIT 50").all();
  const text = rows.map(u => `${u.id} • ${u.first_name} • @${u.username || "-"}`).join("\n");
  await ctx.reply(`👥 Users\n\n${text || "No users"}`, { reply_markup: adminMenu() });
});

bot.callbackQuery("broadcast", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  await ctx.reply("📢 Broadcast စာသားကို အောက်ပါ format ဖြင့် ပို့ပါ:\n\nbroadcast: သင့်စာ");
});

bot.callbackQuery("settings", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  await ctx.reply(
    `⚙️ Settings\n\nPUBLIC_URL: ${PUBLIC_URL || "not set"}\nBOT_USERNAME: ${BOT_USERNAME || "not set"}\nCHANNEL_ID: ${getChannelId() || "not set"}\nAI: ${OPENAI_API_KEY ? "configured" : "not configured"}\n\n🌐 Mini App Admin: ${PUBLIC_URL ? PUBLIC_URL + "/admin" : "set PUBLIC_URL"}\n\n📣 Channel သတ်မှတ်ရန်: setchannel: @your_channel`,
    { reply_markup: adminMenu() }
  );
});

bot.callbackQuery("post_channel", async ctx => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) return;
  const ch = getChannelId();
  await ctx.reply(
    `📣 Channel မှာ Promotional Post ပို့ခြင်း\n\n` +
    `လက်ရှိ Channel: ${ch || "⚠️ မသတ်မှတ်ရသေးပါ"}\n\n` +
    `Post ပို့ရန် ဒီလို ရိုက်ပါ:\n` +
    `post: သင့်စာသား\n\n` +
    `Channel သတ်မှတ်ရန်:\n` +
    `setchannel: @your_channel`,
    { reply_markup: adminMenu() }
  );
});

// ---------------------------------------------------------------------------
// TEXT HANDLER
// ---------------------------------------------------------------------------
bot.on("message:text", async ctx => {
  saveUser(ctx);
  const text = ctx.message.text.trim();
  if (text.startsWith("/")) {
    if (text === "/cancel") {
      adminState.delete(ctx.from.id);
      pendingSearch.delete(ctx.from.id);
      pendingRequest.delete(ctx.from.id);
      return ctx.reply("❌ ပယ်ဖျက်ပြီးပါပြီ။", { reply_markup: isAdmin(ctx) ? adminMenu() : mainMenu() });
    }
    return;
  }

  // ---- Admin state machine ----
  if (isAdmin(ctx) && adminState.has(ctx.from.id)) {
    const st = adminState.get(ctx.from.id);

    if (st.action === "edit_field") {
      const { field, id } = st;
      adminState.delete(ctx.from.id);
      if (field === "price" || field === "stock") {
        const num = parseInt(text.replace(/[^0-9-]/g, ""), 10);
        if (isNaN(num)) return ctx.reply("⚠️ ဂဏန်း ရိုက်ထည့်ပါ။", { reply_markup: adminMenu() });
        db.prepare(`UPDATE products SET ${field}=? WHERE id=?`).run(num, id);
      } else {
        db.prepare(`UPDATE products SET ${field}=? WHERE id=?`).run(text, id);
      }
      const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
      return ctx.reply(`✅ ပြင်ပြီးပါပြီ!\n\n📱 ${p.name}\n🏷️ ${p.category}\n📝 ${p.description}\n💰 ${money(p.price)}\n📦 Stock: ${p.stock}`, { reply_markup: adminMenu() });
    }

    if (st.action === "add") {
      const d = st.data;
      if (st.step === "category") {
        d.category = text; st.step = "name";
        return ctx.reply("2️⃣ Product Name ကို ရိုက်ထည့်ပါ:");
      }
      if (st.step === "name") {
        d.name = text; st.step = "desc";
        return ctx.reply("3️⃣ Description ကို ရိုက်ထည့်ပါ:\n(မထည့်လိုရင် - ရိုက်ပါ)");
      }
      if (st.step === "desc") {
        d.description = text === "-" ? "" : text; st.step = "price";
        return ctx.reply("4️⃣ စျေးနှုန်း (ဂဏန်းသီးသန့်) ကို ရိုက်ထည့်ပါ:");
      }
      if (st.step === "price") {
        const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
        if (isNaN(num)) return ctx.reply("⚠️ ဂဏန်း ရိုက်ထည့်ပါ:");
        d.price = num; st.step = "stock";
        return ctx.reply("5️⃣ Stock အရေအတွက် (ဂဏန်း) ကို ရိုက်ထည့်ပါ:");
      }
      if (st.step === "stock") {
        const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
        if (isNaN(num)) return ctx.reply("⚠️ ဂဏန်း ရိုက်ထည့်ပါ:");
        d.stock = num;
        const info = db.prepare("INSERT INTO products (category, name, description, price, stock) VALUES (?,?,?,?,?)")
          .run(d.category, d.name, d.description, d.price, d.stock);
        adminState.delete(ctx.from.id);
        return ctx.reply(
          `✅ Product အသစ် ထည့်ပြီးပါပြီ!\n\n🆔 #${info.lastInsertRowid}\n🏷️ ${d.category}\n📱 ${d.name}\n📝 ${d.description}\n💰 ${money(d.price)}\n📦 Stock: ${d.stock}`,
          { reply_markup: adminMenu() }
        );
      }
    }

    if (st.action === "stock") {
      const id = st.id;
      adminState.delete(ctx.from.id);
      const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
      if (!p) return ctx.reply("Product မတွေ့ပါ။");
      let newStock = p.stock;
      let change = 0;
      if (text.startsWith("+")) { change = parseInt(text.slice(1), 10) || 0; newStock = p.stock + change; }
      else if (text.startsWith("-")) { change = -(parseInt(text.slice(1), 10) || 0); newStock = p.stock + change; }
      else if (text.startsWith("=")) { newStock = parseInt(text.slice(1), 10); change = newStock - p.stock; }
      else { change = parseInt(text, 10) || 0; newStock = p.stock + change; }
      if (isNaN(newStock) || newStock < 0) newStock = 0;
      db.prepare("UPDATE products SET stock=? WHERE id=?").run(newStock, id);
      db.prepare("INSERT INTO stock_log (product_id, product_name, change, note) VALUES (?,?,?,?)")
        .run(id, p.name, change, "bot admin");
      return ctx.reply(`✅ Stock ပြင်ပြီးပါပြီ!\n\n📱 ${p.name}\n📦 ${p.stock} → ${newStock} (${change >= 0 ? "+" : ""}${change})`, { reply_markup: adminMenu() });
    }
  }

  // ---- Admin: set channel ----
  if (isAdmin(ctx) && text.toLowerCase().startsWith("setchannel:")) {
    const ch = text.slice("setchannel:".length).trim();
    if (!ch) return ctx.reply("⚠️ Channel ID ရိုက်ထည့်ပါ။ ဥပမာ — setchannel: @kocho_channel");
    setSetting("channel_id", ch);
    // Try to verify the bot can access the channel
    let verify = "";
    try {
      const chat = await bot.api.getChat(ch);
      verify = `\n✅ Channel: ${chat.title || ch}`;
    } catch (e) {
      verify = `\n⚠️ Channel ကို စစ်လို့မရပါ (${e.message}). Bot ကို channel admin ထည့်ထားပါ။`;
    }
    return ctx.reply(`✅ Channel သတ်မှတ်ပြီးပါပြီ: ${ch}${verify}`, { reply_markup: adminMenu() });
  }

  // ---- Admin: post promo to channel ----
  if (isAdmin(ctx) && text.toLowerCase().startsWith("post:")) {
    const msg = text.slice("post:".length).trim();
    if (!msg) return ctx.reply("⚠️ Post စာသား မရှိပါ။");
    const ch = getChannelId();
    if (!ch) return ctx.reply("⚠️ Channel မသတ်မှတ်ရသေးပါ။ `setchannel: @your_channel` ရိုက်ပါ။", { parse_mode: "Markdown" });
    const kb = new InlineKeyboard()
      .url("🛒 ဈေးနှုန်းကြည့်ရန် / မှာယူရန်", `https://t.me/${BOT_USERNAME || "kocho_mobile_service_bot"}?start=shop`).row()
      .url("📱 Mini App ဖွင့်ရန်", PUBLIC_URL ? `${PUBLIC_URL}/miniapp` : `https://t.me/${BOT_USERNAME || "kocho_mobile_service_bot"}`);
    try {
      await bot.api.sendMessage(ch, msg, { reply_markup: kb });
      return ctx.reply("✅ Channel မှာ post ပို့ပြီးပါပြီ!", { reply_markup: adminMenu() });
    } catch (e) {
      return ctx.reply(`⚠️ Post ပို့လို့မရပါ: ${e.message}\n\nBot ကို channel မှာ Admin (Post Messages) ထည့်ထားပါ။`, { reply_markup: adminMenu() });
    }
  }

  // ---- Admin broadcast ----
  if (isAdmin(ctx) && text.toLowerCase().startsWith("broadcast:")) {
    const msg = text.slice("broadcast:".length).trim();
    if (!msg) return ctx.reply("Broadcast text မရှိပါ။");
    const users = db.prepare("SELECT id FROM users").all();
    let sent = 0;
    for (const u of users) {
      try { await bot.api.sendMessage(u.id, `📢 ${msg}`); sent++; } catch (e) {}
    }
    return ctx.reply(`✅ Broadcast finished.\nSent: ${sent}/${users.length}`);
  }

  // ---- Search mode ----
  if (pendingSearch.has(ctx.from.id)) {
    pendingSearch.delete(ctx.from.id);
    const q = `%${text.toLowerCase()}%`;
    const rows = db.prepare(
      "SELECT * FROM products WHERE active=1 AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?) ORDER BY id LIMIT 20"
    ).all(q, q, q);
    if (!rows.length) {
      return ctx.reply(`🔍 "${text}" အတွက် ရှာဖွေတွေ့ရှိမှု မရှိပါ။\n\nအခြား Model ဖြင့် ပြန်ရှာကြည့်ပါ။`, { reply_markup: mainMenu() });
    }
    const kb = new InlineKeyboard();
    for (const p of rows) kb.text(`${p.name} — ${money(p.price)}`, `product:${p.id}`).row();
    kb.text("🏠 Main Menu", "home");
    return ctx.reply(`🔍 "${text}" အတွက် ရလဒ် ${rows.length} ခု 👇`, { reply_markup: kb });
  }

  // ---- Sell/pawn/trade-in request mode ----
  if (pendingRequest.has(ctx.from.id)) {
    const type = pendingRequest.get(ctx.from.id);
    pendingRequest.delete(ctx.from.id);
    const info = db.prepare("INSERT INTO requests (user_id, type, detail) VALUES (?,?,?)")
      .run(ctx.from.id, type, text);
    await ctx.reply(
      `✅ သင့်တောင်းဆိုချက် လက်ခံရရှိပါပြီ!\n\n🧾 Request ID: #${info.lastInsertRowid}\n📝 ${text}\n\nAdmin မှ မကြာမီ ဆက်သွယ်ပေးပါမည်။`,
      { reply_markup: mainMenu() }
    );
    if (ADMIN_ID) {
      try {
        await bot.api.sendMessage(ADMIN_ID,
          `🔔 New ${type.toUpperCase()} Request #${info.lastInsertRowid}\n👤 ${ctx.from.first_name} (@${ctx.from.username || "no_username"})\n📝 ${text}`);
      } catch (e) {}
    }
    return;
  }

  // ---- Default → AI reply ----
  const reply = await aiReply(text);
  await ctx.reply(reply, { reply_markup: mainMenu() });
});

bot.catch(err => console.error("BOT ERROR:", err.error));

// ---------------------------------------------------------------------------
// HTTP SERVER + ADMIN API
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function adminAuth(req, res, next) {
  const pass = req.headers["x-admin-password"] || req.query.password;
  if (pass !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
}

app.get("/", (_, res) => res.send("Ko Cho Mobile Bot is running ✅"));
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/miniapp", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/admin", (_, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// ---- Public API (for Mini App shop) ----
app.get("/api/products", (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM products WHERE active=1";
  const params = [];
  if (category) { sql += " AND category=?"; params.push(category); }
  if (q) { sql += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)"; params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`); }
  sql += " ORDER BY category, id";
  res.json({ ok: true, products: db.prepare(sql).all(...params) });
});

app.get("/api/categories", (_, res) => {
  res.json({ ok: true, categories: db.prepare("SELECT DISTINCT category FROM products WHERE active=1 ORDER BY category").all().map(r => r.category) });
});

// ---- Admin API ----
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false, error: "wrong password" });
});

app.get("/api/admin/products", adminAuth, (_, res) => {
  res.json({ ok: true, products: db.prepare("SELECT * FROM products ORDER BY category, id").all() });
});

app.post("/api/admin/products", adminAuth, (req, res) => {
  const { category, name, description, price, stock } = req.body || {};
  if (!name) return res.status(400).json({ ok: false, error: "name required" });
  const info = db.prepare("INSERT INTO products (category, name, description, price, stock) VALUES (?,?,?,?,?)")
    .run(category || "Other", name, description || "", Number(price) || 0, Number(stock) || 0);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.put("/api/admin/products/:id", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return res.status(404).json({ ok: false, error: "not found" });
  const { category, name, description, price, stock, active } = req.body || {};
  db.prepare("UPDATE products SET category=?, name=?, description=?, price=?, stock=?, active=? WHERE id=?")
    .run(
      category ?? p.category, name ?? p.name, description ?? p.description,
      price != null ? Number(price) : p.price, stock != null ? Number(stock) : p.stock,
      active != null ? (active ? 1 : 0) : p.active, id
    );
  res.json({ ok: true });
});

app.delete("/api/admin/products/:id", adminAuth, (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/admin/products/:id/stock", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return res.status(404).json({ ok: false, error: "not found" });
  const { change, set } = req.body || {};
  let newStock = p.stock;
  let delta = 0;
  if (set != null) { newStock = Number(set); delta = newStock - p.stock; }
  else { delta = Number(change) || 0; newStock = p.stock + delta; }
  if (newStock < 0) newStock = 0;
  db.prepare("UPDATE products SET stock=? WHERE id=?").run(newStock, id);
  db.prepare("INSERT INTO stock_log (product_id, product_name, change, note) VALUES (?,?,?,?)")
    .run(id, p.name, delta, "miniapp admin");
  res.json({ ok: true, stock: newStock });
});

app.get("/api/admin/stock-log", adminAuth, (_, res) => {
  res.json({ ok: true, log: db.prepare("SELECT * FROM stock_log ORDER BY id DESC LIMIT 100").all() });
});

app.get("/api/admin/orders", adminAuth, (_, res) => {
  res.json({ ok: true, orders: db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 100").all() });
});

app.get("/api/admin/requests", adminAuth, (_, res) => {
  res.json({ ok: true, requests: db.prepare("SELECT * FROM requests ORDER BY id DESC LIMIT 100").all() });
});

app.get("/api/admin/stats", adminAuth, (_, res) => {
  res.json({
    ok: true,
    stats: {
      users: db.prepare("SELECT COUNT(*) c FROM users").get().c,
      orders: db.prepare("SELECT COUNT(*) c FROM orders").get().c,
      products: db.prepare("SELECT COUNT(*) c FROM products").get().c,
      requests: db.prepare("SELECT COUNT(*) c FROM requests").get().c,
      revenue: db.prepare("SELECT COALESCE(SUM(price),0) s FROM orders WHERE status!='cancelled'").get().s,
    },
  });
});

app.listen(PORT, () => console.log(`HTTP server running on ${PORT}`));

// ---- Self-ping to prevent Render free-tier spin-down ----
if (PUBLIC_URL && /^https?:\/\//.test(PUBLIC_URL)) {
  const pingUrl = PUBLIC_URL.replace(/\/$/, "") + "/health";
  setInterval(() => {
    fetch(pingUrl).then(r => console.log(`[self-ping] ${pingUrl} -> ${r.status}`))
      .catch(e => console.log(`[self-ping] failed: ${e.message}`));
  }, 10 * 60 * 1000); // every 10 minutes
  console.log(`Self-ping enabled: ${pingUrl} (every 10 min)`);
}

bot.start({ onStart: info => console.log(`Bot started: @${info.username}`) });
