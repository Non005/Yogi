/**
 * YOGI MANAGEMENT SYSTEM — Leaders Logic
 * File: js/leaders.js  
 */

async function renderLeaders(page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = "ဦးဆောင်ဆွေးနွေး ယောဂီများ";

  window.toggleLoading(true);
  let data = { rows: [], total: 0, activeTotal: 0, activeMale: 0, activeFemale: 0 };
  try {
    const res = await window.callApi("getLeaderData", { page, searchVal, limit: 25 });
    if (res.success && res.data) {
      data = res.data;
    }
  } catch (e) {
    console.error("getLeaderData Error:", e);
  } finally {
    window.toggleLoading(false);
  }

  const rows = data.rows || [];

  container.innerHTML = `
    <div class="space-y-6 view-panel">
      <!-- Banner -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e1626] border border-slate-800/80 p-4 rounded-2xl shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shrink-0">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h2 class="text-base md:text-lg font-black text-slate-100">ဦးဆောင်ဆွေးနွေး ယောဂီများ</h2>
            <p class="text-[11px] font-semibold text-slate-400">ဦးဆောင်ယောဂီများ စီမံခန့်ခွဲမှု စာမျက်နှာ</p>
          </div>
        </div>
        <button onclick="openAddLeaderModal()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95">
          <i class="fa-solid fa-plus text-sm"></i> <span>ဦးဆောင်ယောဂီ အသစ်ထည့်မည်</span>
        </button>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stats-card">
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <p>TOTAL LEADERS</p>
            <h3 class="text-indigo-400">${data.activeTotal || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i class="fa-solid fa-mars"></i>
          </div>
          <div>
            <p>MALE LEADERS</p>
            <h3 class="text-indigo-400">${data.activeMale || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <i class="fa-solid fa-venus"></i>
          </div>
          <div>
            <p>FEMALE LEADERS</p>
            <h3 class="text-pink-400">${data.activeFemale || 0} ဦး</h3>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1626] p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
        <div class="relative w-full sm:w-80">
          <input type="text" id="leader-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerLeaderSearch()"
            placeholder="အမည် / ဖုန်း ရှာဖွေရန်..." 
            class="w-full pl-9 pr-3 py-2 bg-[#070a12] border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        </div>
        <button onclick="renderLeaders(1, '')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition">
          <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
        </button>
      </div>

      <!-- Leader Table -->
      <div class="bg-[#0e1626] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl table-container">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#070b16] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th class="p-3">စဉ် / ရက်စွဲ</th>
                <th class="p-3">အမည်</th>
                <th class="p-3 text-center">အသက်</th>
                <th class="p-3 text-center">ကျား/မ</th>
                <th class="p-3">ဖုန်းနံပါတ်</th>
                <th class="p-3">နေရပ်လိပ်စာ</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-center sticky right-0">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${rows.length > 0 ? rows.map((l, idx) => `
                <tr class="hover:bg-slate-800/40 transition-colors ${l.status === 'Inactive' ? 'opacity-50 bg-slate-900/40' : ''}">
                  <td class="p-3 font-mono text-slate-400 whitespace-nowrap">
                    <span class="text-slate-500 font-bold mr-1">#${(page - 1) * 25 + idx + 1}</span>
                    <span>${l.regDate || '-'}</span>
                  </td>
                  <td class="p-3 font-bold text-slate-100 whitespace-nowrap">${window.escapeHtml(l.name)}</td>
                  <td class="p-3 text-center font-mono">${l.age || '-'}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${l.gender === 'ကျား' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}">
                      ${l.gender || 'ကျား'}
                    </span>
                  </td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${l.phone || '-'}</td>
                  <td class="p-3 text-slate-300 max-w-[200px] truncate" title="${window.escapeHtml(l.address)}">${window.escapeHtml(l.address) || '-'}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="toggleLeaderStatus(${l.id}, '${l.status}')"
                      class="px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${l.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'}">
                      <i class="fa-solid ${l.status === 'Active' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${l.status}
                    </button>
                  </td>
                  <td class="p-3 text-center whitespace-nowrap sticky right-0 bg-[#0e1626]">
                    <button onclick="deleteLeader(${l.id})" 
                      class="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition inline-flex items-center justify-center" 
                      title="ဖျက်ပါ">
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    <i class="fa-solid fa-user-tie text-4xl mb-3 text-slate-700 block"></i>
                    <p class="font-bold text-slate-400 text-xs">ဦးဆောင်ယောဂီ စာရင်း မရှိသေးပါ။</p>
                    <p class="text-[11px] text-slate-600 mt-1">"ဦးဆောင်ယောဂီ အသစ်ထည့်မည်" ကို နှိပ်၍ စာရင်းထည့်သွင်းပါ။</p>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function triggerLeaderSearch() {
  const input = document.getElementById("leader-search-input");
  if (input) {
    renderLeaders(1, input.value.trim());
  }
}

async function toggleLeaderStatus(id, currentStatus) {
  window.toggleLoading(true);
  try {
    const res = await window.callApi("toggleLeaderStatus", { id });
    if (res.success) {
      window.showToast("SUCCESS", res.message || "Status ပြောင်းလဲပြီးပါပြီ။");
      renderLeaders();
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

async function deleteLeader(id) {
  if (!confirm("ဤဦးဆောင်ယောဂီ စာရင်းကို ဖျက်ရန် သေချာပါသလား။")) return;
  window.toggleLoading(true);
  try {
    const res = await window.callApi("deleteLeader", { id });
    if (res.success) {
      window.showToast("SUCCESS", "ဖျက်ပြီးပါပြီ။");
      renderLeaders();
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

function openAddLeaderModal() {
  const name = prompt("ဦးဆောင်ယောဂီ အမည် ရိုက်ထည့်ပါ:");
  if (!name || !name.trim()) return;
  const phone = prompt("ဖုန်းနံပါတ်:") || "";
  const isMale = confirm("ကျား (OK) သို့မဟုတ် မ (Cancel) ရွေးပါ");
  const gender = isMale ? "ကျား" : "မ";

  window.toggleLoading(true);
  window.callApi("saveLeader", {
    name: name.trim(),
    phone: phone.trim(),
    gender,
    regDate: new Date().toISOString().slice(0, 10)
  }).then(res => {
    if (res.success) {
      window.showToast("SUCCESS", "ဦးဆောင်ယောဂီ အသစ် သိမ်းဆည်းပြီးပါပြီ။");
      renderLeaders();
    } else {
      window.showToast("ERROR", res.message || "သိမ်းဆည်း၍ မရပါ။");
    }
  }).finally(() => {
    window.toggleLoading(false);
  });
}

window.renderLeaders = renderLeaders;
window.toggleLeaderStatus = toggleLeaderStatus;
window.deleteLeader = deleteLeader;
window.openAddLeaderModal = openAddLeaderModal;
