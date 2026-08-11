Yogi App (Zoom ယောဂီစာရင်း စီမံခန့်ခွဲမှုစနစ်) ၏ နည်းပညာ၊ ဖိုင်ဖွဲ့စည်းပုံနှင့် Deploy အနှစ်ချုပ် ဖြစ်ပါသည်-
📁 ဖိုင်ဖွဲ့စည်းပုံ အကျဉ်း

    worker.js — Cloudflare Worker API (Backend)

    manifest.json / sw.js — PWA App Icon သွင်းယူရန် သတ်မှတ်ချက်များ

    public/ — Frontend (HTML, CSS, JS)

🚀 Deploy ပြုလုပ်နည်း (၃ အဆင့်)

    Backend (D1 DB & Worker):
    code Bash

    wrangler d1 execute yogi --remote --file=./schema.sql
    wrangler secret put AUTH_SECRET
    wrangler deploy

    API URL ချိတ်ဆက်ခြင်း (js/config.js):
    getApiUrl() တွင် မိမိ၏ Worker URL ထည့်သွင်းပါ။

    Frontend တင်ခြင်း:
    GitHub Pages သို့မဟုတ် Cloudflare Pages တွင် Push တင်ပါ။

✨ အဓိက လုပ်ဆောင်ချက်များ

    PWA App Icon: ဖုန်း/လက်ပတော့တွင် App အစစ်အတိုင်း Install သွင်းသုံးနိုင်ခြင်း။

    ကမ္မဋ္ဌာန်း အဆင့် ၇ ဆင့်: ယောဂီ စာရင်းသွင်း/ပြင်/ဖျက်၊ Search၊ Active/Inactive။

    Post (အဆင့်တက်): Post နှိပ်ပါက မူလစာမျက်နှာမှ ပျောက်သွားပြီး နောက်အဆင့်သို့ Auto ရွှေ့ပေးခြင်း။

    ၇ ကော်လံ စာရင်းချုပ်: အဆင့် ၁ မှ ၇ အထိ Active ယောဂီများအား မက်ထရစ် ဇယားဖြင့် ပြသပေးခြင်း။

    Pagination & Search: ၁ မျက်နှာလျှင် ဦးရေ ၃၀ သာ ခေါ်ယူ၍ Previous/Next ဖြင့် ကြည့်နိုင်ခြင်း။
    
