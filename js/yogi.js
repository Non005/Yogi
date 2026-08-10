/**
 * YOGI MANAGEMENT SYSTEM — Yogi View Rendering & Actions
 * File: js/yogi.js
 */

// 💡 Helper: Auto Gender Detection Logic based on Name Prefix
function detectGenderByName(name) {
  const str = String(name || "").trim();
  // Check for Male prefixes: "ဦး", "ကို", "မောင်", "စော", "ဆရာ", "U", "Mg", "Ko", "Saw"
  if (/^(ဦး|ကို|မောင်|စော|ဆရာ|U|Mg|Ko|Saw)\b/i.test(str) || str.startsWith("ဦး") || str.startsWith("ကို") || str.startsWith("မောင်")) {
    return "ကျား";
  }
  // Check for Female prefixes: "ဒေါ်", "မ", "နော်", "မိ", "ဆရာမ", "Ma", "Daw", "Nan"
  if (/^(ဒေါ်|မ|နော်|မိ|ဆရာမ|Ma|Daw|Nan)\b/i.test(str) || str.startsWith("ဒေါ်") || str.startsWith("မ")) {
    return "မ";
  }
  return "ကျား"; // Default fallback
}

// 💡 Helper: Format Date dd-mm-yyyy
function getFormattedToday() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Main Stage View Renderer (Supports Stage 1 to 7 + Stage 8 Alumni)
 */
