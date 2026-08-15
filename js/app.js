/**
 * YOGI MANAGEMENT SYSTEM — Main Router & Navigation Logic (FULL FIXED WITH LIVE SYNC & MOBILE SIDEBAR)
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
 * 💡 Mobile Sidebar Toggle (Android / iPhone အတွက် Sidebar အဖွင့်/အပိတ် Logic)
 */
window.toggleMobileSidebar = function (forceClose = false) {
  const sidebar = document.getElementById("main-sidebar");
  const backdrop = document.getElementById("mobile-sidebar-backdrop") || document.getElementById("sidebar-backdrop");

  if (!sidebar) return;

  // Sidebar လက်ရှိ ပိတ်ထားသလား စစ်ဆေးခြင်း
  const isClosed = sidebar.classList.contains("-translate-x-full");

  if (forceClose || !isClosed) {
    // ပိတ်မည်
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    if (backdrop) {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("opacity-100");
    }
  } else {
    // ဖွင့်မည်
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    if (backdrop) {
      backdrop.classList.remove("hidden");
      backdrop.classList.add("opacity-100");
    }
  }
};

/**
 * 💡 Smart Live Sync Auto-Refresh Manager
 */
window.startLiveSync = function () {
  if (liveSyncInterval) clearInterval(liveSyncInterval);

  liveSyncInterval = setInterval(() => {
    const token = localStorage.getItem("yogi_auth_token");
    if (!token) return;

    if (document.hidden) return;

    const isModalOpen = document.querySelector('.modal-overlay-bg:not(.hidden)');
    if (isModalOpen) return;

    if (!window.AppState) return;
    const currentTab = window.AppState.currentTab || "home";
    const currentParam = window.AppState.currentParam;

    if (currentTab === "home" || currentTab === "dashboard") {
      if (typeof window.renderDashboard === "function") {
        window.renderDashboard(true);
      }
    } else if (currentTab === "level" || currentTab === "yogi" || currentTab === "stage") {
      const levelId = Number(currentParam || 1);
      if (typeof window.renderYogiStage === "function") {
        const page = window.currentYogiPage || 1;
        const search = window.currentYogiSearch || "";
        window.renderYogiStage(levelId, page, search, true);
      }
    } else if (currentTab === "total_summary") {
      if (typeof window.renderTotalSummary === "function") {
        window.renderTotalSummary(window.currentSummarySearch || "", true);
      }
    } else if (currentTab === "leaders" || currentTab === "leader") {
      if (typeof window.renderLeaders === "function") {
        const page = window.currentLeaderPage || 1;
        const search = window.currentLeaderSearch || "";
        window.renderLeaders(page, search, true);
      }
    }
  }, 5000);
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

  const currentTab = (window.AppState && window.AppState.currentTab) || "home";
  const currentParam = (window.AppState && window.AppState.currentParam) || null;
  window.switchTab(currentTab, currentParam);

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
  if (window.AppState) {
    window.AppState.currentTab = tabName;
    window.AppState.currentParam = param;
  }

  updateActiveNav(tabName, param);

  // ဖုန်း screen တွင် menu item တစ်ခုခုကို နှိပ်လိုက်ပါက Sidebar ကို အလိုအလျောက် ပိတ်ပေးခြင်း
  if (window.innerWidth < 768) {
    window.toggleMobileSidebar(true);
  }

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

  if (window.AppState) {
    updateActiveNav(window.AppState.currentTab || "home", window.AppState.currentParam);
  }
}

window.renderSidebar = renderSidebar;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.checkExistingSession === "function") {
    window.checkExistingSession();
  }
  if (typeof window.startLiveSync === "function") {
    window.startLiveSync();
  }

  // Hamburger Menu ခလုတ်များအား အလိုအလျောက် Event Listener ချိတ်ပေးခြင်း
  const mobileMenuBtns = document.querySelectorAll("#mobile-menu-btn, .mobile-menu-btn, [data-action='toggle-sidebar']");
  mobileMenuBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.toggleMobileSidebar();
    });
  });
});
