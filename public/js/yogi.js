/**
 * YOGI MANAGEMENT SYSTEM — Level Pages (Kammatthana Yogi Lists)
 * File: js/yogi.js 
 */

window.LevelState = {}; // { [level]: { page, searchVal } }

function levelInfo(level) {
  return window.LEVELS.find(l => l.id === Number(level));
}

function statCardsHtml(active, male, female) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-[#0e131f] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400"><i class="fa-solid fa-users"></i></div>
        <div><p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active</p><p class="text-xl font-black text-slate-100">${active}</p></div>
      </div>
      <div class="bg-[#0e131f] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400"><i class="fa-solid fa-person"></i></div>
        <div><p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Male</p><p class="text-xl font-black text-slate-100">${male}</p></div>
      </div>
      <div class="bg-[#0e131f] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400"><i class="fa-solid fa-person-dress"></i></div>
        <div><p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Female</p><p class="text-xl font-black text-slate-100">${female}</p></div>
      </div>
    </div>`;
}

function toolbarHtml(scopeId, opts = {}) {
  return `
    <div class="flex flex-wrap items-center gap-2.5 mb-4">
      <div class="relative flex-1 min-w-[200px]">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        <input id="${scopeId}-search" type="text" placeholder="အမည်/ဖုန်း/လိပ်စာ ရှာဖွေရန်..."
          class="w-full pl-9 pr-3 py-2.5 bg-[#0e131f] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 transition">
      </div>
      <button onclick="${opts.onRefresh}" class="px-3.5 py-2.5 bg-[#0e131f] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition flex items-center gap-1.5">
        <i class="fa-solid fa-rotate-right"></i> Refresh
      </button>
      <label class="px-3.5 py-2.5 bg-[#0e131f] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition flex items-center gap-1.5 cursor-pointer">
        <i class="fa-solid fa-file-import"></i> Import
        <input type="file" accept=".xlsx,.xls,.csv" class="hidden" onchange="${opts.onImport}(event)">
      </label>
      <button onclick="${opts.onAdd}" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-xs font-bold text-white hover:from-indigo-500 hover:to-purple-500 transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20">
        <i class="fa-solid fa-plus"></i> Add New
      </button>
    </div>`;
}

function statusBadge(status) {
  return status === "Active"
    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>`
    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-600/20 text-slate-400 border border-slate-600/40">Inactive</span>`;
}

function actionButtons(row, kind) {
  const idAttr = row.id;
  const postBtn = (kind === "yogi" && row.canPost)
    ? `<button onclick="doPostYogi(${idAttr})" title="Post → next stage" class="action-btn text-violet-400 hover:bg-violet-500/15"><i class="fa-solid fa-paper-plane"></i></button>`
    : "";
  const toggleBtn = row.status === "Active"
    ? `<button onclick="doToggleStatus('${kind}',${idAttr})" title="Set Inactive" class="action-btn text-amber-400 hover:bg-amber-500/15"><i class="fa-solid fa-toggle-on"></i></button>`
    : `<button onclick="doToggleStatus('${kind}',${idAttr})" title="Set Active" class="action-btn text-slate-500 hover:bg-slate-500/15"><i class="fa-solid fa-toggle-off"></i></button>`;

  return `
    <div class="flex items-center justify-end gap-1">
      <button onclick="${kind === 'yogi' ? `openYogiForm(${row.level}, ${idAttr})` : `openLeaderForm(${idAttr})`}" title="Edit" class="action-btn text-sky-400 hover:bg-sky-500/15"><i class="fa-solid fa-pen"></i></button>
      ${postBtn}
      ${toggleBtn}
      <button onclick="doDelete('${kind}',${idAttr})" title="Delete" class="action-btn text-rose-400 hover:bg-rose-500/15"><i class="fa-solid fa-trash"></i></button>
    </div>`;
}

