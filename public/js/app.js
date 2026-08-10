/**
 * YOGI MANAGEMENT SYSTEM — App Shell (Sidebar, Routing, Modal)
 * File: js/app.js 
 */

const PAGE_TITLES = {
  home: "ပင်မစာမျက်နှာ",
  total: "ယောဂီ စုစုပေါင်း စာရင်း",
  leaders: "ဦးဆောင်ဆွေးနွေး ယောဂီ"
};
window.LEVELS.forEach(l => { PAGE_TITLES["level" + l.id] = l.name; });

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  let html = `
    <button onclick="switchTab('home')" id="btn-home" class="nav-btn w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
      <i class="fa-solid fa-gauge-high w-4 text-center text-indigo-400"></i> ပင်မစာမျက်နှာ
    </button>
    <p class="text-[9px] font-bold text-slate-500 px-3 uppercase tracking-wider mt-3 mb-1">ကမ္မဋ္ဌာန်း အဆင့်များ</p>
  `;

  window.LEVELS.forEach((l, idx) => {
    html += `
      <button onclick="switchTab('level${l.id}')" id="btn-level${l.id}" class="nav-btn w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
        <i class="fa-solid ${l.icon} text-${l.color}-400 w-4 text-center"></i> ${idx + 1}။ ${window.escapeHtml(l.name)}
      </button>`;
  });

  html += `
    <p class="text-[9px] font-bold text-slate-500 px-3 uppercase tracking-wider mt-3 mb-1">စာရင်းချုပ်များ</p>
    <button onclick="switchTab('total')" id="btn-total" class="nav-btn w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
      <i class="fa-solid fa-list-check text-amber-300 w-4 text-center"></i> ယောဂီ စုစုပေါင်း စာရင်း
    </button>
    <button onclick="switchTab('leaders')" id="btn-leaders" class="nav-btn w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
      <i class="fa-solid fa-user-tie text-violet-300 w-4 text-center"></i> ဦးဆောင်ဆွေးနွေး ယောဂီ
    </button>
  `;

  nav.innerHTML = html;
}

window.switchTab = function (tab) {
  window.AppState.currentTab = tab;

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("nav-btn-active"));
  const activeBtn = document.getElementById("btn-" + tab);
  if (activeBtn) activeBtn.classList.add("nav-btn-active");

  document.getElementById("page-title").textContent = PAGE_TITLES[tab] || tab;

  const container = document.getElementById("view-container");
  container.innerHTML = `<div class="flex items-center justify-center py-24 text-slate-500 text-xs"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> ဖွင့်နေပါသည်...</div>`;

  if (tab === "home") return window.renderHomePage(container);
  if (tab === "total") return window.renderTotalListPage(container);
  if (tab === "leaders") return window.renderLeaderPage(container);
  if (tab.startsWith("level")) {
    const level = Number(tab.replace("level", ""));
    return window.renderLevelPage(container, level);
  }
};

/* --------------------------------- Modal --------------------------------- */

window.openModal = function (title, bodyHtml, opts = {}) {
  closeModal();
  const wrap = document.createElement("div");
  wrap.id = "app-modal";
  wrap.className = "fixed inset-0 bg-black/70 backdrop-blur-sm z-[180] flex items-center justify-center p-4";
  wrap.innerHTML = `
    <div class="w-full ${opts.wide ? "max-w-2xl" : "max-w-md"} bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
        <h3 class="text-sm font-bold text-slate-100">${window.escapeHtml(title)}</h3>
        <button onclick="closeModal()" class="text-slate-500 hover:text-rose-400 transition"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="p-5 overflow-y-auto">${bodyHtml}</div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.addEventListener("click", (e) => { if (e.target === wrap) closeModal(); });
};

window.closeModal = function () {
  const m = document.getElementById("app-modal");
  if (m) m.remove();
};

/* --------------------------------- Boot ----------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  buildSidebar();
  checkExistingSession();
});
