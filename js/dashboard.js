/**
 * YOGI MANAGEMENT SYSTEM — Home Dashboard
 * File: js/dashboard.js
 */

const QUOTE_BOX_HTML = `
  <div class="mindfulness-card" style="background: linear-gradient(145deg, #0e172a 0%, #090f1e 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 1.25rem; padding: 1.25rem;">
    <div style="display: flex; flex-direction: column; gap: 0.75rem; font-family: Georgia, serif; font-size: 0.85rem; line-height: 1.6;">
      <div style="display: flex; align-items: flex-start; gap: 0.5rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 0.5rem;">
        <span style="color: #f59e0b; font-weight: 800; font-family: monospace;">01.</span>
        <p style="margin: 0; font-style: italic;"><span style="color: #fef08a; font-weight: 800;">In every sight,</span> <span style="color: #94a3b8; font-style: normal; font-family: sans-serif; font-size: 0.75rem;">-- မင်း ဘာပဲမြင်မြင် ...</span></p>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 0.5rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 0.5rem;">
        <span style="color: #38bdf8; font-weight: 800; font-family: monospace;">02.</span>
        <p style="margin: 0; font-style: italic;"><span style="color: #7dd3fc; font-weight: 800;">In every sound,</span> <span style="color: #94a3b8; font-style: normal; font-family: sans-serif; font-size: 0.75rem;">-- မင်း ဘာပဲကြားကြား ...</span></p>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 0.5rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 0.5rem;">
        <span style="color: #34d399; font-weight: 800; font-family: monospace;">03.</span>
        <p style="margin: 0; font-style: italic;"><span style="color: #6ee7b7; font-weight: 800;">In every smell,</span> <span style="color: #94a3b8; font-style: normal; font-family: sans-serif; font-size: 0.75rem;">-- မင်း ဘယ်လို အနံ့ပဲရရ ...</span></p>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 0.5rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 0.5rem;">
        <span style="color: #fb7185; font-weight: 800; font-family: monospace;">04.</span>
        <p style="margin: 0; font-style: italic;"><span style="color: #fda4af; font-weight: 800;">In every taste,</span> <span style="color: #94a3b8; font-style: normal; font-family: sans-serif; font-size: 0.75rem;">-- မင်း ဘာပဲစားစား ...</span></p>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 0.5rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 0.5rem;">
        <span style="color: #2dd4bf; font-weight: 800; font-family: monospace;">05.</span>
        <p style="margin: 0; font-style: italic;"><span style="color: #5eead4; font-weight: 800;">In every touch,</span> <span style="color: #94a3b8; font-style: normal; font-family: sans-serif; font-size: 0.75rem;">-- မင်း ဘာနဲ့ပဲ ထိတွေ့ရပါစေ ...</span></p>
      </div>

      <div style="padding-top: 0.25rem;">
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); padding: 0.85rem; border-radius: 0.75rem;">
          <p style="margin: 0; color: #fde047; font-weight: 900; font-style: normal; font-size: 0.9rem;">
            <i class="fa-solid fa-quote-left" style="color: rgba(245, 158, 11, 0.6); margin-right: 0.3rem;"></i>
            In every thought -- မင်း ဘာပဲ တွေးတွေး ...
          </p>
          <p style="margin: 0.3rem 0 0 1.25rem; color: #fef08a; font-weight: 800; font-size: 0.8rem;">
            — stay mindful. -- အမြဲသတိ ထားပါလေ ...
          </p>
        </div>
      </div>
    </div>

    <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(245, 158, 11, 0.2); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 800; color: #fbbf24;">
        <i class="fa-solid fa-dharmachakra"></i>
        <span>Appamadena sampadetha</span>
        <span style="font-weight: normal; font-style: italic; color: #94a3b8; font-size: 0.65rem;">— The Buddha</span>
      </div>
      <span style="font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 100px; background: rgba(245, 158, 11, 0.15); color: #fef08a; border: 1px solid rgba(245, 158, 11, 0.3);">
        ERP Wisdom
      </span>
    </div>
  </div>
`;