function renderTable(rows, headers, kind) {
  if (!rows.length) {
    return `<div class="text-center py-16 text-slate-600 text-xs"><i class="fa-solid fa-inbox text-2xl mb-2 block"></i>ဒေတာ မတွေ့ပါ</div>`;
  }
  const head = headers.map(h => `<th class="px-3 py-2.5 text-left whitespace-nowrap">${h.label}</th>`).join("");
  const body = rows.map(r => {
    const cells = headers.map(h => {
      if (h.key === "gender") return `<td class="px-3 py-2.5 whitespace-nowrap">${window.escapeHtml(r.gender)}</td>`;
      return `<td class="px-3 py-2.5 whitespace-nowrap">${window.escapeHtml(r[h.key])}</td>`;
    }).join("");
    return `<tr class="border-b border-slate-800/60 hover:bg-slate-800/20 transition">
      ${cells}
      <td class="px-3 py-2.5 whitespace-nowrap">${statusBadge(r.status)}</td>
      <td class="px-3 py-2.5 whitespace-nowrap sticky right-0 bg-[#0e131f]">${actionButtons(r, kind)}</td>
    </tr>`;
  }).join("");

  return `
    <div class="overflow-x-auto rounded-2xl border border-slate-800">
      <table class="w-full text-[11px] text-slate-300">
        <thead class="bg-[#0c1322] text-slate-400 font-bold uppercase text-[9px] tracking-wider">
          <tr>${head}<th class="px-3 py-2.5 text-left">Status</th><th class="px-3 py-2.5 text-right">Action</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

/* ------------------------------ Level page -------------------------------- */

window.renderLevelPage = async function (container, level) {
  window.LevelState[level] = window.LevelState[level] || { page: 1, searchVal: "" };
  const info = levelInfo(level);
  const scopeId = "level" + level;

  const res = await window.callApi("getYogiData", {
    level, page: window.LevelState[level].page, limit: window.CONFIG.DEFAULT_PAGE_SIZE, searchVal: window.LevelState[level].searchVal
  });

  if (!res.success) {
    container.innerHTML = `<div class="text-rose-400 text-xs">${window.escapeHtml(res.message || "ဒေတာ ရယူ၍ မရပါ")}</div>`;
    return;
  }

  const d = res.data;
  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-sm font-black text-slate-100 flex items-center gap-2"><i class="fa-solid ${info.icon} text-${info.color}-400"></i> ${window.escapeHtml(info.name)}</h2>
    </div>
    ${statCardsHtml(d.activeTotal, d.activeMale, d.activeFemale)}
    ${toolbarHtml(scopeId, { onRefresh: `refreshLevel(${level})`, onImport: `importLevelFile`, onAdd: `openYogiForm(${level})` })}
    <div id="${scopeId}-table">${renderTable(d.rows, window.CONFIG.SHEET_HEADERS, "yogi")}</div>
    <div class="flex items-center justify-between mt-4 text-[11px] text-slate-500">
      <span>စုစုပေါင်း ${d.total} ဦး</span>
      <div class="flex gap-2">
        <button onclick="changeLevelPage(${level}, -1)" class="px-3 py-1.5 bg-[#0e131f] border border-slate-800 rounded-lg hover:border-slate-600" ${d.page <= 1 ? "disabled style='opacity:.4'" : ""}>Prev</button>
        <span class="px-2 py-1.5">Page ${d.page}</span>
        <button onclick="changeLevelPage(${level}, 1)" class="px-3 py-1.5 bg-[#0e131f] border border-slate-800 rounded-lg hover:border-slate-600" ${d.rows.length < d.limit ? "disabled style='opacity:.4'" : ""}>Next</button>
      </div>
    </div>
  `;

  const searchInput = document.getElementById(`${scopeId}-search`);
  searchInput.value = window.LevelState[level].searchVal;
  let debounceT;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceT);
    debounceT = setTimeout(() => {
      window.LevelState[level].searchVal = e.target.value;
      window.LevelState[level].page = 1;
      window.switchTab("level" + level);
    }, 350);
  });

  window.currentImportLevel = level;
};

window.changeLevelPage = function (level, delta) {
  const st = window.LevelState[level];
  st.page = Math.max(1, st.page + delta);
  window.switchTab("level" + level);
};

