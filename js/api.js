/**
 * YOGI MANAGEMENT SYSTEM — API Bridge
 * File: js/api.js
 */

// Safe Storage Keys Helper
const CONFIG_KEYS = {
  TOKEN: (window.CONFIG && window.CONFIG.STORAGE_KEY_TOKEN) || "yogi_auth_token",
  USER: (window.CONFIG && window.CONFIG.STORAGE_KEY_USER) || "yogi_user_name",
  EXPIRES: (window.CONFIG && window.CONFIG.STORAGE_KEY_EXPIRES) || "yogi_token_expires_at"
};

window.AppState = window.AppState || {
  currentUser: localStorage.getItem(CONFIG_KEYS.USER) || null,
  authToken: localStorage.getItem(CONFIG_KEYS.TOKEN) || null,
  currentTab: "home"
};

window.gReadCache = window.gReadCache || {};

window.clearReadCache = function (prefix) {
  if (!prefix) { window.gReadCache = {}; return; }
  Object.keys(window.gReadCache).forEach(k => {
    if (k.startsWith(prefix)) delete window.gReadCache[k];
  });
};

window.toggleLoading = function (show) {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", !show);
};

window.escapeHtml = function (str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

window.showToast = function (type, message) {
  const box = document.getElementById("toast-container");
  if (!box) return;
  const el = document.createElement("div");
  const isSuccess = String(type).toUpperCase() === "SUCCESS";
  
  el.className = `p-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all transform translate-y-4 opacity-0 duration-300 pointer-events-auto bg-[#0e131f] border ${
    isSuccess ? "border-emerald-500/50 text-emerald-300" : "border-rose-500/50 text-rose-300"
  }`;
  el.innerHTML = `<i class="fa-solid ${isSuccess ? "fa-circle-check" : "fa-circle-exclamation"} text-sm"></i><span>${window.escapeHtml(message)}</span>`;
  
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.remove("translate-y-4", "opacity-0"));
  setTimeout(() => {
    el.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => el.remove(), 300);
  }, 3600);
};

/**
 * Handle Session Expiration
 */
window.handleSessionExpired = window.handleSessionExpired || function () {
  window.showToast("ERROR", "အကောင့်ဝင်ရောက်မှု သက်တမ်းကုန်ဆုံးသွားပါပြီ။ ပြန်လည် Login ဝင်ပါ။");
  localStorage.removeItem(CONFIG_KEYS.TOKEN);
  localStorage.removeItem(CONFIG_KEYS.USER);
  localStorage.removeItem(CONFIG_KEYS.EXPIRES);
  if (window.AppState) {
    window.AppState.authToken = null;
    window.AppState.currentUser = null;
  }
  document.documentElement.className = "dark not-authed";
};

/**
 * Central API call. Read actions are cached in-memory for instant re-renders;
 * write actions invalidate the cache.
 */
window.callApi = async function (action, payload = {}, opts = {}) {
  const method = opts.method || (action.startsWith("get") || action === "checkLogin" || action === "ping" ? "GET" : "POST");
  const isRead = action.startsWith("get");
  const cacheKey = `${action}:${JSON.stringify(payload)}`;

  if (isRead && !opts.forceRefresh && window.gReadCache[cacheKey]) {
    return window.gReadCache[cacheKey];
  }

  const token = window.AppState.authToken || localStorage.getItem(CONFIG_KEYS.TOKEN) || "";
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = (window.CONFIG && window.CONFIG.API_URL) || window.getApiUrl();
  const fetchOpts = { method, headers };

  // Sanitize Payload (remove undefined/null values)
  const cleanPayload = {};
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      cleanPayload[key] = payload[key];
    }
  });

  if (method === "GET") {
    const params = new URLSearchParams({ action, token, ...cleanPayload });
    url += `?${params.toString()}`;
  } else {
    fetchOpts.body = JSON.stringify({ action, token, ...cleanPayload });
  }

  let response;
  try {
    response = await fetch(url, fetchOpts);
  } catch (err) {
    window.showToast("ERROR", "ဆာဗာ ချိတ်ဆက်မှု မအောင်မြင်ပါ — အင်တာနက် စစ်ဆေးပါ။");
    throw err;
  }

  if (response.status === 401) {
    window.handleSessionExpired();
    throw new Error("Session expired");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    result = { success: false, message: "Server response ကို ဖတ်၍မရပါ။" };
  }

  if (!response.ok && result.success !== false) {
    result = { success: false, message: result.message || `HTTP ${response.status}` };
  }

  if (isRead && result.success) {
    window.gReadCache[cacheKey] = result;
  }
  if (!isRead && result.success) {
    window.clearReadCache();
  }

  return result;
};
