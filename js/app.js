/**
 * YOGI MANAGEMENT SYSTEM — Main Router & Navigation Logic (FULL FIXED WITH LIVE SYNC)
 * File: js/app.js  
 */

// Default Fallback Levels in case window.LEVELS is not loaded yet
const DEFAULT_LEVELS = [
  { id: 1, name: "သတိကိုယ့်စိတ်ကိုယ်သိပါ" },
  { id: 2, name: "ရုပ် ကမ္မဋ္ဌာန်း" },
  { id: 3, name: "နာမ် ကမ္မဋ္ဌာန်း" },
  { id: 4, name: "ရုပ်နာမ် ကမ္မဋ္ဌာန်း" },
  { id: 5, name: "ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း" },
  { id: 6, name: "ဥပါဒါနက်ခန္ဓာငါးပါး ကမ္မဋ္ဌာန်း" },
  { id: 7, name: "သိ-ပါယ်-ဆိုက်-ပွား" },
  { id: 8, name: "ယောဂီ စာရင်းဟောင်း" }
];

let liveSyncInterval = null;

/**
 * 💡 Smart Live Sync Auto-Refresh Manager
 * ၅ စက္ကန့်တစ်ကြိမ် နောက်ကွယ်မှ အလိုအလျောက် ဒေတာ အသစ် ရယူပေးမည့် စနစ်
 */
window.startLiveSync = function () {
  if (liveSyncInterval) clearInterval(liveSyncInterval);

  liveSyncInterval = setInterval(() => {
    // ၁။ User Login မဝင်ထားလျှင် သို့မဟုတ် Token မရှိလျှင် Auto Sync မလုပ်ပါ
    const token = localStorage.getItem("yogi_auth_token");
    if (!token) return;

    // ၂။ ဖုန်း/ကွန်ပျူတာ Screen မီးပိတ်ထားလျှင် သို့မဟုတ် အခြား Tab သို့ ရောက်နေလျှင် မလုပ်ပါ
    if (document.hidden) return;

    // ၃။ စာရင်းသွင်းနေချိန် / ပြင်နေချိန် (Modal ပွင့်နေချိန်) စာရိုက်မပျက်အောင် Auto Sync ခဏ ရပ်မည်
    const isModalOpen = document.querySelector('.modal-overlay-bg:not(.hidden)');
    if (isModalOpen) return;

    // ၄။ လက်ရှိ AppState တွင် ရောက်နေသော စာမျက်နှာအလိုက် Silent Auto Refresh ပြုလုပ်ပေးမည်
    if (!window.AppState) return;
    const currentTab = window.AppState.currentTab || "home";
    const currentParam = window.AppState.currentParam;

    if (currentTab === "home" || currentTab === "dashboard") {
      if (typeof window.renderDashboard === "function") {
        window.renderDashboard(true); // silent refresh
      }
    } else if (currentTab === "level" || currentTab === "yogi" || currentTab === "stage") {
      const levelId = Number(currentParam || 1);
      if (typeof window.renderYogiStage === "function") {
        const page = window.currentYogiPage || 1;
        const search = window.currentYogiSearch || "";
        window.renderYogiStage(levelId, page, search, true); // silent refresh
      }
    } else if (currentTab === "total_summary") {
      if (typeof window.renderTotalSummary === "function") {
        window.renderTotalSummary(true); // silent refresh
      }
    } else if (currentTab === "leaders" || currentTab === "leader") {
      if (typeof window.renderLeaders === "function") {
        const page = window.currentLeaderPage || 1;
        const search = window.currentLeaderSearch || "";
        window.renderLeaders(page, search, true); // silent refresh
      }
    }
  }, 5000); // ၅ စက္ကန့်တစ်ကြိမ် Auto-Sync
};

/**
 * App Initialization
 */
window.initApp = function () {
  const liveUserEl = document.getElementById("live-user-name");
  if (liveUserEl && window.AppState && window.AppState.currentUser) {
    liveUserEl.innerText = String(window.AppState.currentUser);
  }

  renderSidebar();

  // Load default home/dashboard tab
  const currentTab = (window.AppState && window.AppState.currentTab) || "home";
  const currentParam = (window.AppState && window.AppState.currentParam) || null;
  window.switchTab(currentTab, currentParam);

  // 💡 Start Live Sync Timer
  if (typeof window.startLiveSync === "function") {
    window.startLiveSync();
  }
};