window.refreshLevel = function (level) {
  window.clearReadCache("getYogiData");
  window.switchTab("level" + level);
};

/* --------------------------------- Form ----------------------------------- */

window.openYogiForm = async function (level, id) {
  const info = levelInfo(level);
  let row = null;
  if (id) {
    const res = await window.callApi("getYogiData", { level, page: 1, limit: 200, searchVal: "" });
    if (res.success) row = res.data.rows.find(r => r.id === id);
  }

  const bodyHtml = `
    <form id="yogi-form" class="space-y-3 text-xs" onsubmit="submitYogiForm(event, ${level}, ${id || "null"})">
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
        <div>
          <label class="form-label">မိတ်ဆက်ယောဂီ</label>
          <input name="introducer" value="${window.escapeHtml(row?.introducer)}" class="form-input">
        </div>
        <div>
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

  window.openModal(`${id ? "ပြင်ဆင်ရန်" : "စာရင်းသစ်သွင်းရန်"} — ${info.name}`, bodyHtml, { wide: true });
};

window.submitYogiForm = async function (e, level, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  if (id) payload.id = id; else payload.level = level;

  window.toggleLoading(true);
  const res = await window.callApi(id ? "updateYogi" : "saveYogi", payload);
  window.toggleLoading(false);

  if (res.success) {
    window.closeModal();
    window.showToast("SUCCESS", res.message || "အောင်မြင်ပါသည်။");
    window.switchTab("level" + level);
  } else {
    window.showToast("ERROR", res.message || "မအောင်မြင်ပါ။");
  }
};

/* -------------------------------- Actions ---------------------------------- */

window.doPostYogi = async function (id) {
  if (!confirm("နောက်တစ်ဆင့် ကမ္မဋ္ဌာန်း စာရင်းသို့ Post လုပ်မှာ သေချာပါသလား။")) return;
  window.toggleLoading(true);
  const res = await window.callApi("postYogi", { id });
  window.toggleLoading(false);
  if (res.success) {
    window.showToast("SUCCESS", res.message);
    window.switchTab(window.AppState.currentTab);
  } else {
    window.showToast("ERROR", res.message);
  }
};

window.doToggleStatus = async function (kind, id) {
  window.toggleLoading(true);
  const res = await window.callApi(kind === "yogi" ? "toggleYogiStatus" : "toggleLeaderStatus", { id });
  window.toggleLoading(false);
  if (res.success) {
    window.showToast("SUCCESS", res.message);
    window.switchTab(window.AppState.currentTab);
  } else {
    window.showToast("ERROR", res.message);
  }
};

window.doDelete = async function (kind, id) {
  if (!confirm("ဤစာရင်းကို ဖျက်ပစ်မှာ သေချာပါသလား။ (ပြန်၍မရနိုင်ပါ)")) return;
  window.toggleLoading(true);
  const res = await window.callApi(kind === "yogi" ? "deleteYogi" : "deleteLeader", { id });
  window.toggleLoading(false);
  if (res.success) {
    window.showToast("SUCCESS", res.message);
    window.switchTab(window.AppState.currentTab);
  } else {
    window.showToast("ERROR", res.message);
  }
};

/* --------------------------------- Import ----------------------------------- */

function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        resolve(json);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mapImportRow(raw) {
  // Accepts Burmese sheet headers OR the English key names
  const get = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
    }
    return "";
  };
  return {
    regDate: get("ရက်စွဲ", "regDate", "Date"),
    name: get("အမည်", "name", "Name"),
    age: get("အသက်", "age", "Age"),
    phone: get("ဖုန်းနံပါတ်", "phone", "Phone"),
    address: get("နေရပ်လိပ်စာ", "address", "Address"),
    introducer: get("မိတ်ဆက်ယောဂီ", "introducer"),
    email: get("EMAIL", "email", "Email"),
    gender: get("GENDER", "gender", "Gender")
  };
}

window.importLevelFile = async function (event) {
  const file = event.target.files[0];
  if (!file) return;
  const level = window.currentImportLevel;

  try {
    window.toggleLoading(true);
    const raw = await readExcelFile(file);
    const rows = raw.map(mapImportRow).filter(r => r.name);
    if (!rows.length) {
      window.toggleLoading(false);
      return window.showToast("ERROR", "ဖိုင်ထဲတွင် 'အမည်' ကော်လံ ဒေတာ မတွေ့ပါ။");
    }
    const res = await window.callApi("importYogi", { level, rows });
    window.toggleLoading(false);
    if (res.success) {
      window.showToast("SUCCESS", res.message);
      window.switchTab("level" + level);
    } else {
      window.showToast("ERROR", res.message);
    }
  } catch (err) {
    window.toggleLoading(false);
    window.showToast("ERROR", "ဖိုင် ဖတ်၍မရပါ: " + err.message);
  } finally {
    event.target.value = "";
  }
};

window.importLeaderFile = async function (event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    window.toggleLoading(true);
    const raw = await readExcelFile(file);
    const rows = raw.map(mapImportRow).filter(r => r.name);
    if (!rows.length) {
      window.toggleLoading(false);
      return window.showToast("ERROR", "ဖိုင်ထဲတွင် 'အမည်' ကော်လံ ဒေတာ မတွေ့ပါ။");
    }
    const res = await window.callApi("importLeader", { rows });
    window.toggleLoading(false);
    if (res.success) {
      window.showToast("SUCCESS", res.message);
      window.switchTab("leaders");
    } else {
      window.showToast("ERROR", res.message);
    }
  } catch (err) {
    window.toggleLoading(false);
    window.showToast("ERROR", "ဖိုင် ဖတ်၍မရပါ: " + err.message);
  } finally {
    event.target.value = "";
  }
};

/* ----------------------------- Total roll-up page ---------------------------- */

window.renderTotalListPage = async function (container) {
  const res = await window.callApi("getTotalListData", {});
  if (!res.success) {
    container.innerHTML = `<div class="text-rose-400 text-xs">${window.escapeHtml(res.message)}</div>`;
    return;
  }

  const groups = res.data.map(g => {
    const rowsHtml = g.rows.length
      ? g.rows.map((r, i) => `
        <tr class="border-b border-slate-800/60">
          <td class="px-3 py-2 text-slate-500">${i + 1}</td>
          <td class="px-3 py-2 font-semibold text-slate-200">${window.escapeHtml(r.name)}</td>
          <td class="px-3 py-2">${window.escapeHtml(r.gender)}</td>
          <td class="px-3 py-2">${window.escapeHtml(r.age)}</td>
          <td class="px-3 py-2">${window.escapeHtml(r.phone)}</td>
          <td class="px-3 py-2">${window.escapeHtml(r.reg_date)}</td>
        </tr>`).join("")
      : `<tr><td colspan="6" class="px-3 py-4 text-center text-slate-600">ဒေတာ မရှိပါ</td></tr>`;

    return `
      <div class="mb-5 bg-[#0e131f] border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-4 py-3 bg-[#0c1322] border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-xs font-black text-slate-100">${window.escapeHtml(g.name)}</h3>
          <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">${g.rows.length} ဦး</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-[11px] text-slate-300">
            <thead class="text-slate-500 text-[9px] uppercase tracking-wider">
              <tr><th class="px-3 py-2 text-left">စဉ်</th><th class="px-3 py-2 text-left">အမည်</th><th class="px-3 py-2 text-left">Gender</th><th class="px-3 py-2 text-left">Age</th><th class="px-3 py-2 text-left">Phone</th><th class="px-3 py-2 text-left">Date</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-sm font-black text-slate-100"><i class="fa-solid fa-list-check text-amber-300 mr-2"></i>ယောဂီ စုစုပေါင်း စာရင်း (Active)</h2>
      <button onclick="switchTab('total')" class="px-3 py-2 bg-[#0e131f] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition"><i class="fa-solid fa-rotate-right mr-1"></i>Refresh</button>
    </div>
    ${groups}
  `;
};
