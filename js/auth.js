/**
 * YOGI MANAGEMENT SYSTEM — Authentication Logic
 * File: js/auth.js
 */

async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const usernameSelect = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorDiv = document.getElementById("login-error");

  if (!usernameSelect || !passwordInput) return;

  const username = usernameSelect.value.trim();
  const password = passwordInput.value.trim();

  if (errorDiv) errorDiv.classList.add("hidden");
  window.toggleLoading(true);

  try {
    const res = await window.callApi("checkLogin", { username, password });

    if (res.success) {
      window.AppState.authToken = res.token;
      window.AppState.currentUser = res.user.username;

      localStorage.setItem(window.CONFIG.STORAGE_KEY_TOKEN, res.token);
      localStorage.setItem(window.CONFIG.STORAGE_KEY_USER, res.user.username);
      localStorage.setItem(window.CONFIG.STORAGE_KEY_EXPIRES, Date.now() + res.expiresInMs);

      document.documentElement.className = "dark is-authed";
      
      if (typeof window.initApp === "function") {
        window.initApp();
      }
      window.showToast("SUCCESS", `${res.user.username} မင်္ဂလာပါ! အကောင့်ဝင်ရောက်မှု အောင်မြင်ပါသည်။`);
    } else {
      if (errorDiv) {
        errorDiv.innerText = res.message || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorDiv.classList.remove("hidden");
      }
    }
  } catch (err) {
    if (errorDiv) {
      errorDiv.innerText = "ဆာဗာ ချိတ်ဆက်မှု အမှား ဖြစ်ပေါ်ခဲ့သည်။";
      errorDiv.classList.remove("hidden");
    }
  } finally {
    window.toggleLoading(false);
  }
}

function handleLogout() {
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_TOKEN);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_USER);
  localStorage.removeItem(window.CONFIG.STORAGE_KEY_EXPIRES);

  if (window.AppState) {
    window.AppState.authToken = null;
    window.AppState.currentUser = null;
  }

  document.documentElement.className = "dark not-authed";
  window.showToast("SUCCESS", "အကောင့်မှ ထွက်ရှိပြီးပါပြီ။");
}

function loadUsersDropdown() {
  const select = document.getElementById("login-username");
  if (!select) return;

  const users = window.LOGIN_USERS || ["Admin"];
  select.innerHTML = users.map(u => `<option value="${u}">${u}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsersDropdown();
});
