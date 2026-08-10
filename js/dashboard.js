/**
 * YOGI MANAGEMENT SYSTEM — Home Dashboard
 * File: js/dashboard.js
 */

const QUOTE_BOX_HTML = `
  <div class="p-4 rounded-xl space-y-2.5 font-serif italic text-xs sm:text-sm shadow-inner mt-3" style="background-color: rgba(9, 13, 22, 0.7); border: 1px solid rgba(245, 158, 11, 0.25);">
    <p style="color: #fef08a;" class="leading-relaxed">In every sight, -- မင်း ဘာပဲမြင်မြင် ... </p>
    <p style="color: #7dd3fc;" class="leading-relaxed">In every sound, -- မင်း ဘာပဲကြားကြား ... </p>
    <p style="color: #6ee7b7;" class="leading-relaxed">In every smell, -- မင်း ဘယ်လို အနံ့ပဲရရ ...</p>
    <p style="color: #fda4af;" class="leading-relaxed">In every taste, -- မင်း ဘာပဲစားစား ... </p>
    <p style="color: #5eead4;" class="leading-relaxed">In every touch, -- မင်း ဘာနဲ့ပဲ ထိတွေ့ရပါစေ ... </p>
    <p style="color: #fbbf24; border-top: 1px solid rgba(245, 158, 11, 0.25);" class="font-extrabold not-italic pt-2 text-xs sm:text-sm leading-relaxed">In every thought -- မင်း ဘာပဲ တွေးတွေး... —stay mindful. -- အမြဲသတိ ထားပါလေ ...</p>
  </div>
  <div class="pt-2.5 flex justify-between items-center text-xs mt-3" style="border-top: 1px solid rgba(245, 158, 11, 0.2);">
    <span class="font-black" style="color: #fbbf24;">Appamadena sampadetha <span class="font-sans font-normal italic text-[10px]" style="color: #f59e0b;">— The Buddha</span></span>
    <span class="text-[9px] font-black px-3 py-1 rounded-full font-sans uppercase" style="background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">ERP Wisdom</span>
  </div>
`;

function statCardsHtml(total, male, female) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="stats-card">
        <div class="bg-amber-500/10 text-amber-400 border border-amber-500/20"><i class="fa-solid fa-users"></i></div>
        <div><p>TOTAL ACTIVE</p><h3 class="text-amber-400">${total || 0} ဦး</h3></div>
      </div>
      <div class="stats-card">
        <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><i class="fa-solid fa-mars"></i></div>
        <div><p>ACTIVE MALE</p><h3 class="text-indigo-400">${male || 0} ဦး</h3></div>
      </div>
      <div class="stats-card">
        <div class="bg-pink-500/10 text-pink-400 border border-pink-500/20"><i class="fa-solid fa-venus"></i></div>
        <div><p>ACTIVE FEMALE</p><h3 class="text-pink-400">${female || 0} ဦး</h3></div>
      </div>
    </div>
  `;
}

window.renderDashboard = async function () {
  const container = document.getElementById("view-container");
  if (!container) return;

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = "ပင်မစာမျက်နှာ";

  window.toggleLoading(true);
  let res;
  try {
    res = await window.callApi("getDashboardData", {});
  } catch (err) {
    console.error("getDashboardData Error:", err);
    window.toggleLoading(false);
    return;
  }
  window.toggleLoading(false);

  if (!res.success) {
    container.innerHTML = `<div class="text-rose-400 text-xs">${window.escapeHtml(res.message)}</div>`;
    return;
  }
  const d = res.data;

  const breakdownRows = d.perLevel.map(l => `
    <tr class="border-b border-slate-800/60">
      <td class="px-3 py-2 font-semibold text-slate-200">${window.escapeHtml(l.name)}</td>
      <td class="px-3 py-2 text-sky-400 font-bold">${l.male}</td>
      <td class="px-3 py-2 text-rose-400 font-bold">${l.female}</td>
      <td class="px-3 py-2 text-emerald-400 font-black">${l.total}</td>
    </tr>`).join("");

  container.innerHTML = `
    ${statCardsHtml(d.totalActive, d.activeMale, d.activeFemale)}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-[#0e131f] border border-amber-500/20 rounded-2xl p-5">
        <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-2"><i class="fa-solid fa-dharmachakra"></i> Mindfulness Reminder</h3>
        ${QUOTE_BOX_HTML}
      </div>

      <div class="bg-[#0e131f] border border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-4 py-3 bg-[#0c1322] border-b border-slate-800">
          <h3 class="text-xs font-black text-slate-100"><i class="fa-solid fa-chart-simple text-indigo-400 mr-1.5"></i>ကမ္မဋ္ဌာန်း အဆင့်အလိုက် စာရင်း (Active)</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-[11px] text-slate-300">
            <thead class="text-slate-500 text-[9px] uppercase tracking-wider">
              <tr><th class="px-3 py-2 text-left">အဆင့်</th><th class="px-3 py-2 text-left">Male</th><th class="px-3 py-2 text-left">Female</th><th class="px-3 py-2 text-left">Total</th></tr>
            </thead>
            <tbody>
              ${breakdownRows}
              <tr class="bg-[#0c1322]">
                <td class="px-3 py-2.5 font-black text-violet-300">ဦးဆောင်ဆွေးနွေး ယောဂီ</td>
                <td class="px-3 py-2.5 text-sky-400 font-bold">${d.leaders.male}</td>
                <td class="px-3 py-2.5 text-rose-400 font-bold">${d.leaders.female}</td>
                <td class="px-3 py-2.5 text-emerald-400 font-black">${d.leaders.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};