/**
 * Updates Active Highlight Class on Sidebar Buttons
 */
function updateActiveNav(tabName, param) {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  const btns = nav.querySelectorAll(".nav-btn");
  btns.forEach(b => {
    b.classList.remove("nav-btn-active");
    const btnTab = b.getAttribute("data-tab");
    const btnParam = b.getAttribute("data-param");

    if (btnTab === tabName) {
      if (param !== null && param !== undefined) {
        if (String(btnParam) === String(param)) {
          b.classList.add("nav-btn-active");
        }
      } else if (!btnParam) {
        b.classList.add("nav-btn-active");
      }
    }
  });
}

/**
 * Main Tab Router Function
 */
window.switchTab = function (tabName, param = null) {
  // Store navigation state
  if (window.AppState) {
    window.AppState.currentTab = tabName;
    window.AppState.currentParam = param;
  }

  // Update sidebar active highlight
  updateActiveNav(tabName, param);

  // Auto-close mobile sidebar on selection if open
  const sidebar = document.getElementById("main-sidebar");
  if (sidebar && !sidebar.classList.contains("-translate-x-full") && window.innerWidth < 768) {
    if (typeof window.toggleMobileSidebar === "function") {
      window.toggleMobileSidebar();
    }
  }

  // Render view panels
  if (tabName === "home" || tabName === "dashboard") {
    if (typeof window.renderDashboard === "function") window.renderDashboard();
  } else if (tabName === "level" || tabName === "yogi" || tabName === "stage") {
    const levelId = Number(param || 1);
    if (typeof window.renderYogiStage === "function") window.renderYogiStage(levelId);
  } else if (tabName === "total_summary") {
    if (typeof window.renderTotalSummary === "function") window.renderTotalSummary();
  } else if (tabName === "leaders" || tabName === "leader") {
    if (typeof window.renderLeaders === "function") window.renderLeaders();
  }
};

/**
 * Renders Dynamic Sidebar Navigation
 */
function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  let html = `
    <button data-tab="home" onclick="switchTab('home')" class="nav-btn nav-btn-active w-full text-left p-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-house text-amber-400 text-sm shrink-0"></i>
      <span class="truncate">ပင်မစာမျက်နှာ</span>
    </button>
    <p class="pt-3 pb-1 px-3 text-[10px] font-black text-amber-400/70 uppercase tracking-widest">ကမ္မဋ္ဌာန်း အဆင့်များ</p>
  `;

  // Meditation Levels 1 to 7 (Using global window.LEVELS or fallback)
  const sourceLevels = (window.LEVELS && window.LEVELS.length > 0) ? window.LEVELS : DEFAULT_LEVELS;
  const levels = sourceLevels.filter(l => l.id <= 7);

  levels.forEach(l => {
    html += `
      <button data-tab="level" data-param="${l.id}" onclick="switchTab('level', ${l.id})" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
        <span class="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[10px] shrink-0 font-mono font-extrabold">${l.id}</span>
        <span class="truncate">${l.name}</span>
      </button>
    `;
  });

  // Other Lists
  html += `
    <p class="pt-3 pb-1 px-3 text-[10px] font-black text-amber-400/70 uppercase tracking-widest">အခြား စာရင်းများ</p>
    <button data-tab="total_summary" onclick="switchTab('total_summary')" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-list-check text-emerald-400 text-sm shrink-0"></i>
      <span class="truncate">ယောဂီ စုစုပေါင်း စာရင်း</span>
    </button>
    <button data-tab="level" data-param="8" onclick="switchTab('level', 8)" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-box-archive text-purple-400 text-sm shrink-0"></i>
      <span class="truncate">ယောဂီ စာရင်းဟောင်း</span>
    </button>
    <button data-tab="leaders" onclick="switchTab('leaders')" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-user-tie text-indigo-400 text-sm shrink-0"></i>
      <span class="truncate">ဦးဆောင်ဆွေးနွေး ယောဂီ</span>
    </button>
  `;

  nav.innerHTML = html;

  // Sync active highlight after render
  if (window.AppState) {
    updateActiveNav(window.AppState.currentTab || "home", window.AppState.currentParam);
  }
}

window.renderSidebar = renderSidebar;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.checkExistingSession === "function") {
    window.checkExistingSession();
  }
  // 💡 Start Live Sync Timer on page load
  if (typeof window.startLiveSync === "function") {
    window.startLiveSync();
  }
});
