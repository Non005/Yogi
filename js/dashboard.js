/**
 * YOGI MANAGEMENT SYSTEM — Home Dashboard
 * File: js/dashboard.js
 */

const QUOTE_BOX_HTML = `
  <div class="mindfulness-card space-y-4">
    <div class="space-y-3 font-serif text-xs sm:text-sm md:text-base leading-relaxed">
      <div class="flex items-start gap-2.5 border-b border-amber-500/15 pb-2.5">
        <span class="text-amber-400 font-extrabold not-italic font-mono text-xs mt-0.5">01.</span>
        <p class="italic"><span class="text-amber-200 font-extrabold">In every sight,</span> <span class="text-slate-400 not-italic font-sans text-xs">-- မင်း ဘာပဲမြင်မြင် ...</span></p>
      </div>

      <div class="flex items-start gap-2.5 border-b border-amber-500/15 pb-2.5">
        <span class="text-sky-400 font-extrabold not-italic font-mono text-xs mt-0.5">02.</span>
        <p class="italic"><span class="text-sky-300 font-extrabold">In every sound,</span> <span class="text-slate-400 not-italic font-sans text-xs">-- မင်း ဘာပဲကြားကြား ...</span></p>
      </div>

      <div class="flex items-start gap-2.5 border-b border-amber-500/15 pb-2.5">
        <span class="text-emerald-400 font-extrabold not-italic font-mono text-xs mt-0.5">03.</span>
        <p class="italic"><span class="text-emerald-300 font-extrabold">In every smell,</span> <span class="text-slate-400 not-italic font-sans text-xs">-- မင်း ဘယ်လို အနံ့ပဲရရ ...</span></p>
      </div>

      <div class="flex items-start gap-2.5 border-b border-amber-500/15 pb-2.5">
        <span class="text-rose-400 font-extrabold not-italic font-mono text-xs mt-0.5">04.</span>
        <p class="italic"><span class="text-rose-300 font-extrabold">In every taste,</span> <span class="text-slate-400 not-italic font-sans text-xs">-- မင်း ဘာပဲစားစား ...</span></p>
      </div>

      <div class="flex items-start gap-2.5 border-b border-amber-500/15 pb-2.5">
        <span class="text-teal-400 font-extrabold not-italic font-mono text-xs mt-0.5">05.</span>
        <p class="italic"><span class="text-teal-300 font-extrabold">In every touch,</span> <span class="text-slate-400 not-italic font-sans text-xs">-- မင်း ဘာနဲ့ပဲ ထိတွေ့ရပါစေ ...</span></p>
      </div>

      <div class="pt-1">
        <div class="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/35 p-3.5 rounded-xl shadow-inner space-y-1">
          <p class="text-amber-300 font-black not-italic text-sm sm:text-base leading-relaxed flex items-center gap-2">
            <i class="fa-solid fa-quote-left text-amber-400/60 text-xs"></i>
            <span>In every thought -- မင်း ဘာပဲ တွေးတွေး ...</span>
          </p>
          <p class="text-xs sm:text-sm text-amber-200 font-extrabold tracking-wide pl-5">
            — stay mindful. -- အမြဲသတိ ထားပါလေ ...
          </p>
        </div>
      </div>
    </div>

    <div class="pt-3 flex flex-wrap items-center justify-between border-t border-amber-500/20 text-xs gap-2">
      <div class="flex items-center gap-1.5 font-extrabold text-amber-400">
        <i class="fa-solid fa-dharmachakra text-xs"></i>
        <span>Appamadena sampadetha</span>
        <span class="text-[11px] font-sans font-normal italic text-slate-400">— The Buddha</span>
      </div>
      <span class="text-[10px] font-extrabold px-3 py-1 rounded-full font-sans uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-inner">
        ERP Wisdom
      </span>
    </div>
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

  if (!res || !res.success) {
    container.innerHTML = `<div class="text-rose-400 text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">${window.escapeHtml(res ? res.message : "ဒေတာရယူ၍ မရပါ။")}</div>`;
    return;
  }

  const d = res.data;

  const breakdownRows = (d.perLevel || []).map(l => `
    <tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
      <td class="px-4 py-3 font-extrabold text-slate-200">${window.escapeHtml(l.name)}</td>
      <td class="px-4 py-3 text-sky-400 font-bold font-mono text-center">${l.male || 0}</td>
      <td class="px-4 py-3 text-rose-400 font-bold font-mono text-center">${l.female || 0}</td>
      <td class="px-4 py-3 text-amber-400 font-black font-mono text-center">${l.total || 0}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="space-y-6 view-panel">
      <!-- Top 3 KPI Cards -->
      ${statCardsHtml(d.totalActive, d.activeMale, d.activeFemale)}

      <!-- Grid: Mindfulness Reminder (Left) + Breakdown Table (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Mindfulness Reminder Card -->
        <div class="space-y-2">
          <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2 px-1">
            <i class="fa-solid fa-dharmachakra text-amber-400"></i>
            <span>Mindfulness Reminder</span>
          </h3>
          ${QUOTE_BOX_HTML}
        </div>

        <!-- Stage Breakdown Table (Active) -->
        <div class="space-y-2">
          <h3 class="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 px-1">
            <i class="fa-solid fa-chart-pie text-indigo-400"></i>
            <span>ကမ္မဋ္ဌာန်း အဆင့်အလိုက် စာရင်း (Active)</span>
          </h3>

          <div class="bg-[#0e172a] border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr>
                    <th class="px-4 py-3 text-left">ကမ္မဋ္ဌာန်း အဆင့်</th>
                    <th class="px-4 py-3 text-center">ကျား (MALE)</th>
                    <th class="px-4 py-3 text-center">မ (FEMALE)</th>
                    <th class="px-4 py-3 text-center">ACTIVE စုစုပေါင်း</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${breakdownRows}
                  <tr class="bg-[#080d1a] border-t-2 border-amber-500/20">
                    <td class="px-4 py-3.5 font-black text-amber-300 flex items-center gap-2">
                      <i class="fa-solid fa-user-tie text-indigo-400"></i>
                      <span>ဦးဆောင်ဆွေးနွေး ယောဂီ</span>
                    </td>
                    <td class="px-4 py-3.5 text-sky-400 font-extrabold font-mono text-center">${d.leaders ? d.leaders.male : 0}</td>
                    <td class="px-4 py-3.5 text-rose-400 font-extrabold font-mono text-center">${d.leaders ? d.leaders.female : 0}</td>
                    <td class="px-4 py-3.5 text-emerald-400 font-black font-mono text-center">${d.leaders ? d.leaders.total : 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
