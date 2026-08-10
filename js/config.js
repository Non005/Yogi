/**
 * YOGI MANAGEMENT SYSTEM — Dashboard View
 * File: js/dashboard.js
 */

async function renderDashboard() {
  const container = document.getElementById("view-container");
  if (!container) return;

  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.innerText = "ပင်မစာမျက်နှာ";

  window.toggleLoading(true);
  let stats = { totalActive: 0, activeMale: 0, activeFemale: 0, perLevel: [], leaders: { total: 0, male: 0, female: 0 } };

  try {
    const res = await window.callApi("getDashboardData");
    if (res.success && res.data) {
      stats = res.data;
    }
  } catch (e) {
    console.error("getDashboardData error", e);
  } finally {
    window.toggleLoading(false);
  }

  const levelsData = stats.perLevel || [];
  
  // Calculate Grand Totals
  let sumMale = 0, sumFemale = 0, sumTotal = 0;
  levelsData.forEach(l => {
    sumMale += l.male || 0;
    sumFemale += l.female || 0;
    sumTotal += l.total || 0;
  });
  sumMale += stats.leaders.male || 0;
  sumFemale += stats.leaders.female || 0;
  sumTotal += stats.leaders.total || 0;

  let rowsHtml = "";
  (window.LEVELS || []).forEach(l => {
    const s = levelsData.find(item => item.level === l.id) || { male: 0, female: 0, total: 0 };
    rowsHtml += `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3 font-bold text-slate-200">${l.name}</td>
        <td class="p-3 text-center font-mono font-bold text-indigo-400">${s.male || 0}</td>
        <td class="p-3 text-center font-mono font-bold text-pink-400">${s.female || 0}</td>
        <td class="p-3 text-center font-mono font-black text-amber-400 bg-amber-500/5">${s.total || 0}</td>
      </tr>
    `;
  });

  // Leaders Row
  rowsHtml += `
    <tr class="hover:bg-slate-800/40 transition border-t border-slate-800">
      <td class="p-3 font-bold text-indigo-300">ဦးဆောင်ဆွေးနွေး ယောဂီ</td>
      <td class="p-3 text-center font-mono font-bold text-indigo-400">${stats.leaders.male || 0}</td>
      <td class="p-3 text-center font-mono font-bold text-pink-400">${stats.leaders.female || 0}</td>
      <td class="p-3 text-center font-mono font-black text-amber-400 bg-amber-500/5">${stats.leaders.total || 0}</td>
    </tr>
  `;

  container.innerHTML = `
    <div class="space-y-6 view-panel">
      <!-- Top 3 KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stats-card">
          <div class="bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <p>TOTAL ACTIVE</p>
            <h3 class="text-amber-400">${stats.totalActive || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i class="fa-solid fa-mars"></i>
          </div>
          <div>
            <p>ACTIVE MALE</p>
            <h3 class="text-indigo-400">${stats.activeMale || 0} ဦး</h3>
          </div>
        </div>
        <div class="stats-card">
          <div class="bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <i class="fa-solid fa-venus"></i>
          </div>
          <div>
            <p>ACTIVE FEMALE</p>
            <h3 class="text-pink-400">${stats.activeFemale || 0} ဦး</h3>
          </div>
        </div>
      </div>

      <!-- Quote Box Section -->
      <div class="p-5 rounded-2xl space-y-3 font-serif italic text-xs sm:text-sm shadow-xl border border-amber-500/30 bg-[#0c1424] relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <p style="color: #fef08a;" class="leading-relaxed font-semibold">In every sight, -- မင်း ဘာပဲမြင်မြင် ... </p>
        <p style="color: #7dd3fc;" class="leading-relaxed font-semibold">In every sound, -- မင်း ဘာပဲကြားကြား ... </p>
        <p style="color: #6ee7b7;" class="leading-relaxed font-semibold">In every smell, -- မင်း ဘယ်လို အနံ့ပဲရရ ...</p>
        <p style="color: #fda4af;" class="leading-relaxed font-semibold">In every taste, -- မင်း ဘာပဲစားစား ... </p>
        <p style="color: #5eead4;" class="leading-relaxed font-semibold">In every touch, -- မင်း ဘာနဲ့ပဲ ထိတွေ့ရပါစေ ... </p>
        <p style="color: #fbbf24; border-top: 1px solid rgba(245, 158, 11, 0.25);" class="font-extrabold not-italic pt-3 text-xs sm:text-sm leading-relaxed">In every thought -- မင်း ဘာပဲ တွေးတွေး... —stay mindful. -- အမြဲသတိ ထားပါလေ ...</p>

        <div class="pt-3 flex justify-between items-center text-xs border-t border-amber-500/20">
          <span class="font-black text-amber-400">Appamadena sampadetha <span class="font-sans font-normal italic text-[10px] text-amber-500">— The Buddha</span></span>
          <span class="text-[9px] font-black px-3 py-1 rounded-full font-sans uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">ERP Wisdom</span>
        </div>
      </div>

      <!-- Summary Distribution Table -->
      <div class="bg-[#0e1626] border border-slate-800/80 rounded-2xl p-5 shadow-2xl table-container">
        <h3 class="font-extrabold text-sm text-slate-100 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-amber-400"></i>
          ယောဂီစာရင်း အကျဉ်းချုပ် ဇယား
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-[#070b16] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th class="p-3">ကမ္မဋ္ဌာန်း အဆင့် / စာရင်း</th>
                <th class="p-3 text-center">ကျား</th>
                <th class="p-3 text-center">မ</th>
                <th class="p-3 text-center bg-amber-500/10 text-amber-400">စုစုပေါင်း (Active)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${rowsHtml}
            </tbody>
            <tfoot class="bg-[#070b16] font-black border-t-2 border-slate-700 text-slate-100">
              <tr>
                <td class="p-3 uppercase">စုစုပေါင်း (Grand Total)</td>
                <td class="p-3 text-center font-mono text-indigo-400">${sumMale}</td>
                <td class="p-3 text-center font-mono text-pink-400">${sumFemale}</td>
                <td class="p-3 text-center font-mono text-amber-400 text-sm bg-amber-500/10">${sumTotal} ဦး</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.renderDashboard = renderDashboard;
