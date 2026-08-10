/**
 * YOGI MANAGEMENT SYSTEM — Total Summary Matrix View
 * File: js/yogi-summary.js
 */

function statCardsSummaryHtml(total, male, female) {
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
 * Render Total Summary 7-Column Matrix Table (Matching User's Image 3)
 */
async function renderTotalSummary(searchVal = "") {
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

  // Filter Active stage groups (Level 1 to 7)
  const stageGroups = groups.filter(g => g.level <= 7);
  const searchLower = String(searchVal || "").trim().toLowerCase();

  const levelCols = stageGroups.map(g => {
    let rows = g.rows || [];
    if (searchLower) {
      rows = rows.filter(r => 
        String(r.name || "").toLowerCase().includes(searchLower) || 
        String(r.phone || "").includes(searchLower)
      );
    }
    return { level: g.level, name: g.name, rows };
  });

  const maxRows = Math.max(1, ...levelCols.map(c => c.rows.length));

  container.innerHTML = `
    <div class="space-y-5 view-panel">
      <!-- Top 3 KPI Cards -->
      ${statCardsSummaryHtml(stats.totalActive, stats.activeMale, stats.activeFemale)}

      <!-- Control Bar Wrapper -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; background: #0e172a; border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 1rem; padding: 0.85rem 1.25rem; margin-bottom: 1.25rem;">
        <div style="position: relative; flex: 1; min-width: 240px; max-width: 360px;">
          <input type="text" id="summary-search-input" value="${window.escapeHtml(searchVal)}" 
            onkeydown="if(event.key==='Enter') triggerSummarySearch()"
            placeholder="ယောဂီ အမည် / ဖုန်း ရှာဖွေရန်..." 
            style="width: 100%; padding: 0.5rem 0.85rem 0.5rem 2.2rem; background: #070a12; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 0.75rem; color: #f1f5f9; font-size: 0.8rem; outline: none;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.75rem;"></i>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button onclick="renderTotalSummary('')" class="btn-action" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 0.5rem 0.85rem;">
            <i class="fa-solid fa-rotate"></i> Refresh
          </button>
          <button onclick="window.exportYogiToExcel ? window.exportYogiToExcel('Total_Summary') : null" class="btn-action" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.5rem 0.85rem;">
            <i class="fa-solid fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>

      <!-- 💡 7-COLUMN MATRIX TABLE MATCHING USER'S HAND-DRAWN IMAGE 3 -->
      <div style="background-color: #0e172a; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 1rem; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
        <div style="overflow-x-auto;">
          <table style="width: 100%; text-align: center; border-collapse: collapse; font-size: 0.8rem;">
            <thead>
              <tr style="background: #080d1a; border-bottom: 2px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; font-weight: 800;">
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">သတိ</th>
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">ရုပ်</th>
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">နာမ်</th>
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">ရုပ်နာမ်</th>
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">ခန္ဓာငါးပါး</th>
                <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">ဥပါဒါနက္ခန္ဓာငါးပါး</th>
                <th style="padding: 12px; white-space: nowrap;">သိပါယ်ဆိုက်ပွား</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: maxRows }).map((_, rIdx) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  ${levelCols.map((col, cIdx) => {
                    const yogi = col.rows[rIdx];
                    const borderRight = cIdx < 6 ? 'border-right: 1px solid rgba(255,255,255,0.08);' : '';
                    return `
                      <td style="padding: 10px 8px; font-size: 0.8rem; white-space: nowrap; ${borderRight}">
                        ${yogi ? `
                          <div style="display: inline-flex; align-items: center; gap: 4px; font-weight: bold; color: #f1f5f9;">
                            <span>${window.escapeHtml(yogi.name)}</span>
                            <span style="font-size: 0.65rem; font-family: monospace; padding: 1px 4px; border-radius: 3px; ${yogi.gender === 'ကျား' ? 'color: #818cf8; background: rgba(99,102,241,0.15);' : 'color: #f472b6; background: rgba(236,72,153,0.15);'}">${yogi.gender}</span>
                          </div>
                        ` : ''}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function triggerSummarySearch() {
  const input = document.getElementById("summary-search-input");
  if (input) renderTotalSummary(input.value.trim());
}

// Global Window Exports
window.renderTotalSummary = renderTotalSummary;
window.triggerSummarySearch = triggerSummarySearch;