async function renderYogiStage(stageId, page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || {
    id: stageId, 
    name: stageId === 8 ? "ယောဂီ စာရင်းဟောင်း" : `အဆင့် (${stageId})`, 
    icon: stageId === 8 ? "fa-box-archive" : "fa-dharmachakra", 
    color: "amber"
  };

  // Set Page Title
  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = String(stageInfo.name || "ယောဂီစာရင်း");

  window.toggleLoading(true);
  let data = { rows: [], total: 0, activeTotal: 0, activeMale: 0, activeFemale: 0 };
  try {
    const res = await window.callApi("getYogiData", { level: stageId, page, searchVal, limit: 1000 });
    if (res.success && res.data) {
      data = res.data;
    }
  } catch (err) {
    console.error("getYogiData Error:", err);
  } finally {
    window.toggleLoading(false);
  }

  const rawRows = data.rows || [];

  // 💡 SORTING LOGIC: Active rows at TOP, Inactive rows pushed to BOTTOM
  const sortedRows = [...rawRows].sort((a, b) => {
    if (a.status === 'Active' && b.status === 'Inactive') return -1;
    if (a.status === 'Inactive' && b.status === 'Active') return 1;
    return 0;
  });

  container.innerHTML = `
    <div class="space-y-5 view-panel">
      <!-- Top 3 KPI Cards -->
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

      <!-- Action Control Bar (Search, Refresh, Export, +Add New) -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0e172a] p-3.5 rounded-2xl border border-amber-500/20 shadow-md">
        <div class="relative w-full md:w-80">
          <input type="text" id="yogi-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerYogiSearch(${stageId})"
            placeholder="အမည် / ဖုန်း / လိပ်စာ ရှာဖွေရန်..." 
            class="w-full pl-9 pr-3 py-2 bg-[#070a12] border border-amber-500/30 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        </div>
        
        <div class="flex flex-wrap items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
          <button onclick="renderYogiStage(${stageId}, 1, '')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition active:scale-95" title="ပြန်လည်ရယူပါ">
            <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
          </button>

          <button onclick="exportYogiToExcel(${stageId})" class="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95" title="Excel ထုတ်ယူမည်">
            <i class="fa-solid fa-file-excel text-xs"></i> <span>Export Excel</span>
          </button>

          <label class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95">
            <i class="fa-solid fa-file-import text-amber-400 text-xs"></i> <span>Import</span>
            <input type="file" accept=".xlsx, .xls, .csv" class="hidden" onchange="handleExcelImport(event, ${stageId})">
          </label>

          <button onclick="openYogiModal(${stageId})" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95">
            <i class="fa-solid fa-plus text-xs"></i> <span>+ Add New</span>
          </button>
        </div>
      </div>

      <!-- Table Container (14 Columns Exact) -->
      <div class="bg-[#0e172a] border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th>စဉ်</th>
                <th>ရက်စွဲ</th>
                <th>အမည်</th>
                <th class="text-center">အသက်</th>
                <th class="font-mono">ဖုန်းနံပါတ်</th>
                <th>နေရပ်လိပ်စာ</th>
                <th>မိတ်ဆက်ယောဂီ</th>
                <th>EMAIL</th>
                <th class="text-center">GENDER</th>
                <th>CREATED BY</th>
                <th>CREATED AT</th>
                <th class="font-mono">UNIQUEID</th>
                <th class="text-center">STATUS</th>
                <th class="text-center sticky right-0">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${sortedRows.length > 0 ? sortedRows.map((y, idx) => `
                <tr class="${y.status === 'Inactive' ? 'row-inactive' : 'row-active'}">
                  <td class="p-3 font-mono text-amber-400/80 font-bold">#${idx + 1}</td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${y.regDate || '-'}</td>
                  <td class="p-3 font-extrabold text-slate-100 whitespace-nowrap">${window.escapeHtml(y.name)}</td>
                  <td class="p-3 text-center font-mono">${y.age || '-'}</td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${y.phone || '-'}</td>
                  <td class="p-3 text-slate-300 max-w-[180px] truncate" title="${window.escapeHtml(y.address)}">${window.escapeHtml(y.address) || '-'}</td>
                  <td class="p-3 text-slate-400 max-w-[140px] truncate">${window.escapeHtml(y.introducer) || '-'}</td>
                  <td class="p-3 text-slate-400 font-mono text-[11px]">${y.email || '-'}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${y.gender === 'ကျား' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}">
                      ${y.gender || 'ကျား'}
                    </span>
                  </td>
                  <td class="p-3 text-slate-400 text-[11px]">${y.createdBy || 'System'}</td>
                  <td class="p-3 font-mono text-slate-400 text-[10px]">${y.createdAt ? y.createdAt.slice(0, 10) : '-'}</td>
                  <td class="p-3 font-mono text-amber-400/90 text-[10px]">${y.uniqueId || '-'}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-lg font-extrabold text-[10px] ${y.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}">
                      ${y.status || 'Active'}
                    </span>
                  </td>
                  <td class="p-3 text-center whitespace-nowrap sticky right-0 bg-[#0e172a]">
                    <div class="flex items-center justify-center gap-1.5 font-sans">
                      <!-- Edit -->
                      <button onclick="openYogiModal(${stageId}, ${JSON.stringify(y).replace(/"/g, '&quot;')})" 
                        class="btn-action btn-action-edit" title="ပြင်ဆင်မည်">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>

                      <!-- Post -->
                      <button onclick="postYogiToNextStage(${y.id}, ${stageId})" 
                        class="btn-action btn-action-post" 
                        title="${stageId === 7 ? 'ယောဂီ စာရင်းဟောင်းသို့ ရွှေ့မည် (Post)' : 'နောက်အဆင့်သို့ တိုးမြှင့်မည် (Post)'}">
                        <i class="fa-solid fa-paper-plane"></i> <span>Post</span>
                      </button>

                      <!-- Active / Inactive Toggle -->
                      <button onclick="toggleYogiStatus(${y.id}, '${y.status}', ${stageId})" 
                        class="btn-action ${y.status === 'Active' ? 'btn-action-inactive' : 'btn-action-active'}" 
                        title="${y.status === 'Active' ? 'Inactive ပြုလုပ်ပြီး အောက်သို့ ရွှေ့မည်' : 'Active ပြုလုပ်ပြီး ဒီနေ့ရက်စွဲဖြင့် အပေါ်သို့ ပို့မည်'}">
                        <i class="fa-solid ${y.status === 'Active' ? 'fa-user-xmark' : 'fa-user-check'}"></i>
                      </button>

                      <!-- Delete -->
                      <button onclick="deleteYogi(${y.id}, ${stageId})" 
                        class="btn-action btn-action-delete" title="ဖျက်ပါ">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="14" class="text-center py-12 text-slate-500">
                    <i class="fa-solid fa-inbox text-4xl mb-3 text-slate-700 block"></i>
                    <p class="font-bold text-slate-400 text-xs">ယောဂီစာရင်း မရှိသေးပါ။</p>
                    <p class="text-[11px] text-slate-600 mt-1">"+ Add New" သို့မဟုတ် "Import" မှတစ်ဆင့် စာရင်းထည့်သွင်းပါ။</p>
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

