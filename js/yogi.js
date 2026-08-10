/**
 * YOGI MANAGEMENT SYSTEM — Yogi Stages Core Logic
 * File: js/yogi.js
 */

function detectGenderByName(name) {
  const str = String(name || "").trim();
  if (/^(ဒေါ်|မ|နော်|မိ|ဆရာမ|Ma|Daw|Nan|Naw|Mi)\b/i.test(str) ||
      str.startsWith("ဒေါ်") || str.startsWith("မ") || str.startsWith("နော်") || str.startsWith("မိ")) {
    return "မ";
  }
  if (/^(ဦး|ကို|မောင်|စော|ဆရာ|U|Mg|Ko|Saw)\b/i.test(str) ||
      str.startsWith("ဦး") || str.startsWith("ကို") || str.startsWith("မောင်") || str.startsWith("စော")) {
    return "ကျား";
  }
  return "ကျား";
}

function getFormattedToday() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function statCardsYogiHtml(total, male, female) {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; width: 100%; margin-bottom: 1.25rem;">
      <div style="background: linear-gradient(135deg, #111a2e 0%, #0a1120 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="width: 2.75rem; height: 2.75rem; min-width: 2.75rem; min-height: 2.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
          <i class="fa-solid fa-users"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <p style="margin: 0; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">TOTAL ACTIVE</p>
          <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #fbbf24; font-family: monospace;">${total || 0} ဦး</h3>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #111a2e 0%, #0a1120 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="width: 2.75rem; height: 2.75rem; min-width: 2.75rem; min-height: 2.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
          <i class="fa-solid fa-mars"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <p style="margin: 0; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">ACTIVE MALE</p>
          <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #818cf8; font-family: monospace;">${male || 0} ဦး</h3>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #111a2e 0%, #0a1120 100%); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="width: 2.75rem; height: 2.75rem; min-width: 2.75rem; min-height: 2.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3);">
          <i class="fa-solid fa-venus"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <p style="margin: 0; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">ACTIVE FEMALE</p>
          <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #f472b6; font-family: monospace;">${female || 0} ဦး</h3>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Yogi Stage View
 * Limit: 30 items per page with Pagination
 */
async function renderYogiStage(stageId, page = 1, searchVal = "") {
  const container = document.getElementById("view-container");
  if (!container) return;

  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || {
    id: stageId, 
    name: stageId === 8 ? "ယောဂီ စာရင်းဟောင်း" : `အဆင့် (${stageId})`
  };

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = String(stageInfo.name || "ယောဂီစာရင်း");

  window.toggleLoading(true);
  let data = { rows: [], total: 0, activeTotal: 0, activeMale: 0, activeFemale: 0 };
  const limit = 30; // 💡 Default 30 items per page

  try {
    const res = await window.callApi("getYogiData", { level: stageId, page, searchVal, limit });
    if (res.success && res.data) data = res.data;
  } catch (err) {
    console.error("getYogiData Error:", err);
  } finally {
    window.toggleLoading(false);
  }

  const rawRows = data.rows || [];
  const totalCount = data.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const sortedRows = [...rawRows].sort((a, b) => {
    if (a.status === 'Active' && b.status === 'Inactive') return -1;
    if (a.status === 'Inactive' && b.status === 'Active') return 1;
    return 0;
  });

  window._currentYogiRows = sortedRows;

  container.innerHTML = `
    <div class="space-y-5 view-panel">
      <!-- Top 3 KPI Cards -->
      ${statCardsYogiHtml(data.activeTotal, data.activeMale, data.activeFemale)}

      <!-- Restored Control Bar Buttons -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; background: #0e172a; border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 1rem; padding: 0.85rem 1.25rem; margin-bottom: 1.25rem;">
        <div style="position: relative; flex: 1; min-width: 240px; max-width: 360px;">
          <input type="text" id="yogi-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerYogiSearch(${stageId})"
            placeholder="အမည် / ဖုန်း / လိပ်စာ ရှာဖွေရန်..." 
            style="width: 100%; padding: 0.5rem 0.85rem 0.5rem 2.2rem; background: #070a12; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 0.75rem; color: #f1f5f9; font-size: 0.8rem; outline: none;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.75rem;"></i>
        </div>
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button onclick="renderYogiStage(${stageId}, 1, '')" class="btn-action" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 0.5rem 0.85rem;">
            <i class="fa-solid fa-rotate"></i> Refresh
          </button>
          <button onclick="exportYogiToExcel(${stageId})" class="btn-action" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.5rem 0.85rem;">
            <i class="fa-solid fa-file-excel"></i> Export Excel
          </button>
          <label class="btn-action" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 0.5rem 0.85rem; cursor: pointer;">
            <i class="fa-solid fa-file-import" style="color: #fbbf24;"></i> Import
            <input type="file" accept=".xlsx, .xls, .csv" class="hidden" onchange="handleExcelImport(event, ${stageId})">
          </label>
          <button onclick="openYogiModal(${stageId})" class="btn-action" style="background: linear-gradient(90deg, #f59e0b, #d97706); color: #090d16; font-weight: 900; padding: 0.5rem 1rem;">
            <i class="fa-solid fa-plus"></i> + Add New
          </button>
        </div>
      </div>

      <!-- Table Container (1 Single Line Cells, Plain Index 1, 2, 3) -->
      <div style="background-color: #0e172a; border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 1rem; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="overflow-x-auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
            <thead>
              <tr style="background-color: #080d1a; border-bottom: 2px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.72rem; font-weight: 800;">
                <th style="padding: 12px 14px; white-space: nowrap;">စဉ်</th>
                <th style="padding: 12px 14px; white-space: nowrap;">ရက်စွဲ</th>
                <th style="padding: 12px 14px; white-space: nowrap;">အမည်</th>
                <th style="padding: 12px 14px; white-space: nowrap; text-align: center;">အသက်</th>
                <th style="padding: 12px 14px; white-space: nowrap;">ဖုန်းနံပါတ်</th>
                <th style="padding: 12px 14px; white-space: nowrap;">နေရပ်လိပ်စာ</th>
                <th style="padding: 12px 14px; white-space: nowrap;">မိတ်ဆက်ယောဂီ</th>
                <th style="padding: 12px 14px; white-space: nowrap;">EMAIL</th>
                <th style="padding: 12px 14px; white-space: nowrap; text-align: center;">GENDER</th>
                <th style="padding: 12px 14px; white-space: nowrap;">CREATED BY</th>
                <th style="padding: 12px 14px; white-space: nowrap;">CREATED AT</th>
                <th style="padding: 12px 14px; white-space: nowrap; text-align: center;">STATUS</th>
                <th style="padding: 12px 14px; white-space: nowrap; text-align: center; position: sticky; right: 0; background-color: #080d1a;">ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRows.length > 0 ? sortedRows.map((y, idx) => `
                <tr class="${y.status === 'Inactive' ? 'row-inactive' : ''}" style="border-bottom: 1px solid rgba(30, 41, 59, 0.5);">
                  <td style="padding: 11px 14px; font-weight: bold; color: #f59e0b; white-space: nowrap;">${(page - 1) * limit + idx + 1}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${y.regDate || '-'}</td>
                  <td style="padding: 11px 14px; font-weight: 800; color: #f8fafc; white-space: nowrap;">${window.escapeHtml(y.name)}</td>
                  <td style="padding: 11px 14px; text-align: center; white-space: nowrap;">${y.age || '-'}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${y.phone || '-'}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${window.escapeHtml(y.address) || '-'}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${window.escapeHtml(y.introducer) || '-'}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${y.email || '-'}</td>
                  <td style="padding: 11px 14px; text-align: center; white-space: nowrap;">
                    <span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; ${y.gender === 'ကျား' ? 'background: rgba(99,102,241,0.2); color: #818cf8;' : 'background: rgba(236,72,153,0.2); color: #f472b6;'}">
                      ${y.gender || 'ကျား'}
                    </span>
                  </td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${y.createdBy || 'System'}</td>
                  <td style="padding: 11px 14px; white-space: nowrap;">${y.createdAt ? y.createdAt.slice(0, 10) : '-'}</td>
                  <td style="padding: 11px 14px; text-align: center; white-space: nowrap;">
                    <span style="padding: 3px 8px; border-radius: 6px; font-weight: bold; ${y.status === 'Active' ? 'background: rgba(16,185,129,0.2); color: #34d399;' : 'background: rgba(244,63,94,0.2); color: #f87171;'}">
                      ${y.status || 'Active'}
                    </span>
                  </td>
                  <td style="padding: 11px 14px; text-align: center; position: sticky; right: 0; background-color: #0e172a; white-space: nowrap;">
                    <div style="display: flex; gap: 6px; justify-content: center;">
                      <!-- Restored Sleek Icon-only Action Buttons -->
                      <button onclick="openYogiModal(${stageId}, ${y.id})" class="btn-action-icon btn-action-edit" title="ပြင်ဆင်မည်"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button onclick="postYogiToNextStage(${y.id}, ${stageId})" class="btn-action-icon btn-action-post" title="${stageId === 7 ? 'ယောဂီ စာရင်းဟောင်းသို့ ရွှေ့မည် (Post)' : 'နောက်တစ်ဆင့်သို့ ရွှေ့မည် (Post)'}"><i class="fa-solid fa-paper-plane"></i></button>
                      <button onclick="toggleYogiStatus(${y.id}, '${y.status}', ${stageId})" class="btn-action-icon ${y.status === 'Active' ? 'btn-action-inactive' : 'btn-action-active'}" title="${y.status === 'Active' ? 'Inactive ပြုလုပ်မည်' : 'Active ပြုလုပ်မည်'}"><i class="fa-solid ${y.status === 'Active' ? 'fa-user-xmark' : 'fa-user-check'}"></i></button>
                      <button onclick="deleteYogi(${y.id}, ${stageId})" class="btn-action-icon btn-action-delete" title="ဖျက်ပါ"><i class="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="13" style="text-align: center; padding: 3rem; color: #64748b;">ယောဂီစာရင်း မရှိသေးပါ။</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Bar -->
      ${totalPages > 1 ? `
        <div class="pagination-container">
          <button onclick="renderYogiStage(${stageId}, ${page - 1}, '${window.escapeHtml(searchVal)}')" ${page <= 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} class="btn-action" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 0.4rem 0.85rem;">
            <i class="fa-solid fa-chevron-left"></i> Previous
          </button>

          <span style="font-size: 0.75rem; font-weight: 800; color: #fbbf24;">
            Page <b style="color: #ffffff;">${page}</b> of <b>${totalPages}</b> (Total: ${totalCount})
          </span>

          <button onclick="renderYogiStage(${stageId}, ${page + 1}, '${window.escapeHtml(searchVal)}')" ${page >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} class="btn-action" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 0.4rem 0.85rem;">
            Next <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Centered Pop-up Modal Window for Adding / Editing Yogi
 */
function openYogiModal(stageId, yogiId = null) {
  let existingData = null;
  if (yogiId) {
    existingData = (window._currentYogiRows || []).find(r => String(r.id) === String(yogiId));
  }

  const isEdit = !!existingData;
  const today = getFormattedToday();
  const currentUser = window.AppState ? window.AppState.currentUser : 'Admin';

  const modalHtml = `
    <div id="yogi-modal-overlay" class="modal-overlay-bg">
      <div class="modal-dialog-box">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(245, 158, 11, 0.2); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <h3 style="margin: 0; color: #fbbf24; font-size: 0.95rem; font-weight: 800;">
            <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-user-plus'}"></i>
            ${isEdit ? 'ယောဂီအချက်အလက် ပြင်ဆင်ရန်' : 'ယောဂီအသစ် ထည့်သွင်းရန်'}
          </h3>
          <button onclick="closeYogiModal()" style="background: none; border: none; color: #94a3b8; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="yogi-form" onsubmit="saveYogiForm(event, ${stageId}, ${isEdit ? existingData.id : 'null'})" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <input type="hidden" id="modal-reg-date" value="${isEdit ? (existingData.regDate || today) : today}">

          <div>
            <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">ယောဂီအမည် *</label>
            <input type="text" id="modal-name" required value="${isEdit ? window.escapeHtml(existingData.name) : ''}" onkeyup="${!isEdit ? 'autoDetectGenderModal()' : ''}" placeholder="ဥပမာ - ဦးလှမောင် / မမြစိန်...">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">ကျား/မ (GENDER) *</label>
              <select id="modal-gender" required>
                <option value="ကျား" ${isEdit && existingData.gender === 'ကျား' ? 'selected' : ''}>ကျား</option>
                <option value="မ" ${isEdit && existingData.gender === 'မ' ? 'selected' : ''}>မ</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">အသက်</label>
              <input type="number" id="modal-age" value="${isEdit ? (existingData.age || '') : ''}" placeholder="ဥပမာ - 45">
            </div>
          </div>

          <div>
            <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">ဖုန်းနံပါတ် (၂ လိုင်းအထိ ထည့်နိုင်သည်)</label>
            <input type="text" id="modal-phone" value="${isEdit ? window.escapeHtml(existingData.phone || '') : ''}" placeholder="09-123456789, 09-987654321">
          </div>

          <div>
            <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">နေရပ်လိပ်စာ</label>
            <input type="text" id="modal-address" value="${isEdit ? window.escapeHtml(existingData.address || '') : ''}" placeholder="မြို့နယ် / မြို့...">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">မိတ်ဆက်ယောဂီ</label>
              <input type="text" id="modal-introducer" value="${isEdit ? window.escapeHtml(existingData.introducer || '') : ''}" placeholder="အမည်...">
            </div>
            <div>
              <label style="display: block; font-weight: bold; color: #fef08a; margin-bottom: 0.3rem; font-size: 0.75rem;">EMAIL</label>
              <input type="email" id="modal-email" value="${isEdit ? window.escapeHtml(existingData.email || '') : ''}" placeholder="example@mail.com">
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">
            <span>ရက်စွဲ: <b style="color: #fbbf24;">${isEdit ? (existingData.regDate || today) : today}</b></span>
            <span>Created By: <b style="color: #34d399;">${isEdit ? (existingData.createdBy || currentUser) : currentUser}</b></span>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="button" onclick="closeYogiModal()" class="btn-action" style="background: #1e293b; color: #cbd5e1; padding: 0.5rem 1rem;">မလုပ်တော့ပါ</button>
            <button type="submit" class="btn-action" style="background: linear-gradient(90deg, #f59e0b, #d97706); color: #090d16; font-weight: 900; padding: 0.5rem 1.25rem;">သိမ်းဆည်းမည်</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const existingModal = document.getElementById("yogi-modal-overlay");
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  if (!isEdit) autoDetectGenderModal();
}

function autoDetectGenderModal() {
  const nameEl = document.getElementById("modal-name");
  const genderEl = document.getElementById("modal-gender");
  if (nameEl && genderEl) genderEl.value = detectGenderByName(nameEl.value);
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
  const regDate = document.getElementById("modal-reg-date") ? document.getElementById("modal-reg-date").value : getFormattedToday();

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
      regDate: regDate || getFormattedToday(),
      status: "Active"
    };

    const action = editId ? "updateYogi" : "saveYogi";
    const res = await window.callApi(action, payload);

    if (res.success) {
      window.showToast("SUCCESS", editId ? "ပြင်ဆင်ချက် သိမ်းဆည်းပြီးပါပြီ။" : "ယောဂီအသစ် သိမ်းဆည်းပြီးပါပြီ။");
      closeYogiModal();
      renderYogiStage(stageId);
    }
  } catch (e) { console.error(e); } finally { window.toggleLoading(false); }
}

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
  } catch (e) { console.error(e); } finally { window.toggleLoading(false); }
}

