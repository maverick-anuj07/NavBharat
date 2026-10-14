/**
 * CivicLoop - Indian Polity, Nashik Service Routing Matrix & Public Finance Explorer
 * Team Nav Bharat - HSC 2027 Prototype
 */

(function () {
  'use strict';

  window.renderGovernanceExplorer = function () {
    renderEconomicRecordsTable();
    renderRoutingMatrixTable();
    renderSourceRegistryTable();
  };

  function renderEconomicRecordsTable() {
    const tableBody = document.getElementById('economic-records-rows');
    if (!tableBody) return;

    const econData = window.CivicApp.economicRecords;
    if (!econData || !econData.records) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading economic reference data...</td></tr>`;
      return;
    }

    tableBody.innerHTML = econData.records.map(rec => {
      return `
        <tr>
          <td><span class="ref-badge">${rec.id}</span></td>
          <td><strong>${rec.entity}</strong></td>
          <td><span class="info-pill" style="font-size:0.7rem;">${rec.category}</span></td>
          <td style="white-space:nowrap;">${rec.fiscal_year} (${rec.stage})</td>
          <td><strong style="color:var(--primary); font-size:0.9rem;">₹${rec.amount_inr_crores.toLocaleString()} Cr</strong></td>
          <td style="font-size:0.78rem;">
            <a href="${rec.source_url}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:none;">🔗 ${rec.source_name}</a>
            <p style="color:var(--text-dim); margin-top:0.2rem;">${rec.caveat}</p>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderRoutingMatrixTable() {
    const tableBody = document.getElementById('routing-matrix-rows');
    if (!tableBody) return;

    const routesData = window.CivicApp.routes;
    if (!routesData || !routesData.service_routes) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading Nashik routing matrix...</td></tr>`;
      return;
    }

    tableBody.innerHTML = routesData.service_routes.map(rt => {
      const isRural = rt.locality_type === 'rural';
      const locTag = isRural
        ? `<span style="background:rgba(245, 158, 11, 0.15); color:var(--amber); padding:0.15rem 0.45rem; border-radius:var(--radius-full); font-size:0.7rem; font-weight:700;">RURAL</span>`
        : `<span style="background:rgba(56, 189, 248, 0.15); color:var(--primary); padding:0.15rem 0.45rem; border-radius:var(--radius-full); font-size:0.7rem; font-weight:700;">URBAN</span>`;

      return `
        <tr>
          <td><span class="ref-badge">${rt.domain.replace('_', ' ')}</span></td>
          <td>${locTag}</td>
          <td><strong>${rt.responsible_institution}</strong></td>
          <td style="font-size:0.78rem;">${rt.routing_condition}</td>
          <td style="font-size:0.76rem; color:var(--text-muted);">${rt.statutory_reference}</td>
          <td><strong style="color:var(--emerald);">${rt.illustrative_sla_days} Days</strong></td>
          <td style="font-size:0.78rem; color:#cbd5e1;">${rt.escalation_channel}</td>
        </tr>
      `;
    }).join('');
  }

  function renderSourceRegistryTable() {
    const tableBody = document.getElementById('source-registry-rows');
    if (!tableBody) return;

    const govData = window.CivicApp.governance;
    if (!govData || !govData.source_registry) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading source provenance registry...</td></tr>`;
      return;
    }

    tableBody.innerHTML = govData.source_registry.map(src => {
      return `
        <tr>
          <td><span class="ref-badge">${src.source_id}</span></td>
          <td><strong>${src.organization}</strong></td>
          <td>${src.dataset_name}</td>
          <td>
            <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:underline; font-size:0.78rem;">
              ${src.url}
            </a>
          </td>
          <td>
            <span class="trust-badge" style="display:block; margin-bottom:0.2rem;">${src.trust_level}</span>
            <small style="color:var(--text-dim);">${src.data_license}</small>
          </td>
          <td style="white-space:nowrap; font-size:0.78rem;">${src.access_date}</td>
        </tr>
      `;
    }).join('');
  }

})();