/**
 * Active / Inactive Toggle Logic
 * When toggled to Active -> Update Date to Today (dd-mm-yyyy) and move back to Top
 */
async function toggleYogiStatus(id, currentStatus, stageId) {
  window.toggleLoading(true);
  const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
  const newDate = getFormattedToday();

  try {
    const res = await window.callApi("toggleYogiStatus", { 
      id, 
      status: nextStatus,
      regDate: nextStatus === 'Active' ? newDate : undefined
    });

    if (res.success) {
      window.showToast("SUCCESS", nextStatus === 'Active' ? `Active ပြုလုပ်ပြီး ဒီနေ့ရက်စွဲ (${newDate}) ဖြင့် အပေါ်သို့ ပို့လိုက်ပါပြီ။` : "Inactive ပြုလုပ်ပြီး အောက်သို့ ရွှေ့လိုက်ပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { 
    console.error(e); 
  } finally { 
    window.toggleLoading(false); 
  }
}

/**
 * Post Yogi Logic:
 * Stage 1-6 -> Auto promote to next stage
 * Stage 7 (သိ-ပါယ်-ဆိုက်-ပွား) -> Move to Stage 8 (ယောဂီ စာရင်းဟောင်း)
 */
async function postYogiToNextStage(id, stageId) {
  const isLast = stageId === 7;
  const msg = isLast 
    ? "ဤယောဂီအား 'ယောဂီ စာရင်းဟောင်း (Alumni)' သို့ ရွှေ့ရန် သေချာပါသလား။" 
    : "ဤယောဂီအား နောက်တစ်ဆင့်သို့ တိုးမြှင့် (Post) ရန် သေချာပါသလား။";

  if (!confirm(msg)) return;

  window.toggleLoading(true);
  try {
    const res = await window.callApi("postYogi", { id, postDate: getFormattedToday() });
    if (res.success) {
      window.showToast("SUCCESS", isLast ? "ယောဂီ စာရင်းဟောင်းသို့ အောင်မြင်စွာ ရွှေ့လိုက်ပါပြီ။" : "နောက်တစ်ဆင့်သို့ အောင်မြင်စွာ တိုးမြှင့်လိုက်ပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { 
    console.error(e); 
  } finally { 
    window.toggleLoading(false); 
  }
}

/**
 * Delete Yogi
 */
async function deleteYogi(id, stageId) {
  if (!confirm("ဤယောဂီစာရင်းကို ဖျက်ရန် သေချာပါသလား။")) return;
  window.toggleLoading(true);
  try {
    const res = await window.callApi("deleteYogi", { id });
    if (res.success) {
      window.showToast("SUCCESS", "ဖျက်ပြီးပါပြီ။");
      renderYogiStage(stageId);
    }
  } catch (e) { 
    console.error(e); 
  } finally { 
    window.toggleLoading(false); 
  }
}

/**
 * Dynamic Modal Dialog for Adding or Editing Yogi
 */
function openYogiModal(stageId, existingData = null) {
  const isEdit = !!existingData;
  const today = getFormattedToday();
  const currentUser = window.AppState ? window.AppState.currentUser : 'Admin';

  const modalHtml = `
    <div id="yogi-modal-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-[#0e172a] border border-amber-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <h3 class="text-sm font-extrabold text-amber-400 flex items-center gap-2">
            <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-user-plus'}"></i>
            <span>${isEdit ? 'ယောဂီအချက်အလက် ပြင်ဆင်ရန်' : 'ယောဂီအသစ် ထည့်သွင်းရန်'}</span>
          </h3>
          <button onclick="closeYogiModal()" class="text-slate-400 hover:text-rose-400 p-1 rounded-lg">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <form id="yogi-form" onsubmit="saveYogiForm(event, ${stageId}, ${isEdit ? existingData.id : 'null'})" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-amber-200/80 mb-1">ယောဂီအမည် *</label>
            <input type="text" id="modal-name" required value="${isEdit ? window.escapeHtml(existingData.name) : ''}"
              onkeyup="autoDetectGenderModal()"
              placeholder="ဥပမာ - ဦးလှမောင် / မမြစိန်..."
              class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-amber-200/80 mb-1">ကျား/မ (GENDER) *</label>
              <select id="modal-gender" required class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400 font-bold">
                <option value="ကျား" ${isEdit && existingData.gender === 'ကျား' ? 'selected' : ''}>ကျား</option>
                <option value="မ" ${isEdit && existingData.gender === 'မ' ? 'selected' : ''}>မ</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-amber-200/80 mb-1">အသက်</label>
              <input type="number" id="modal-age" value="${isEdit ? (existingData.age || '') : ''}" placeholder="ဥပမာ - 45"
                class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400">
            </div>
          </div>

          <div>
            <label class="block font-bold text-amber-200/80 mb-1">ဖုန်းနံပါတ် (၂ လိုင်းအထိ ထည့်နိုင်သည်)</label>
            <input type="text" id="modal-phone" value="${isEdit ? window.escapeHtml(existingData.phone || '') : ''}" placeholder="09-123456789, 09-987654321"
              class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400 font-mono">
          </div>

          <div>
            <label class="block font-bold text-amber-200/80 mb-1">နေရပ်လိပ်စာ</label>
            <input type="text" id="modal-address" value="${isEdit ? window.escapeHtml(existingData.address || '') : ''}" placeholder="မြို့နယ် / မြို့..."
              class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-amber-200/80 mb-1">မိတ်ဆက်ယောဂီ</label>
              <input type="text" id="modal-introducer" value="${isEdit ? window.escapeHtml(existingData.introducer || '') : ''}" placeholder="အမည်..."
                class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400">
            </div>
            <div>
              <label class="block font-bold text-amber-200/80 mb-1">EMAIL</label>
              <input type="email" id="modal-email" value="${isEdit ? window.escapeHtml(existingData.email || '') : ''}" placeholder="example@mail.com"
                class="w-full p-2.5 bg-[#070a12] border border-amber-500/30 rounded-xl text-slate-100 outline-none focus:border-amber-400 font-mono">
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>ရက်စွဲ: <b class="text-amber-400 font-mono">${isEdit ? (existingData.regDate || today) : today}</b></span>
            <span>Created By: <b class="text-emerald-400">${isEdit ? (existingData.createdBy || currentUser) : currentUser}</b></span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" onclick="closeYogiModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">မလုပ်တော့ပါ</button>
            <button type="submit" class="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20">သိမ်းဆည်းမည်</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Append modal to body
  const existingModal = document.getElementById("yogi-modal-overlay");
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Auto-detect gender initial call
  if (!isEdit) autoDetectGenderModal();
}

function autoDetectGenderModal() {
  const nameEl = document.getElementById("modal-name");
  const genderEl = document.getElementById("modal-gender");
  if (nameEl && genderEl) {
    genderEl.value = detectGenderByName(nameEl.value);
  }
}

function closeYogiModal() {
  const modal = document.getElementById("yogi-modal-overlay");
  if (modal) modal.remove();
}

async function saveYogiForm(event, stageId, editId = null) {
  event.preventDefault();
  const name = document.getElementById("modal-name").value.trim();
  const gender = document.getElementById("modal-gender").value;
  const age = document.getElementById("modal-age").value.trim();
  const phone = document.getElementById("modal-phone").value.trim();
  const address = document.getElementById("modal-address").value.trim();
  const introducer = document.getElementById("modal-introducer").value.trim();
  const email = document.getElementById("modal-email").value.trim();

  if (!name) {
    window.showToast("ERROR", "ယောဂီအမည် ရိုက်ထည့်ပါ");
    return;
  }

  window.toggleLoading(true);
  try {
    const payload = {
      id: editId || undefined,
      level: stageId,
      name,
      gender,
      age,
      phone,
      address,
      introducer,
      email,
      regDate: getFormattedToday(),
      status: "Active"
    };

    const action = editId ? "updateYogi" : "saveYogi";
    const res = await window.callApi(action, payload);

    if (res.success) {
      window.showToast("SUCCESS", editId ? "ပြင်ဆင်ချက် သိမ်းဆည်းပြီးပါပြီ။" : "ယောဂီအသစ် သိမ်းဆည်းပြီးပါပြီ။");
      closeYogiModal();
      renderYogiStage(stageId);
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

/**
 * Excel Export Function
 */
function exportYogiToExcel(stageId) {
  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || { name: `Stage_${stageId}` };
  const table = document.querySelector("table");
  if (!table) return;

  try {
    const wb = XLSX.utils.table_to_book(table, { sheet: "YogiList" });
    XLSX.writeFile(wb, `${stageInfo.name}_Yogi_List.xlsx`);
    window.showToast("SUCCESS", "Excel ဒေါင်းလုဒ်ရယူပြီးပါပြီ။");
  } catch (e) {
    console.error(e);
    window.showToast("ERROR", "Excel ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။");
  }
}

function triggerYogiSearch(stageId) {
  const input = document.getElementById("yogi-search-input");
  if (input) renderYogiStage(stageId, 1, input.value.trim());
}

/**
 * Total Summary Rollup View
 */
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
      <div class="flex items-center justify-between bg-[#0e172a] p-3.5 rounded-2xl border border-amber-500/20 shadow-md">
        <h3 class="font-extrabold text-sm text-slate-100 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-amber-400"></i> အဆင့် ၁ မှ ၇ အထိ Active ယောဂီ အကျဉ်းချုပ် စာရင်း
        </h3>
        <button onclick="renderTotalSummary()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition active:scale-95">
          <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
        </button>
      </div>

      <!-- Grouped Tables per Stage -->
      <div class="space-y-6">
  `;

  groups.forEach(g => {
    const rows = g.rows || [];
    html += `
      <div class="bg-[#0e172a] border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div class="bg-[#070b16] p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <h4 class="font-black text-xs text-amber-400 flex items-center gap-2">
            <span class="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-mono font-extrabold">${g.level}</span>
            <span>${g.name}</span>
          </h4>
          <span class="text-xs text-slate-400 font-bold">Active: <b class="text-slate-100">${rows.length}</b> ဦး</span>
        </div>
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          ${rows.length > 0 ? rows.map((r, idx) => `
            <div class="bg-[#080e1a] border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span class="font-bold text-slate-200">${idx + 1}။ ${window.escapeHtml(r.name)}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold ${r.gender === 'ကျား' ? 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30' : 'text-pink-400 bg-pink-500/20 border border-pink-500/30'}">${r.gender}</span>
            </div>
          `).join('') : `<p class="text-xs text-slate-500 col-span-full italic">ဤအဆင့်တွင် စာရင်းမရှိသေးပါ။</p>`}
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

/**
 * Excel Import Handler
 */
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
          regDate: r["ရက်စွဲ"] || getFormattedToday()
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

// Global Window Exports
window.renderYogiStage = renderYogiStage;
window.renderLevelPage = renderYogiStage;
window.renderTotalSummary = renderTotalSummary;
window.toggleYogiStatus = toggleYogiStatus;
window.postYogiToNextStage = postYogiToNextStage;
window.deleteYogi = deleteYogi;
window.openYogiModal = openYogiModal;
window.autoDetectGenderModal = autoDetectGenderModal;
window.closeYogiModal = closeYogiModal;
window.saveYogiForm = saveYogiForm;
window.exportYogiToExcel = exportYogiToExcel;
window.handleExcelImport = handleExcelImport;
