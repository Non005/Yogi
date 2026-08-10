/**
 * YOGI MANAGEMENT SYSTEM — Global Configuration
 * File: js/config.js
 */
(function () {
  "use strict";

  // ကမ္မဋ္ဌာန်း အဆင့် (Level) စာရင်း — worker.js ရှိ LEVELS array နှင့် ကိုက်ညီရပါမည်
  window.LEVELS = [
    { id: 1, key: "level1", name: "သတိ ကိုယ့်စိတ်ကိုယ်သိ ယောဂီ", icon: "fa-hands-praying", color: "amber" },
    { id: 2, key: "level2", name: "ရုပ် ကမ္မဋ္ဌာန်း ယောဂီ", icon: "fa-leaf", color: "emerald" },
    { id: 3, key: "level3", name: "နာမ် ကမ္မဋ္ဌာန်း ယောဂီ", icon: "fa-brain", color: "sky" },
    { id: 4, key: "level4", name: "ရုပ်နာမ် ကမ္မဋ္ဌာန်း ယောဂီ", icon: "fa-atom", color: "cyan" },
    { id: 5, key: "level5", name: "ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း ယောဂီ", icon: "fa-layer-group", color: "rose" },
    { id: 6, key: "level6", name: "ဥပါနက္ခခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း ယောဂီ", icon: "fa-circle-nodes", color: "teal" },
    { id: 7, key: "level7", name: "သိ-ပါယ်-ဆိုက်-ပွား ယောဂီ", icon: "fa-sun", color: "indigo" }
  ];

  // Login dropdown users (Admin + 10 ဓမ္မဝန်ဆောင်) — schema.sql ရှိ seed data နှင့် ကိုက်ညီရပါမည်
  window.LOGIN_USERS = [
    "Admin",
    "ဓမ္မဝန်ဆောင် ၁", "ဓမ္မဝန်ဆောင် ၂", "ဓမ္မဝန်ဆောင် ၃", "ဓမ္မဝန်ဆောင် ၄", "ဓမ္မဝန်ဆောင် ၅",
    "ဓမ္မဝန်ဆောင် ၆", "ဓမ္မဝန်ဆောင် ၇", "ဓမ္မဝန်ဆောင် ၈", "ဓမ္မဝန်ဆောင် ၉", "ဓမ္မဝန်ဆောင် ၁၀"
  ];

  function getApiUrl() {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return localStorage.getItem("dev_api_url") || "http://localhost:8787";
    }
    // 💡 Cloudflare Worker (yogi-list) production URL
    return localStorage.getItem("prod_api_url") || "https://yogi-list.kotuntunwin1985.workers.dev";
  }

  // Global Function အဖြစ် အပြင်မှ တိုက်ရိုက် ခေါ်သုံးနိုင်အောင် attach လုပ်ပေးခြင်း
  window.getApiUrl = getApiUrl;

  window.CONFIG = {
    // Getter အဖြစ် ပြောင်းထားသဖြင့် localStorage ထဲမှ URL ပြောင်းလျှင် အလိုအလျောက် Update ဖြစ်ပါမည်
    get API_URL() {
      return getApiUrl();
    },
    STORAGE_KEY_TOKEN: "yogi_auth_token",
    STORAGE_KEY_USER: "yogi_user_name",
    STORAGE_KEY_EXPIRES: "yogi_token_expires_at",
    DEFAULT_PAGE_SIZE: 25,

    SHEET_HEADERS: [
      { key: "seqNo", label: "စဉ်" },
      { key: "regDate", label: "ရက်စွဲ" },
      { key: "name", label: "အမည်" },
      { key: "age", label: "အသက်" },
      { key: "phone", label: "ဖုန်းနံပါတ်" },
      { key: "address", label: "နေရပ်လိပ်စာ" },
      { key: "introducer", label: "မိတ်ဆက်ယောဂီ" },
      { key: "email", label: "EMAIL" },
      { key: "gender", label: "GENDER" },
      { key: "createdBy", label: "CREATED BY" },
      { key: "createdAt", label: "CREATED AT" },
      { key: "uniqueId", label: "UNIQUEID" }
    ],

    LEADER_HEADERS: [
      { key: "seqNo", label: "စဉ်" },
      { key: "regDate", label: "ရက်စွဲ" },
      { key: "name", label: "အမည်" },
      { key: "age", label: "အသက်" },
      { key: "phone", label: "ဖုန်းနံပါတ်" },
      { key: "address", label: "နေရပ်လိပ်စာ" },
      { key: "email", label: "EMAIL" },
      { key: "gender", label: "GENDER" },
      { key: "createdBy", label: "CREATED BY" },
      { key: "createdAt", label: "CREATED AT" },
      { key: "uniqueId", label: "UNIQUEID" }
    ]
  };

  window.DROPDOWNS = {
    GENDER: ["ကျား", "မ"]
  };
})();
