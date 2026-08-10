/**
 * YOGI MANAGEMENT SYSTEM — Main Router & Navigation Logic
 * File: js/app.js
 */

window.initApp = function () {
  const liveUserEl = document.getElementById("live-user-name");
  if (liveUserEl && window.AppState && window.AppState.currentUser) {
    liveUserEl.innerText = String(window.AppState.currentUser);
  }

  renderSidebar();
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
};

window.switchTab = function (tabName, param = null) {
  const nav = document.getElementById("sidebar-nav");
  if (nav) {
    const btns = nav.querySelectorAll(".nav-btn");
    btns.forEach(b => b.classList.remove("nav-btn-active"));
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

function renderSidebar() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  let html = `
    <button onclick="switchTab('home')" class="nav-btn nav-btn-active w-full text-left p-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-house text-amber-400 text-sm shrink-0"></i>
      <span class="truncate">ပင်မစာမျက်နှာ</span>
    </button>
    <p class="pt-3 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ကမ္မဋ္ဌာန်း အဆင့်များ</p>
  `;

  const levels = (window.LEVELS || []).filter(l => l.id <= 7);
  levels.forEach(l => {
    html += `
      <button onclick="switchTab('level', ${l.id})" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
        <span class="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[10px] shrink-0 font-mono">${l.id}</span>
        <span class="truncate">${l.name}</span>
      </button>
    `;
  });

  html += `
    <p class="pt-3 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">အခြား စာရင်းများ</p>
    <button onclick="switchTab('total_summary')" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-list-check text-emerald-400 text-sm shrink-0"></i>
      <span class="truncate">ယောဂီ စုစုပေါင်း စာရင်း</span>
    </button>
    <button onclick="switchTab('level', 8)" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-box-archive text-purple-400 text-sm shrink-0"></i>
      <span class="truncate">ယောဂီ စာရင်းဟောင်း</span>
    </button>
    <button onclick="switchTab('leaders')" class="nav-btn w-full text-left p-2 rounded-xl font-bold text-xs flex items-center gap-2.5">
      <i class="fa-solid fa-user-tie text-indigo-400 text-sm shrink-0"></i>
      <span class="truncate">ဦးဆောင်ဆွေးနွေး ယောဂီ</span>
    </button>
  `;

  nav.innerHTML = html;

  const btns = nav.querySelectorAll(".nav-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", function () {
      btns.forEach(b => b.classList.remove("nav-btn-active"));
      this.classList.add("nav-btn-active");
    });
  });
}

window.renderSidebar = renderSidebar;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.checkExistingSession === "function") {
    window.checkExistingSession();
  }
});
