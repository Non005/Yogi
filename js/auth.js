/**
 * YOGI MANAGEMENT SYSTEM — Authentication Logic
 * File: js/auth.js
 */

function getStorageKeys() {
  return {
    TOKEN: (window.CONFIG && window.CONFIG.STORAGE_KEY_TOKEN) || "yogi_auth_token",
    USER: (window.CONFIG && window.CONFIG.STORAGE_KEY_USER) || "yogi_user_name",
    EXPIRES: (window.CONFIG && window.CONFIG.STORAGE_KEY_EXPIRES) || "yogi_token_expires_at"
  };
}

function checkExistingSession() {
  const keys = getStorageKeys();
  const token = localStorage.getItem(keys.TOKEN);
  const expiresAt = Number(localStorage.getItem(keys.EXPIRES) || 0);
  const user = localStorage.getItem(keys.USER);

  if (token && expiresAt && Date.now() < expiresAt && user) {
    if (window.AppState) {
      window.AppState.authToken = token;
      window.AppState.currentUser = user;
    }
    document.documentElement.className = "dark is-authed";
    
    const liveUserEl = document.getElementById("live-user-name");
    if (liveUserEl) liveUserEl.innerText = user;

    if (typeof window.initApp === "function") {
      window.initApp();
    }
  } else {
    document.documentElement.className = "dark not-authed";
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const usernameSelect = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorDiv = document.getElementById("login-error");

  if (!usernameSelect || !passwordInput) return;

  const username = usernameSelect.value.trim();
  const password = passwordInput.value.trim();

  if (errorDiv) errorDiv.classList.add("hidden");
  if (typeof window.toggleLoading === "function") window.toggleLoading(true);

  try {
    const res = await window.callApi("checkLogin", { username, password });

    if (res.success) {
      const keys = getStorageKeys();
      if (window.AppState) {
        window.AppState.authToken = res.token;
        window.AppState.currentUser = res.user.username;
      }

      localStorage.setItem(keys.TOKEN, res.token);
      localStorage.setItem(keys.USER, res.user.username);
      localStorage.setItem(keys.EXPIRES, Date.now() + res.expiresInMs);

      document.documentElement.className = "dark is-authed";

      const liveUserEl = document.getElementById("live-user-name");
      if (liveUserEl) liveUserEl.innerText = res.user.username;

      if (typeof window.initApp === "function") {
        window.initApp();
      }
      if (typeof window.showToast === "function") {
        window.showToast("SUCCESS", `${res.user.username} မင်္ဂလာပါ! အကောင့်ဝင်ရောက်မှု အောင်မြင်ပါသည်။`);
      }
    } else {
      if (errorDiv) {
        errorDiv.innerText = res.message || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorDiv.classList.remove("hidden");
      }
    }
  } catch (err) {
    if (errorDiv) {
      errorDiv.innerText = `ဆာဗာ အမှား: ${err.message || String(err)}`;
      errorDiv.classList.remove("hidden");
    }
  } finally {
    if (typeof window.toggleLoading === "function") window.toggleLoading(false);
  }
}

function handleLogout() {
  const keys = getStorageKeys();
  localStorage.removeItem(keys.TOKEN);
  localStorage.removeItem(keys.USER);
  localStorage.removeItem(keys.EXPIRES);

  if (window.AppState) {
    window.AppState.authToken = null;
    window.AppState.currentUser = null;
  }

  document.documentElement.className = "dark not-authed";
  if (typeof window.showToast === "function") {
    window.showToast("SUCCESS", "အကောင့်မှ ထွက်ရှိပြီးပါပြီ။");
  }
}

function loadUsersDropdown() {
  const select = document.getElementById("login-username");
  if (!select) return;

  const users = window.LOGIN_USERS || [
    "Admin",
    "ဓမ္မဝန်ဆောင် ၁", "ဓမ္မဝန်ဆောင် ၂", "ဓမ္မဝန်ဆောင် ၃", "ဓမ္မဝန်ဆောင် ၄", "ဓမ္မဝန်ဆောင် ၅",
    "ဓမ္မဝန်ဆောင် ၆", "ဓမ္မဝန်ဆောင် ၇", "ဓမ္မဝန်ဆောင် ၈", "ဓမ္မဝန်ဆောင် ၉", "ဓမ္မဝန်ဆောင် ၁၀"
  ];
  select.innerHTML = users.map(u => `<option value="${u}">${u}</option>`).join("");
}

window.checkExistingSession = checkExistingSession;
window.handleLoginSubmit = handleLoginSubmit;
window.handleLogout = handleLogout;
window.loadUsersDropdown = loadUsersDropdown;

document.addEventListener("DOMContentLoaded", () => {
  loadUsersDropdown();
  checkExistingSession();
});
