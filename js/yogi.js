/**
 * YOGI MANAGEMENT SYSTEM — Yogi View Rendering
 * File: js/yogi.js
 */

async function renderYogiStage(stageId, page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || {
    id: stageId, name: `အဆင့် (${stageId})`, icon: "fa-dharmachakra", color: "amber"
  };

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = stageInfo.name;

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
            <h2 class="text-base md:text-lg font-black text-slate-100">${stageInfo.name}</h2>
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
                <th class="p-3">စဉ် / ရက်စွဲ</th>
                <th class="p-3">အမည်</th>
                <th class="p-3 text-center">အသက်</th>
                <th class="p-3 text-center">ကျား/မ</th>
                <th class="p-3">ဖုန်းနံပါတ်</th>
                <th class="p-3">နေရပ်လိပ်စာ</th>
                <th class="p-3">မိတ်ဆက်ယောဂီ</th>
                <th class="p-3 text-center">အဆင့် / Status</th>
                <th class="p-3 text-center sticky right-0">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${rows.length > 0 ? rows.map((y, idx) => `
                <tr class="hover:bg-slate-800/40 transition-colors ${y.status === 'Inactive' ? 'opacity-50 bg-slate-900/40' : ''}">
                  <td class="p-3 font-mono text-slate-400 whitespace-nowrap">
                    <span class="text-slate-500 font-bold mr-1">#${(page - 1) * 25 + idx + 1}</span>
                    <span>${y.regDate || '-'}</span>
                  </td>
                  <td class="p-3 font-bold text-slate-100 whitespace-nowrap">${window.escapeHtml(y.name)}</td>
                  <td class="p-3 text-center font-mono">${y.age || '-'}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${y.gender === 'ကျား' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}">
                      ${y.gender || 'ကျား'}
                    </span>
                  </td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${y.phone || '-'}</td>
                  <td class="p-3 text-slate-300 max-w-[180px] truncate" title="${window.escapeHtml(y.address)}">${window.escapeHtml(y.address) || '-'}</td>
                  <td class="p-3 text-slate-400 max-w-[140px] truncate">${window.escapeHtml(y.introducer) || '-'}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="toggleYogiStatus(${y.id}, '${y.status}', ${stageId})"
                      class="px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${y.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'}">
                      <i class="fa-solid ${y.status === 'Active' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${y.status}
                    </button>
                  </td>
                  <td class="p-3 text-center whitespace-nowrap sticky right-0 bg-[#0e1626]">
                    <div class="flex items-center justify-center gap-1.5">
                      ${stageId < 7 ? `
                        <button onclick="postYogiToNextStage(${y.id}, ${stageId})" 
                          class="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition flex items-center justify-center" 
                          title="နောက်အဆင့်သို့ တိုးမြှင့်မည် (Post)">
                          <i class="fa-solid fa-angles-right text-xs"></i>
                        </button>
                      ` : ''}
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
                  <td colspan="9" class="text-center py-12 text-slate-500">
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

function triggerYogiSearch(stageId) {
  const input = document.getElementById("yogi-search-input");
  if (input) {
    renderYogiStage(stageId, 1, input.value.trim());
  }
}

async function toggleYogiStatus(id, currentStatus, stageId) {
  window.toggleLoading(true);
  try {
    const res = await window.callApi("toggleYogiStatus", { id });
    if (res.success) {
      window.showToast("SUCCESS", res.message || "Status ပြောင်းလဲပြီးပါပြီ။");
      renderYogiStage(stageId);
    } else {
      window.showToast("ERROR", res.message || "Status ပြောင်းလဲ၍ မရပါ။");
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

async function postYogiToNextStage(id, stageId) {
  if (!confirm("ဤယောဂီအား နောက်တစ်ဆင့်သို့ တိုးမြှင့် (Post) ရန် သေချာပါသလား။")) return;
  window.toggleLoading(true);
  try {
    const res = await window.callApi("postYogi", { id });
    if (res.success) {
      window.showToast("SUCCESS", res.message || "နောက်တစ်ဆင့်သို့ အောင်မြင်စွာ ရောက်ရှိသွားပါပြီ။");
      renderYogiStage(stageId);
    } else {
      window.showToast("ERROR", res.message || "Post လုပ်၍ မရပါ။");
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

async function deleteYogi(id, stageId) {
  if (!confirm("ဤယောဂီစာရင်းကို ဖျက်ရန် သေချာပါသလား။")) return;
  window.toggleLoading(true);
  try {
    const res = await window.callApi("deleteYogi", { id });
    if (res.success) {
      window.showToast("SUCCESS", "ဖျက်ပြီးပါပြီ။");
      renderYogiStage(stageId);
    } else {
      window.showToast("ERROR", res.message || "ဖျက်၍ မရပါ။");
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

function openAddYogiModal(stageId) {
  const name = prompt("ယောဂီအမည် ရိုက်ထည့်ပါ:");
  if (!name || !name.trim()) return;
  const phone = prompt("ဖုန်းနံပါတ်:") || "";
  const isMale = confirm("ကျား (OK) သို့မဟုတ် မ (Cancel) ရွေးပါ");
  const gender = isMale ? "ကျား" : "မ";

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
    } else {
      window.showToast("ERROR", res.message || "သိမ်းဆည်း၍ မရပါ။");
    }
  }).finally(() => {
    window.toggleLoading(false);
  });
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

      const rows = json.map(r => ({
        name: r["အမည်"] || r["Name"],
        age: r["အသက်"] || r["Age"] || "",
        phone: r["ဖုန်းနံပါတ်"] || r["Phone"] || "",
        address: r["နေရပ်လိပ်စာ"] || r["Address"] || "",
        introducer: r["မိတ်ဆက်ယောဂီ"] || r["Introducer"] || "",
        email: r["EMAIL"] || r["Email"] || "",
        gender: (r["GENDER"] || r["Gender"] || "ကျား").includes("မ") ? "မ" : "ကျား",
        regDate: r["ရက်စွဲ"] || new Date().toISOString().slice(0, 10)
      })).filter(r => r.name);

      if (rows.length === 0) {
        window.showToast("ERROR", "Excel ဖိုင်ထဲတွင် ဒေတာမရှိပါ သို့မဟုတ် ခေါင်းစဉ်များ မှားယွင်းနေပါသည်။");
        return;
      }

      window.toggleLoading(true);
      window.callApi("importYogi", { level: stageId, rows }).then(res => {
        if (res.success) {
          window.showToast("SUCCESS", `${res.count || rows.length} ဦး Import အောင်မြင်ပါသည်။`);
          renderYogiStage(stageId);
        } else {
          window.showToast("ERROR", res.message || "Import မအောင်မြင်ပါ။");
        }
      }).finally(() => {
        window.toggleLoading(false);
      });
    } catch (err) {
      window.showToast("ERROR", "Excel ဖိုင်ဖတ်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။");
    }
  };
  reader.readAsArrayBuffer(file);
}

// Global Export with Aliases
window.renderYogiStage = renderYogiStage;
window.renderLevelPage = renderYogiStage; // 💡 Alias
window.toggleYogiStatus = toggleYogiStatus;
window.postYogiToNextStage = postYogiToNextStage;
window.deleteYogi = deleteYogi;
window.openAddYogiModal = openAddYogiModal;
window.handleExcelImport = handleExcelImport;
