/**
 * YOGI MANAGEMENT SYSTEM — Global Configuration (FIXED VERSION)
 * File: js/config.js
 * 
 * ✅ FIXES:
 * - Updated API URL handling for production
 * - Added better environment detection
 * - Added configuration documentation
 */
(function () {
  "use strict";

  // ကမ္မဋ္ဌာန်း အဆင့်များ စာရင်း (1 to 7 + Stage 8 Alumni)
  window.LEVELS = [
    { id: 1, key: "level1", name: "သတိကိုယ့်စိတ် ကိုယ်သိပါ", icon: "fa-hands-praying", color: "amber" },
    { id: 2, key: "level2", name: "ရုပ် ကမ္မဋ္ဌာန်း", icon: "fa-leaf", color: "emerald" },
    { id: 3, key: "level3", name: "နာမ် ကမ္မဋ္ဌာန်း", icon: "fa-brain", color: "sky" },
    { id: 4, key: "level4", name: "ရုပ်နာမ် ကမ္မဋ္ဌာန်း", icon: "fa-atom", color: "cyan" },
    { id: 5, key: "level5", name: "ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း", icon: "fa-layer-group", color: "rose" },
    { id: 6, key: "level6", name: "ဥပါဒါနက္ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း", icon: "fa-circle-nodes", color: "teal" },
    { id: 7, key: "level7", name: "သိ-ပါယ်-ဆိုက်-ပွား ကမ္မဋ္ဌာန်း", icon: "fa-sun", color: "indigo" },
    { id: 8, key: "old_yogis", name: "ယောဂီ စာရင်းဟောင်း", icon: "fa-box-archive", color: "purple" }
  ];

  // Pre-seeded Login User Accounts
  window.LOGIN_USERS = [
    "Admin",
    "ဓမ္မဝန်ဆောင် ၁", "ဓမ္မဝန်ဆောင် ၂", "ဓမ္မဝန်ဆောင် ၃", "ဓမ္မဝန်ဆောင် ၄", "ဓမ္မဝန်ဆောင် ၅",
    "ဓမ္မဝန်ဆောင် ၆", "ဓမ္မဝန်ဆောင် ၇", "ဓမ္မဝန်ဆောင် ၈", "ဓမ္မဝန်ဆောင် ၉", "ဓမ္မဝန်ဆောင် ၁၀"
  ];

  /**
   * ✅ FIXED: Resolves API URL based on Environment
   * 
   * Detection order:
   * 1. localStorage override (for testing)
   * 2. Environment: localhost → use development API
   * 3. Environment: production domain → use production API
   * 
   * UPDATE THIS FOR PRODUCTION:
   * Replace "YOUR-SUBDOMAIN" with your actual Cloudflare Worker subdomain
   * Example: "https://yogi-api.yourdomain.workers.dev"
   */
  function getApiUrl() {
    const hostname = window.location.hostname;
    
    // ✅ Local Development Mode
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const devUrl = localStorage.getItem("dev_api_url");
      if (devUrl) return devUrl.replace(/\/$/, "");
      return "http://localhost:8787"; // Wrangler dev server
    }
    
    // ✅ Custom Override (if set in localStorage)
    const prodUrl = localStorage.getItem("prod_api_url");
    if (prodUrl) return prodUrl.replace(/\/$/, "");
    
    // ✅ Production Cloudflare Worker API Endpoint
    // GitHub Pages, Cloudflare Pages သို့မဟုတ် Custom Domain အားလုံးအတွက် 
    return "https://yogi-list.kotuntunwin1985.workers.dev";
  }

  /**
   * Get Level Info by ID
   */
  function getLevelById(id) {
    const numId = Number(id);
    return window.LEVELS.find(l => l.id === numId) || {
      id: numId,
      name: numId === 8 ? "ယောဂီ စာရင်းဟောင်း" : `အဆင့် (${numId})`,
      icon: "fa-dharmachakra",
      color: "amber"
    };
  }

  /**
   * Get Level Info by Key
   */
  function getLevelByKey(key) {
    return window.LEVELS.find(l => l.key === key) || null;
  }

  /**
   * Get Environment Information for Debugging
   */
  function getEnvironmentInfo() {
    return {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isDevelopment: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1",
      apiUrl: getApiUrl(),
      timestamp: new Date().toISOString()
    };
  }

  // Global Exports
  window.getApiUrl = getApiUrl;
  window.getLevelById = getLevelById;
  window.getLevelByKey = getLevelByKey;
  window.getEnvironmentInfo = getEnvironmentInfo;

  window.CONFIG = {
    get API_URL() { return getApiUrl(); },
    STORAGE_KEY_TOKEN: "yogi_auth_token",
    STORAGE_KEY_USER: "yogi_user_name",
    STORAGE_KEY_EXPIRES: "yogi_token_expires_at",
    DEFAULT_PAGE_SIZE: 25,
    
    // ✅ NEW: API Request Configuration
    API_TIMEOUT_MS: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    
    // ✅ NEW: Environment Information
    get ENVIRONMENT_INFO() { return getEnvironmentInfo(); }
  };

  // ✅ Log environment info in development
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.info("🌍 Yogi App - Development Mode", getEnvironmentInfo());
  }
})();
