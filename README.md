# Zoom ယောဂီစာရင်း — Yogi Management System 

Cloudflare Workers + D1 ပေါ်တွင် အလုပ်လုပ်သော ယောဂီများ (ကမ္မဋ္ဌာန်းအဆင့် ၇ ဆင့်) စီမံခန့်ခွဲရေးစနစ်။

## 📁 ဖိုင်ဖွဲ့စည်းပုံ

```
worker.js          → Cloudflare Worker API (backend, D1 database ကို ချိတ်ဆက်သည်)
wrangler.toml       → Worker deploy configuration
schema.sql          → D1 database schema + login user 11 ဦး seed data
public/              → Frontend (static website — Cloudflare Pages / GitHub Pages မည်သည့်နေရာမဆို host လုပ်နိုင်သည်)
  ├── index.html
  ├── css/style.css
  └── js/ (config.js, api.js, auth.js, app.js, yogi.js, leaders.js, dashboard.js)
```

## 🚀 Deploy လုပ်နည်း (အဆင့်ဆင့်)

### 1) Worker (Backend API) ကို Deploy လုပ်ခြင်း

သင့်ကွန်ပျူတာတွင် (Node.js ရှိရမည်):

```bash
npm install -g wrangler
wrangler login
```

`wrangler.toml` ဖိုင်ထဲက `database_id` ကို သင့် D1 database ID (Cloudflare dashboard → D1 → yogi → Database ID) နှင့် အစားထိုးပါ။
စကရင်ရှော့(screenshot) ထဲတွင် database ID = `edd63c93-0495-45bd-9877-bae360fa2f83` ပေါ်နေသည်ကို တွေ့ရသည် — ဒီတစ်ခုပဲ ဆိုရင် အောက်ပါအတိုင်း ပြင်ပါ:

```toml
database_id = "edd63c93-0495-45bd-9877-bae360fa2f83"
```

Database ထဲ table များ တည်ဆောက်ရန် (D1 က "ဘာဒေတာမှ မတည်ဆောက်ရသေးပါ" ဆိုတဲ့ screenshot အတိုင်း ယခု တည်ဆောက်ပေးရမည်):

```bash
wrangler d1 execute yogi --remote --file=./schema.sql
```

Login token ကို လုံခြုံစွာ sign ဖို့ secret သတ်မှတ်ပါ (မဖြစ်မနေ လုပ်ပါ):

```bash
wrangler secret put AUTH_SECRET
# ‑ prompt တက်လာလျှင် ကြိုက်ရာ password/random string တစ်ခု ရိုက်ထည့်ပါ (ဥပမာ - 32-char random string)
```

နောက်ဆုံး Worker ကို Deploy လုပ်ပါ:

```bash
wrangler deploy
```

Deploy ပြီးလျှင် သင့် Worker URL ရလိမ့်မည် (ဥပမာ `https://yogi-list.<your-subdomain>.workers.dev`).

### 2) Frontend (public/) ကို Deploy လုပ်ခြင်း

`public/js/config.js` ဖိုင်ထဲ `getApiUrl()` အောက်ရှိ Worker URL ကို အထက်တွင် ရရှိသော Worker URL အမှန်ဖြင့် အစားထိုးပါ:

```js
return localStorage.getItem("prod_api_url") || "https://yogi-list.YOUR-SUBDOMAIN.workers.dev";
```

ပြီးရင် `public/` ဖိုင်တွဲထဲက ဖိုင်အားလုံး (index.html, css/, js/) ကို:

- **Cloudflare Pages** (အလွယ်ဆုံး, အခမဲ့) — Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets → `public` folder တင်ပါ, or
- GitHub repo (Non005/Yogi-List) root ထဲ push လုပ်ပြီး GitHub Pages ဖွင့်ပါ, or
- မည်သည့် static hosting မဆို (Netlify, Vercel စသည်)

