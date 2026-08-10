/**
 * YOGI MANAGEMENT SYSTEM — Leaders Logic
 * File: js/leaders.js  
 */

// 💡 Helper: Auto Gender Detection Logic
function detectGenderByName(name) {
  const str = String(name || "").trim();
  if (/^(ဦး|ကို|မောင်|စော|ဆရာ|U|Mg|Ko|Saw)\b/i.test(str) || str.startsWith("ဦး") || str.startsWith("ကို") || str.startsWith("မောင်")) {
    return "ကျား";
  }
  if (/^(ဒေါ်|မ|နော်|မိ|ဆရာမ|Ma|Daw|Nan)\b/i.test(str) || str.startsWith("ဒေါ်") || str.startsWith("မ")) {
    return "မ";
  }
  return "ကျား"; // Default
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
 * Render Leader Yogi List
 */
async function renderLeaders(page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = "ဦးဆောင်ဆွေးနွေး ယောဂီများ";

  window.toggleLoading(true);
  let data = { rows: [], total: 0, activeTotal: 0, activeMale: 0, activeFemale: 0 };
  try {
    const res = await window.callApi("getLeaderData", { page, searchVal, limit: 1000 });
    if (res.success && res.data) {
      data = res.data;
    }
  } catch (e) {
    console.error("getLeaderData Error:", e);
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
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i class="fa-solid fa-user-tie"></i>
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

      <!-- Action Control Bar -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0e172a] p-3.5 rounded-2xl border border-indigo-500/20 shadow-md">
        <div class="relative w-full md:w-80">
          <input type="text" id="leader-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerLeaderSearch()"
            placeholder="အမည် / ဖုန်း ရှာဖွေရန်..." 
            class="w-full pl-9 pr-3 py-2 bg-[#070a12] border border-indigo-500/30 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        </div>

        <div class="flex flex-wrap items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
          <button onclick="renderLeaders(1, '')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition active:scale-95" title="ပြန်လည်ရယူပါ">
            <i class="fa-solid fa-rotate text-xs"></i> <span>Refresh</span>
          </button>

          <button onclick="exportLeaderToExcel()" class="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95" title="Excel ထုတ်ယူမည်">
            <i class="fa-solid fa-file-excel text-xs"></i> <span>Export Excel</span>
          </button>

          <button onclick="openLeaderModal()" class="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95">
            <i class="fa-solid fa-plus text-xs"></i> <span>+ ဦးဆောင်ယောဂီ အသစ်ထည့်မည်</span>
          </button>
        </div>
      </div>

      <!-- Leader Table -->
      <div class="bg-[#0e172a] border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th>စဉ်</th>
                <th>ရက်စွဲ</th>
                <th>အမည်</th>
                <th class="text-center">အသက်</th>
                <th class="text-center">GENDER</th>
                <th class="font-mono">ဖုန်းနံပါတ်</th>
                <th>နေရပ်လိပ်စာ</th>
                <th class="text-center">STATUS</th>
                <th class="text-center sticky right-0">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${sortedRows.length > 0 ? sortedRows.map((l, idx) => `
                <tr class="${l.status === 'Inactive' ? 'row-inactive' : 'row-active'}">
                  <td class="p-3 font-mono text-indigo-400/80 font-bold">#${idx + 1}</td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${l.regDate || '-'}</td>
                  <td class="p-3 font-extrabold text-slate-100 whitespace-nowrap">${window.escapeHtml(l.name)}</td>
                  <td class="p-3 text-center font-mono">${l.age || '-'}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${l.gender === 'ကျား' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}">
                      ${l.gender || 'ကျား'}
                    </span>
                  </td>
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${l.phone || '-'}</td>
                  <td class="p-3 text-slate-300 max-w-[220px] truncate" title="${window.escapeHtml(l.address)}">${window.escapeHtml(l.address) || '-'}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-lg font-extrabold text-[10px] ${l.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}">
                      ${l.status || 'Active'}
                    </span>
                  </td>
                  <td class="p-3 text-center whitespace-nowrap sticky right-0 bg-[#0e172a]">
                    <div class="flex items-center justify-center gap-1.5 font-sans">
                      <!-- Edit -->
                      <button onclick="openLeaderModal(${JSON.stringify(l).replace(/"/g, '&quot;')})" 
                        class="btn-action btn-action-edit" title="ပြင်ဆင်မည်">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>

                      <!-- Active / Inactive Toggle -->
                      <button onclick="toggleLeaderStatus(${l.id}, '${l.status}')" 
                        class="btn-action ${l.status === 'Active' ? 'btn-action-inactive' : 'btn-action-active'}" 
                        title="${l.status === 'Active' ? 'Inactive ပြုလုပ်ပြီး အောက်သို့ ရွှေ့မည်' : 'Active ပြုလုပ်ပြီး ဒီနေ့ရက်စွဲဖြင့် အပေါ်သို့ ပို့မည်'}">
                        <i class="fa-solid ${l.status === 'Active' ? 'fa-user-xmark' : 'fa-user-check'}"></i>
                      </button>

                      <!-- Delete -->
                      <button onclick="deleteLeader(${l.id})" 
                        class="btn-action btn-action-delete" title="ဖျက်ပါ">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="9" class="text-center py-12 text-slate-500">
                    <i class="fa-solid fa-user-tie text-4xl mb-3 text-slate-700 block"></i>
                    <p class="font-bold text-slate-400 text-xs">ဦးဆောင်ယောဂီ စာရင်း မရှိသေးပါ။</p>
                    <p class="text-[11px] text-slate-600 mt-1">"+ ဦးဆောင်ယောဂီ အသစ်ထည့်မည်" ကို နှိပ်၍ စာရင်းထည့်သွင်းပါ။</p>
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
  if (input) renderLeaders(1, input.value.trim());
}

/**
 * Toggle Leader Active / Inactive
 */
async function toggleLeaderStatus(id, currentStatus) {
  window.toggleLoading(true);
  const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
  const newDate = getFormattedToday();

  try {
    const res = await window.callApi("toggleLeaderStatus", { 
      id, 
      status: nextStatus,
      regDate: nextStatus === 'Active' ? newDate : undefined
    });

    if (res.success) {
      window.showToast("SUCCESS", nextStatus === 'Active' ? `Active ပြုလုပ်ပြီး ဒီနေ့ရက်စွဲ (${newDate}) ဖြင့် အပေါ်သို့ ပို့လိုက်ပါပြီ။` : "Inactive ပြုလုပ်ပြီး အောက်သို့ ရွှေ့လိုက်ပါပြီ။");
      renderLeaders();
    }
  } catch (e) {
    console.error(e);
  } finally {
    window.toggleLoading(false);
  }
}

/**
 * Delete Leader
 */
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

/**
 * Modal Dialog for Add / Edit Leader
 */
function openLeaderModal(existingData = null) {
  const isEdit = !!existingData;
  const today = getFormattedToday();

  const modalHtml = `
    <div id="leader-modal-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-[#0e172a] border border-indigo-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-indigo-500/20">
          <h3 class="text-sm font-extrabold text-indigo-400 flex items-center gap-2">
            <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-user-tie'}"></i>
            <span>${isEdit ? 'ဦးဆောင်ယောဂီ အချက်အလက် ပြင်ဆင်ရန်' : 'ဦးဆောင်ယောဂီ အသစ် ထည့်သွင်းရန်'}</span>
          </h3>
          <button onclick="closeLeaderModal()" class="text-slate-400 hover:text-rose-400 p-1 rounded-lg">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <form id="leader-form" onsubmit="saveLeaderForm(event, ${isEdit ? existingData.id : 'null'})" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-indigo-200/80 mb-1">ဦးဆောင်ယောဂီ အမည် *</label>
            <input type="text" id="leader-modal-name" required value="${isEdit ? window.escapeHtml(existingData.name) : ''}"
              onkeyup="autoDetectLeaderGenderModal()"
              placeholder="ဥပမာ - ဦးမောင်မောင် / ဒေါ်မြမြ..."
              class="w-full p-2.5 bg-[#070a12] border border-indigo-500/30 rounded-xl text-slate-100 outline-none focus:border-indigo-400">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-indigo-200/80 mb-1">ကျား/မ (GENDER) *</label>
              <select id="leader-modal-gender" required class="w-full p-2.5 bg-[#070a12] border border-indigo-500/30 rounded-xl text-slate-100 outline-none focus:border-indigo-400 font-bold">
                <option value="ကျား" ${isEdit && existingData.gender === 'ကျား' ? 'selected' : ''}>ကျား</option>
                <option value="မ" ${isEdit && existingData.gender === 'မ' ? 'selected' : ''}>မ</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-indigo-200/80 mb-1">အသက်</label>
              <input type="number" id="leader-modal-age" value="${isEdit ? (existingData.age || '') : ''}" placeholder="ဥပမာ - 50"
                class="w-full p-2.5 bg-[#070a12] border border-indigo-500/30 rounded-xl text-slate-100 outline-none focus:border-indigo-400">
            </div>
          </div>

          <div>
            <label class="block font-bold text-indigo-200/80 mb-1">ဖုန်းနံပါတ်</label>
            <input type="text" id="leader-modal-phone" value="${isEdit ? window.escapeHtml(existingData.phone || '') : ''}" placeholder="09-123456789"
              class="w-full p-2.5 bg-[#070a12] border border-indigo-500/30 rounded-xl text-slate-100 outline-none focus:border-indigo-400 font-mono">
          </div>

          <div>
            <label class="block font-bold text-indigo-200/80 mb-1">နေရပ်လိပ်စာ</label>
            <input type="text" id="leader-modal-address" value="${isEdit ? window.escapeHtml(existingData.address || '') : ''}" placeholder="မြို့နယ် / မြို့..."
              class="w-full p-2.5 bg-[#070a12] border border-indigo-500/30 rounded-xl text-slate-100 outline-none focus:border-indigo-400">
          </div>

          <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>ရက်စွဲ: <b class="text-indigo-400 font-mono">${isEdit ? (existingData.regDate || today) : today}</b></span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" onclick="closeLeaderModal()" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">မလုပ်တော့ပါ</button>
            <button type="submit" class="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-extrabold rounded-xl hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20">သိမ်းဆည်းမည်</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const existingModal = document.getElementById("leader-modal-overlay");
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  if (!isEdit) autoDetectLeaderGenderModal();
}

function autoDetectLeaderGenderModal() {
  const nameEl = document.getElementById("leader-modal-name");
  const genderEl = document.getElementById("leader-modal-gender");
  if (nameEl && genderEl) {
    genderEl.value = detectGenderByName(nameEl.value);
  }
}

function closeLeaderModal() {
  const modal = document.getElementById("leader-modal-overlay");
  if (modal) modal.remove();
}

async function saveLeaderForm(event, editId = null) {
  event.preventDefault();
  const name = document.getElementById("leader-modal-name").value.trim();
  const gender = document.getElementById("leader-modal-gender").value;
  const age = document.getElementById("leader-modal-age").value.trim();
  const phone = document.getElementById("leader-modal-phone").value.trim();
  const address = document.getElementById("leader-modal-address").value.trim();

  if (!name) {
    window.showToast("ERROR", "ဦးဆောင်ယောဂီ အမည် ရိုက်ထည့်ပါ");
    return;
  }

  window.toggleLoading(true);
  try {
    const payload = {
      id: editId || undefined,
      name,
      gender,
      age,
      phone,
      address,
      regDate: getFormattedToday(),
      status: "Active"
    };

    const action = editId ? "updateLeader" : "saveLeader";
    const res = await window.callApi(action, payload);

    if (res.success) {
      window.showToast("SUCCESS", editId ? "ပြင်ဆင်ချက် သိမ်းဆည်းပြီးပါပြီ။" : "ဦးဆောင်ယောဂီ အသစ် သိမ်းဆည်းပြီးပါပြီ။");
      closeLeaderModal();
      renderLeaders();
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
function exportLeaderToExcel() {
  const table = document.querySelector("table");
  if (!table) return;

  try {
    const wb = XLSX.utils.table_to_book(table, { sheet: "Leaders" });
    XLSX.writeFile(wb, `Leader_Yogi_List.xlsx`);
    window.showToast("SUCCESS", "Excel ဒေါင်းလုဒ်ရယူပြီးပါပြီ။");
  } catch (e) {
    console.error(e);
    window.showToast("ERROR", "Excel ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။");
  }
}

// Global Window Exports
window.renderLeaders = renderLeaders;
window.toggleLeaderStatus = toggleLeaderStatus;
window.deleteLeader = deleteLeader;
window.openLeaderModal = openLeaderModal;
window.closeLeaderModal = closeLeaderModal;
window.saveLeaderForm = saveLeaderForm;
window.exportLeaderToExcel = exportLeaderToExcel;
window.autoDetectLeaderGenderModal = autoDetectLeaderGenderModal;
