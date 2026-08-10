/**
 * YOGI MANAGEMENT SYSTEM — Authentication
 * File: js/auth.js 
 */

function populateLoginDropdown() {
  const sel = document.getElementById("login-username");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- ရာထူး/အမည် ရွေးချယ်ပါ --</option>` +
    window.LOGIN_USERS.map(u => `<option value="${window.escapeHtml(u)}">${window.escapeHtml(u)}</option>`).join("");
}

function showWorkspace() {
  document.documentElement.className = "dark is-authed";
  const overlay = document.getElementById("login-overlay");
  const ws = document.getElementById("erp-workspace");
  if (overlay) overlay.style.setProperty("display", "none", "important");
  if (ws) ws.style.setProperty("display", "flex", "important");
}

function showLogin() {
  document.documentElement.className = "dark not-authed";
  const overlay = document.getElementById("login-overlay");
  const ws = document.getElementById("erp-workspace");
  if (overlay) overlay.style.setProperty("display", "flex", "important");
  if (ws) ws.style.setProperty("display", "none", "important");
  const pass = document.getElementById("login-password");
  if (pass) pass.value = "";
}

window.handleSessionExpired = function () {
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_TOKEN);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_USER);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_EXPIRES);
  window.AppState.authToken = null;
  window.AppState.currentUser = null;
  window.clearReadCache();
  showLogin();
  const errBox = document.getElementById("login-error");
  if (errBox) {
    errBox.textContent = "Session သက်တမ်း ကုန်ဆုံးသွားပါပြီ။ ပြန်လည် Login ဝင်ရောက်ပါ။";
    errBox.classList.remove("hidden");
  }
};

async function handleLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const usernameSel = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorBox = document.getElementById("login-error");
  if (!usernameSel || !passwordInput) return;

  const username = (usernameSel.value || "").trim();
  const password = (passwordInput.value || "").trim();

  if (!username || !password) {
    if (errorBox) {
      errorBox.textContent = "ရာထူး/အမည် နှင့် လျှို့ဝှက်နံပါတ် နှစ်ခုစလုံး ဖြည့်သွင်းပါ။";
      errorBox.classList.remove("hidden");
    }
    return;
  }

  if (errorBox) errorBox.classList.add("hidden");
  window.toggleLoading(true);

  try {
    const res = await window.callApi("checkLogin", { username, password });
    window.toggleLoading(false);

    if (res && res.success) {
      const displayName = (res.user && res.user.displayName) || username;
      window.AppState.currentUser = displayName;
      window.AppState.authToken = res.token;

      const expiresAt = Date.now() + (res.expiresInMs || 8 * 60 * 60 * 1000);
      localStorage.setItem(window.CONFIG.STORAGE_KEY_TOKEN, res.token);
      localStorage.setItem(window.CONFIG.STORAGE_KEY_USER, displayName);
      localStorage.setItem(window.CONFIG.STORAGE_KEY_EXPIRES, String(expiresAt));

      showWorkspace();
      document.getElementById("live-user-name").textContent = displayName;
      window.showToast("SUCCESS", `မင်္ဂလာပါ ${displayName} — Login အောင်မြင်ပါသည်။`);
      window.switchTab("home");
    } else {
      if (errorBox) {
        errorBox.textContent = (res && res.message) || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorBox.classList.remove("hidden");
      }
    }
  } catch (err) {
    window.toggleLoading(false);
    if (errorBox) {
      errorBox.textContent = "ဆာဗာ ချိတ်ဆက်မှု အမှား ဖြစ်ပေါ်ခဲ့သည်။";
      errorBox.classList.remove("hidden");
    }
  }
}

function handleLogout() {
  if (!confirm("စနစ်မှ ထွက်ခွာလိုပါသလား။")) return;
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_TOKEN);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_USER);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_EXPIRES);
  window.AppState.authToken = null;
  window.AppState.currentUser = null;
  window.clearReadCache();
  showLogin();
  window.showToast("SUCCESS", "စနစ်မှ ထွက်ခွာပြီးပါပြီ။");
}

function checkExistingSession() {
  populateLoginDropdown();

  const token = localStorage.getItem(window.CONFIG.STORAGE_KEY_TOKEN);
  const user = localStorage.getItem(window.CONFIG.STORAGE_KEY_USER);
  const expiresAt = Number(localStorage.getItem(window.CONFIG.STORAGE_KEY_EXPIRES) || 0);

  if (token && user && expiresAt && Date.now() < expiresAt) {
    window.AppState.authToken = token;
    window.AppState.currentUser = user;
    showWorkspace();
    document.getElementById("live-user-name").textContent = user;
    window.switchTab("home");
  } else {
    if (token) window.handleSessionExpired();
    else showLogin();
  }
}
