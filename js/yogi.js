/**
 * YOGI MANAGEMENT SYSTEM — Yogi View Rendering & Actions
 * File: js/yogi.js
 */

// 💡 Auto Gender Detection Logic
function detectGenderByName(name) {
  const str = String(name || "").trim();
  if (/^(ဒေါ်|မ|နော်|မိ|ဆရာမ|Ma|Daw|Nan)\b/i.test(str) || str.startsWith("ဒေါ်") || str.startsWith("မ")) {
    return "မ";
  }
  if (/^(ဦး|ကို|စော|မောင်|ဆရာ|U|Mg|Ko|Saw)\b/i.test(str) || str.startsWith("ဦး") || str.startsWith("ကို")) {
    return "ကျား";
  }
  return "ကျား"; // Default fallback
}

async function renderYogiStage(stageId, page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || {
    id: stageId, name: `အဆင့် (${stageId})`, icon: "fa-dharmachakra", color: "amber"
  };

  // 💡 Safe primitive string assignment (Fixes [object HTMLDivElement])
  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = String(stageInfo.name || "ယောဂီစာရင်း");

  window.toggleLoading(true);
  let data = { rows: [], total: 0, activeTotal: 0, activeMale: 0, activeFemale: 0 };
  try {
    const res = await window.callApi("getYogiData", { level: stageId, page, searchVal, limit: 25 });
    if (res.success && res.data) {
      data = res.data;
    }
  } catch (err) {
    console.error("getYogiData Error:", err);
  } finally {
    window.toggleLoading(false);
  }

  const rows = data.rows || [];

  container.innerHTML = `
    <div class="space-y-6 view-panel">
      <!-- Title & Icon Banner -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e1626] border border-slate-800/80 p-4 rounded-2xl shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
            <i class="fa-solid ${stageInfo.icon || 'fa-dharmachakra'}"></i>
          </div>
          <div>
            <h2 class="text-base md:text-lg font-black text-slate-100">${window.escapeHtml(stageInfo.name)}</h2>
            <p class="text-[11px] font-semibold text-slate-400">ယောဂီများ စီမံခန့်ခွဲမှု စာမျက်နှာ</p>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onclick="openAddYogiModal(${stageId})" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95">
            <i class="fa-solid fa-plus text-sm"></i> <span>ယောဂီအသစ်ထည့်မည်</span>
          </button>
          <label class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs cursor-pointer flex items-center gap-2 transition active:scale-95">
            <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i> <span class="hidden sm:inline">Excel Import</span>
            <input type="file" accept=".xlsx, .xls, .csv" class="hidden" onchange="handleExcelImport(event, ${stageId})">
          </label>
        </div>
      </div>

      <!-- KPI Cards Grid (3 Columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stats-card">
          <div class="bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <p>TOTAL ACTIVE</p>
            <h3 class="text-amber-400">${data.activeTotal || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i class="fa-solid fa-mars"></i>
          </div>
          <div>
            <p>ACTIVE MALE</p>
            <h3 class="text-indigo-400">${data.activeMale || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <i class="fa-solid fa-venus"></i>
          </div>
          <div>
            <p>ACTIVE FEMALE</p>
            <h3 class="text-pink-400">${data.activeFemale || 0} ဦး</h3>
          </div>
        </div>
      </div>

      <!-- Search & Refresh Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1626] p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
        <div class="relative w-full sm:w-80">
          <input type="text" id="yogi-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerYogiSearch(${stageId})"
            placeholder="အမည် / ဖုန်း / လိပ်စာ ရှာဖွေရန်..." 
            class="w-full pl-9 pr-3 py-2 bg-[#070a12] border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        </div>
        
        <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <button onclick="renderYogiStage(${stageId}, 1, '')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
          </button>
          <div class="text-xs font-bold text-slate-400 whitespace-nowrap">
            စုစုပေါင်း: <span class="text-amber-400 font-black">${data.total || 0}</span> ဦး
          </div>
        </div>
      </div>

      <!-- Table Container (Header ALWAYS Visible) -->
      <div class="bg-[#0e1626] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl table-container">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#070b16] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th class="p-3">စဉ်</th>
                <th class="p-3">ရက်စွဲ</th>
                <th class="p-3">အမည်</th>
                <th class="p-3 text-center">အသက်</th>
                <th class="p-3 font-mono">ဖုန်းနံပါတ်</th>
                <th class="p-3">နေရပ်လိပ်စာ</th>
                <th class="p-3">မိတ်ဆက်ယောဂီ</th>
                <th class="p-3">EMAIL</th>
                <th class="p-3 text-center">GENDER</th>
                <th class="p-3">CREATED BY</th>
                <th class="p-3">CREATED AT</th>
                <th class="p-3 font-mono">UNIQUEID</th>
                <th class="p-3 text-center">STATUS</th>
                <th class="p-3 text-center sticky right-0">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${rows.length > 0 ? rows.map((y, idx) => `
                <tr class="hover:bg-slate-800/40 transition-colors ${y.status === 'Inactive' ? 'opacity-40 bg-slate-950/80 grayscale' : ''}">
                  <td class="p-3 font-mono text-slate-400 font-bold">#${(page - 1) * 25 + idx + 1}</td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${y.regDate || '-'}</td>
                  <td class="p-3 font-bold text-slate-100 whitespace-nowrap">${window.escapeHtml(y.name)}</td>
                  <td class="p-3 text-center font-mono">${y.age || '-'}</td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${y.phone || '-'}</td>
                  <td class="p-3 text-slate-300 max-w-[180px] truncate" title="${window.escapeHtml(y.address)}">${window.escapeHtml(y.address) || '-'}</td>
                  <td class="p-3 text-slate-400 max-w-[140px] truncate">${window.escapeHtml(y.introducer) || '-'}</td>
                  <td class="p-3 text-slate-400 font-mono text-[11px]">${y.email || '-'}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${y.gender === 'ကျား' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}">
                      ${y.gender || 'ကျား'}
                    </span>
                  </td>
                  <td class="p-3 text-slate-400 text-[11px]">${y.createdBy || 'System'}</td>
                  <td class="p-3 font-mono text-slate-500 text-[10px]">${y.createdAt ? y.createdAt.slice(0, 10) : '-'}</td>
                  <td class="p-3 font-mono text-amber-400/80 text-[10px]">${y.uniqueId || '-'}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="toggleYogiStatus(${y.id}, '${y.status}', ${stageId})"
                      class="px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${y.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'}">
                      <i class="fa-solid ${y.status === 'Active' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${y.status}
                    </button>
                  </td>
                  <td class="p-3 text-center whitespace-nowrap sticky right-0 bg-[#0e1626]">
                    <div class="flex items-center justify-center gap-1.5">
                      <button onclick="postYogiToNextStage(${y.id}, ${stageId})" 
                        class="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition flex items-center justify-center" 
                        title="${stageId === 7 ? 'ယောဂီ စာရင်းဟောင်းသို့ ရွှေ့မည်' : 'နောက်အဆင့်သို့ တိုးမြှင့်မည် (Post)'}">
                        <i class="fa-solid fa-angles-right text-xs"></i>
                      </button>
                      <button onclick="deleteYogi(${y.id}, ${stageId})" 
                        class="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition flex items-center justify-center" 
                        title="ဖျက်ပါ">
                        <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="14" class="text-center py-12 text-slate-500">
                    <i class="fa-solid fa-inbox text-4xl mb-3 text-slate-700 block"></i>
                    <p class="font-bold text-slate-400 text-xs">ယောဂီစာရင်း မရှိသေးပါ။</p>
                    <p class="text-[11px] text-slate-600 mt-1">"ယောဂီအသစ်ထည့်မည်" သို့မဟုတ် "Excel Import" မှတစ်ဆင့် ထည့်သွင်းပါ။</p>
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

/* --------------------------- Total Summary Rollup View --------------------------- */

async function renderTotalSummary() {
  const container = document.getElementById("view-container");
  if (!container) return;

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = "ယောဂီ စုစုပေါင်း စာရင်း";

  window.toggleLoading(true);
  let groups = [];
  let stats = { totalActive: 0, activeMale: 0, activeFemale: 0 };

  try {
    const res = await window.callApi("getTotalListData");
    const dashRes = await window.callApi("getDashboardData");
    if (res.success && res.data) groups = res.data;
    if (dashRes.success && dashRes.data) stats = dashRes.data;
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }

  let html = `
    <div class="space-y-6 view-panel">
      <!-- Top 3 KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stats-card">
          <div class="bg-amber-500/10 text-amber-400 border border-amber-500/20"><i class="fa-solid fa-users"></i></div>
          <div><p>TOTAL ACTIVE</p><h3 class="text-amber-400">${stats.totalActive || 0} ဦး</h3></div>
        </div>
        <div class="stats-card">
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><i class="fa-solid fa-mars"></i></div>
          <div><p>ACTIVE MALE</p><h3 class="text-indigo-400">${stats.activeMale || 0} ဦး</h3></div>
        </div>
        <div class="stats-card">
          <div class="bg-pink-500/10 text-pink-400 border border-pink-500/20"><i class="fa-solid fa-venus"></i></div>
          <div><p>ACTIVE FEMALE</p><h3 class="text-pink-400">${stats.activeFemale || 0} ဦး</h3></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between bg-[#0e1626] p-3.5 rounded-2xl border border-slate-800/80">
        <h3 class="font-extrabold text-sm text-slate-100 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-amber-400"></i> အဆင့် ၁ မှ ၇ အထိ Active ယောဂီ အကျဉ်းချုပ် စာရင်း
        </h3>
        <button onclick="renderTotalSummary()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5">
          <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
        </button>
      </div>

      <!-- Grouped Tables per Stage -->
      <div class="space-y-6">
  `;

  groups.forEach(g => {
    const rows = g.rows || [];
    html += `
      <div class="bg-[#0e1626] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div class="bg-[#070b16] p-3.5 border-b border-slate-800 flex items-center justify-between">
          <h4 class="font-black text-xs text-amber-400 flex items-center gap-2">
            <span class="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px]">${g.level}</span>
            <span>${g.name}</span>
          </h4>
          <span class="text-xs text-slate-400 font-bold">Active: <b class="text-slate-100">${rows.length}</b> ဦး</span>
        </div>
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          ${rows.length > 0 ? rows.map((r, idx) => `
            <div class="bg-[#080e1a] border border-slate-800/60 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200">${idx + 1}။ ${window.escapeHtml(r.name)}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded ${r.gender === 'ကျား' ? 'text-indigo-400 bg-indigo-500/10' : 'text-pink-400 bg-pink-500/10'}">${r.gender}</span>
            </div>
          `).join('') : `<p class="text-xs text-slate-500 col-span-full italic">ဤအဆင့်တွင် စာရင်းမရှိသေးပါ။</p>`}
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

function triggerYogiSearch(stageId) {
  const input = document.getElementById("yogi-search-input");
  if (input) renderYogiStage(stageId, 1, input.value.trim());
}

async function toggleYogiStatus(id, currentStatus, stageId) {
  window.toggleLoading(true);
  try {
    const res = await window.callApi("toggleYogiStatus", { id });
    if (res.success) {
      window.showToast("SUCCESS", res.message || "Status ပြောင်းလဲပြီးပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { console.error(e); } finally { window.toggleLoading(false); }
}

async function postYogiToNextStage(id, stageId) {
  const isLast = stageId === 7;
  const msg = isLast ? "ဤယောဂီအား 'ယောဂီ စာရင်းဟောင်း' သို့ ရွှေ့ရန် သေချာပါသလား။" : "ဤယောဂီအား နောက်တစ်ဆင့်သို့ တိုးမြှင့် (Post) ရန် သေချာပါသလား။";
  if (!confirm(msg)) return;

  window.toggleLoading(true);
  try {
    const res = await window.callApi("postYogi", { id });
    if (res.success) {
      window.showToast("SUCCESS", res.message || "အောင်မြင်စွာ ဆောင်ရွက်ပြီးပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { console.error(e); } finally { window.toggleLoading(false); }
}

async function deleteYogi(id, stageId) {
  if (!confirm("ဤယောဂီစာရင်းကို ဖျက်ရန် သေချာပါသလား။")) return;
  window.toggleLoading(true);
  try {
    const res = await window.callApi("deleteYogi", { id });
    if (res.success) {
      window.showToast("SUCCESS", "ဖျက်ပြီးပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { console.error(e); } finally { window.toggleLoading(false); }
}

function openAddYogiModal(stageId) {
  const name = prompt("ယောဂီအမည် ရိုက်ထည့်ပါ:");
  if (!name || !name.trim()) return;
  
  const phone = prompt("ဖုန်းနံပါတ်:") || "";
  const detectedGender = detectGenderByName(name.trim());
  const genderPrompt = confirm(`ယောဂီအမည်အရ ကျား/မ ခန့်မှန်းချက်မှာ [ ${detectedGender} ] ဖြစ်ပါသည်။ ကျား (OK) / မ (Cancel) ရွေးပါ`);
  const gender = genderPrompt ? "ကျား" : "မ";

  window.toggleLoading(true);
  window.callApi("saveYogi", {
    level: stageId,
    name: name.trim(),
    phone: phone.trim(),
    gender,
    regDate: new Date().toISOString().slice(0, 10)
  }).then(res => {
    if (res.success) {
      window.showToast("SUCCESS", "ယောဂီအသစ် သိမ်းဆည်းပြီးပါပြီ။");
      renderYogiStage(stageId);
    }
  }).finally(() => { window.toggleLoading(false); });
}

function handleExcelImport(e, stageId) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet);

      const rows = json.map(r => {
        const nameVal = r["အမည်"] || r["Name"] || "";
        return {
          name: nameVal,
          age: r["အသက်"] || r["Age"] || "",
          phone: r["ဖုန်းနံပါတ်"] || r["Phone"] || "",
          address: r["နေရပ်လိပ်စာ"] || r["Address"] || "",
          introducer: r["မိတ်ဆက်ယောဂီ"] || r["Introducer"] || "",
          email: r["EMAIL"] || r["Email"] || "",
          gender: r["GENDER"] || r["Gender"] || detectGenderByName(nameVal),
          regDate: r["ရက်စွဲ"] || new Date().toISOString().slice(0, 10)
        };
      }).filter(r => r.name);

      if (rows.length === 0) {
        window.showToast("ERROR", "Excel ဖိုင်ထဲတွင် ဒေတာမရှိပါ သို့မဟုတ် ခေါင်းစဉ်များ မှားယွင်းနေပါသည်။");
        return;
      }

      window.toggleLoading(true);
      window.callApi("importYogi", { level: stageId, rows }).then(res => {
        if (res.success) {
          window.showToast("SUCCESS", `${res.count || rows.length} ဦး Import အောင်မြင်ပါသည်။`);
          renderYogiStage(stageId);
        }
      }).finally(() => { window.toggleLoading(false); });
    } catch (err) {
      window.showToast("ERROR", "Excel ဖိုင်ဖတ်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။");
    }
  };
  reader.readAsArrayBuffer(file);
}

// Global Exports
window.renderYogiStage = renderYogiStage;
window.renderLevelPage = renderYogiStage;
window.renderTotalSummary = renderTotalSummary;
window.toggleYogiStatus = toggleYogiStatus;
window.postYogiToNextStage = postYogiToNextStage;
window.deleteYogi = deleteYogi;
window.openAddYogiModal = openAddYogiModal;
window.handleExcelImport = handleExcelImport;