function statCardsHtml(total, male, female) {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; width: 100%; margin-bottom: 1.25rem;">
      <!-- Total Active -->
      <div style="background: linear-gradient(135deg, #111a2e 0%, #0a1120 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="width: 2.75rem; height: 2.75rem; min-width: 2.75rem; min-height: 2.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
          <i class="fa-solid fa-users"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <p style="margin: 0; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">TOTAL ACTIVE</p>
          <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #fbbf24; font-family: monospace;">${total || 0} ဦး</h3>
        </div>
      </div>

      <!-- Male Active -->
      <div style="background: linear-gradient(135deg, #111a2e 0%, #0a1120 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="width: 2.75rem; height: 2.75rem; min-width: 2.75rem; min-height: 2.75rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
          <i class="fa-solid fa-mars"></i>
        </div>
        <div style="display: flex; flex-direction: column;">
          <p style="margin: 0; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">ACTIVE MALE</p>
          <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #818cf8; font-family: monospace;">${male || 0} ဦး</h3>
        </div>
      </div>

      <!-- Female Active -->
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
    container.innerHTML = `<div style="color: #f87171; font-size: 0.8rem; padding: 1rem; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); border-radius: 0.75rem; text-align: center;">${window.escapeHtml(res ? res.message : "ဒေတာရယူ၍ မရပါ။")}</div>`;
    return;
  }

  const d = res.data;

  const breakdownRows = (d.perLevel || []).map(l => `
    <tr style="border-bottom: 1px solid rgba(30, 41, 59, 0.5);">
      <td style="padding: 10px 14px; font-weight: 800; color: #e2e8f0;">${window.escapeHtml(l.name)}</td>
      <td style="padding: 10px 14px; color: #38bdf8; font-weight: bold; font-family: monospace; text-align: center;">${l.male || 0}</td>
      <td style="padding: 10px 14px; color: #fb7185; font-weight: bold; font-family: monospace; text-align: center;">${l.female || 0}</td>
      <td style="padding: 10px 14px; color: #fbbf24; font-weight: 900; font-family: monospace; text-align: center;">${l.total || 0}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="space-y-6 view-panel">
      <!-- Top 3 KPI Cards -->
      ${statCardsHtml(d.totalActive, d.activeMale, d.activeFemale)}

      <!-- Grid: Mindfulness Reminder (Left) + Breakdown Table (Right) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; width: 100%;">
        <!-- Mindfulness Reminder Card -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <h3 style="margin: 0; font-size: 0.75rem; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-dharmachakra"></i>
            <span>Mindfulness Reminder</span>
          </h3>
          ${QUOTE_BOX_HTML}
        </div>

        <!-- Stage Breakdown Table (Active) -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <h3 style="margin: 0; font-size: 0.75rem; font-weight: 900; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-chart-pie" style="color: #818cf8;"></i>
            <span>ကမ္မဋ္ဌာန်း အဆင့်အလိုက် စာရင်း (Active)</span>
          </h3>

          <div style="background-color: #0e172a; border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 1.25rem; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="overflow-x-auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                  <tr style="background-color: #080d1a; border-bottom: 2px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.72rem; font-weight: 800;">
                    <th style="padding: 12px 14px; text-align: left;">ကမ္မဋ္ဌာန်း အဆင့်</th>
                    <th style="padding: 12px 14px; text-align: center;">ကျား (MALE)</th>
                    <th style="padding: 12px 14px; text-align: center;">မ (FEMALE)</th>
                    <th style="padding: 12px 14px; text-align: center;">ACTIVE စုစုပေါင်း</th>
                  </tr>
                </thead>
                <tbody>
                  ${breakdownRows}
                  <tr style="background-color: #080d1a; border-top: 2px solid rgba(245, 158, 11, 0.25);">
                    <td style="padding: 12px 14px; font-weight: 900; color: #fbbf24; display: flex; align-items: center; gap: 0.5rem;">
                      <i class="fa-solid fa-user-tie" style="color: #818cf8;"></i>
                      <span>ဦးဆောင်ဆွေးနွေး ယောဂီ</span>
                    </td>
                    <td style="padding: 12px 14px; color: #38bdf8; font-weight: 900; font-family: monospace; text-align: center;">${d.leaders ? d.leaders.male : 0}</td>
                    <td style="padding: 12px 14px; color: #fb7185; font-weight: 900; font-family: monospace; text-align: center;">${d.leaders ? d.leaders.female : 0}</td>
                    <td style="padding: 12px 14px; color: #34d399; font-weight: 900; font-family: monospace; text-align: center;">${d.leaders ? d.leaders.total : 0}</td>
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