## 🔑 Login အချက်အလက်များ (Default — Login ဝင်ပြီးလျှင် ပြောင်းလဲရန် အကြံပြုသည်)

| User | Password |
|---|---|
| Admin | Admin@2026 |
| ဓမ္မဝန်ဆောင် ၁ | Yogi@12026 |
| ဓမ္မဝန်ဆောင် ၂ | Yogi@22026 |
| ဓမ္မဝန်ဆောင် ၃ | Yogi@32026 |
| ဓမ္မဝန်ဆောင် ၄ | Yogi@42026 |
| ဓမ္မဝန်ဆောင် ၅ | Yogi@52026 |
| ဓမ္မဝန်ဆောင် ၆ | Yogi@62026 |
| ဓမ္မဝန်ဆောင် ၇ | Yogi@72026 |
| ဓမ္မဝန်ဆောင် ၈ | Yogi@82026 |
| ဓမ္မဝန်ဆောင် ၉ | Yogi@92026 |
| ဓမ္မဝန်ဆောင် ၁၀ | Yogi@102026 |

Login ဝင်ရောက်နိုင်သူ ၁၁ ဦးလုံး (Admin အပါအဝင်) — Action အားလုံး (Add / Edit / Post / Active-Inactive / Delete) ကို ညီတူညီမျှ လုပ်ဆောင်နိုင်ပါသည်။ Password ပြောင်းလိုပါက Cloudflare D1 console (Explore Data) မှ `users` table ရှိ `password_hash` ကို SHA-256(new password) ဖြင့် update လုပ်ပါ။

## ✨ Feature အကျဉ်းချုပ်

- **ပင်မစာမျက်နှာ** — Total Active / Male / Female ကတ်, mindfulness quote box, ကမ္မဋ္ဌာန်းအဆင့် ၇ ဆင့် + ဦးဆောင်ဆွေးနွေးယောဂီ Male/Female/Total ဇယား
- **ကမ္မဋ္ဌာန်း အဆင့် ၇ ဆင့်** (သတိကိုယ့်စိတ်ကိုယ်သိ → သိ-ပါယ်-ဆိုက်-ပွား) — တစ်ခုစီတွင် Active/Male/Female ကတ်, Search, Refresh, Import (Excel/CSV), Add New, Edit/Post/Active-Inactive/Delete
- **Post** — ယောဂီတစ်ဦးကို လက်ရှိအဆင့်မှ နောက်တစ်ဆင့်သို့ Post နှိပ်လိုက်လျှင် နောက်ဆင့် စာရင်းသို့ (ထိုနေ့ရက်စွဲဖြင့်) Auto ရောက်ရှိသွားမည်
- **Active / Inactive** — နှိပ်တိုင်း status နှင့် ရက်စွဲ update ဖြစ်ပြီး Active စာရင်းများ အပေါ်ဆုံးတွင် ပေါ်နေမည်
- **ယောဂီ စုစုပေါင်း စာရင်း** — အဆင့် ၇ ဆင့်လုံး (Active) ကို အုပ်စုလိုက် အကျဉ်းချုပ် ပြသည့် စာမျက်နှာ
- **ဦးဆောင်ဆွေးနွေး ယောဂီ** — သီးခြား CRUD list
- Excel/CSV Import — ကော်လံခေါင်းစဉ် "ရက်စွဲ, အမည်, အသက်, ဖုန်းနံပါတ်, နေရပ်လိပ်စာ, မိတ်ဆက်ယောဂီ, EMAIL, GENDER" ကို အသိအမှတ်ပြုသည်
- User 11 ဦးလုံး တန်းတူ Action အခွင့်အရေး ရှိသည် (RBAC မလို)

## 🛠 Local dev (optional)

```bash
wrangler dev          # Worker → http://localhost:8787
# public/index.html ကို VSCode "Live Server" ကဲ့သို့ static server နှင့် ဖွင့်ပါ
```
