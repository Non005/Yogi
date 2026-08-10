/**
 * YOGI MANAGEMENT SYSTEM — Lead Discussion Yogi (ဦးဆောင်ဆွေးနွေး ယောဂီ) Page
 * File: js/leaders.js
 */

window.LeaderState = { page: 1, searchVal: "" };

window.renderLeaderPage = async function (container) {
  const res = await window.callApi("getLeaderData", {
    page: window.LeaderState.page, limit: window.CONFIG.DEFAULT_PAGE_SIZE, searchVal: window.LeaderState.searchVal
  });

  if (!res.success) {
    container.innerHTML = `<div class="text-rose-400 text-xs">${window.escapeHtml(res.message)}</div>`;
    return;
  }

  const d = res.data;
  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-sm font-black text-slate-100 flex items-center gap-2"><i class="fa-solid fa-user-tie text-violet-300"></i> ဦးဆောင်ဆွေးနွေး ယောဂီ</h2>
    </div>
    ${statCardsHtml(d.activeTotal, d.activeMale, d.activeFemale)}
    ${toolbarHtml("leaders", { onRefresh: "refreshLeaders()", onImport: "importLeaderFile", onAdd: "openLeaderForm()" })}
    <div id="leaders-table">${renderTable(d.rows, window.CONFIG.LEADER_HEADERS, "leader")}</div>
    <div class="flex items-center justify-between mt-4 text-[11px] text-slate-500">
      <span>စုစုပေါင်း ${d.total} ဦး</span>
      <div class="flex gap-2">
        <button onclick="changeLeaderPage(-1)" class="px-3 py-1.5 bg-[#0e131f] border border-slate-800 rounded-lg hover:border-slate-600" ${d.page <= 1 ? "disabled style='opacity:.4'" : ""}>Prev</button>
        <span class="px-2 py-1.5">Page ${d.page}</span>
        <button onclick="changeLeaderPage(1)" class="px-3 py-1.5 bg-[#0e131f] border border-slate-800 rounded-lg hover:border-slate-600" ${d.rows.length < d.limit ? "disabled style='opacity:.4'" : ""}>Next</button>
      </div>
    </div>
  `;

  const searchInput = document.getElementById("leaders-search");
  searchInput.value = window.LeaderState.searchVal;
  let debounceT;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceT);
    debounceT = setTimeout(() => {
      window.LeaderState.searchVal = e.target.value;
      window.LeaderState.page = 1;
      window.switchTab("leaders");
    }, 350);
  });
};

window.changeLeaderPage = function (delta) {
  window.LeaderState.page = Math.max(1, window.LeaderState.page + delta);
  window.switchTab("leaders");
};

window.refreshLeaders = function () {
  window.clearReadCache("getLeaderData");
  window.switchTab("leaders");
};

window.openLeaderForm = async function (id) {
  let row = null;
  if (id) {
    const res = await window.callApi("getLeaderData", { page: 1, limit: 200, searchVal: "" });
    if (res.success) row = res.data.rows.find(r => r.id === id);
  }

  const bodyHtml = `
    <form id="leader-form" class="space-y-3 text-xs" onsubmit="submitLeaderForm(event, ${id || "null"})">
      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2">
          <label class="form-label">အမည် *</label>
          <input required name="name" value="${window.escapeHtml(row?.name)}" class="form-input">
        </div>
        <div>
          <label class="form-label">ရက်စွဲ</label>
          <input type="date" name="regDate" value="${row?.regDate || new Date().toISOString().slice(0,10)}" class="form-input">
        </div>
        <div>
          <label class="form-label">အသက်</label>
          <input name="age" value="${window.escapeHtml(row?.age)}" class="form-input">
        </div>
        <div>
          <label class="form-label">ဖုန်းနံပါတ်</label>
          <input name="phone" value="${window.escapeHtml(row?.phone)}" class="form-input">
        </div>
        <div>
          <label class="form-label">GENDER</label>
          <select name="gender" class="form-input">
            <option value="">--</option>
            ${window.DROPDOWNS.GENDER.map(g => `<option value="${g}" ${row?.gender === g ? "selected" : ""}>${g}</option>`).join("")}
          </select>
        </div>
        <div class="col-span-2">
          <label class="form-label">နေရပ်လိပ်စာ</label>
          <input name="address" value="${window.escapeHtml(row?.address)}" class="form-input">
        </div>
        <div class="col-span-2">
          <label class="form-label">EMAIL</label>
          <input type="email" name="email" value="${window.escapeHtml(row?.email)}" class="form-input">
        </div>
      </div>
      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">မလုပ်တော့ပါ</button>
        <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500">သိမ်းမည်</button>
      </div>
    </form>
  `;

  window.openModal(`${id ? "ပြင်ဆင်ရန်" : "ဦးဆောင်ဆွေးနွေးယောဂီ အသစ်သွင်းရန်"}`, bodyHtml, { wide: true });
};

window.submitLeaderForm = async function (e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  if (id) payload.id = id;

  window.toggleLoading(true);
  const res = await window.callApi(id ? "updateLeader" : "saveLeader", payload);
  window.toggleLoading(false);

  if (res.success) {
    window.closeModal();
    window.showToast("SUCCESS", res.message || "အောင်မြင်ပါသည်။");
    window.switchTab("leaders");
  } else {
    window.showToast("ERROR", res.message || "မအောင်မြင်ပါ။");
  }
};