async function postYogiToNextStage(id, stageId) {
  const isLast = stageId === 7;
  const msg = isLast ? "ဤယောဂီအား 'ယောဂီ စာရင်းဟောင်း (Alumni)' သို့ ရွှေ့ရန် သေချာပါသလား။" : "ဤယောဂီအား နောက်တစ်ဆင့်သို့ တိုးမြှင့် (Post) ရန် သေချာပါသလား။";

  if (!confirm(msg)) return;

  window.toggleLoading(true);
  try {
    const res = await window.callApi("postYogi", { id, postDate: getFormattedToday() });
    if (res.success) {
      window.showToast("SUCCESS", isLast ? "ယောဂီ စာရင်းဟောင်းသို့ အောင်မြင်စွာ ရွှေ့လိုက်ပါပြီ။" : "နောက်တစ်ဆင့်သို့ အောင်မြင်စွာ တိုးမြှင့်လိုက်ပါပြီ။");
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

function exportYogiToExcel(stageId) {
  const stageInfo = (window.LEVELS || []).find(l => l.id === Number(stageId)) || { name: `Stage_${stageId}` };
  const table = document.querySelector("table");
  if (!table) return;

  try {
    const wb = XLSX.utils.table_to_book(table, { sheet: "YogiList" });
    XLSX.writeFile(wb, `${stageInfo.name}_Yogi_List.xlsx`);
    window.showToast("SUCCESS", "Excel ဒေါင်းလုဒ်ရယူပြီးပါပြီ။");
  } catch (e) {
    window.showToast("ERROR", "Excel ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။");
  }
}

function triggerYogiSearch(stageId) {
  const input = document.getElementById("yogi-search-input");
  if (input) renderYogiStage(stageId, 1, input.value.trim());
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
window.toggleYogiStatus = toggleYogiStatus;
window.postYogiToNextStage = postYogiToNextStage;
window.deleteYogi = deleteYogi;
window.openYogiModal = openYogiModal;
window.autoDetectGenderModal = autoDetectGenderModal;
window.closeYogiModal = closeYogiModal;
window.saveYogiForm = saveYogiForm;
window.exportYogiToExcel = exportYogiToExcel;
window.handleExcelImport = handleExcelImport;
