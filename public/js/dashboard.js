/**
 * CivicLoop - Public Dashboard & Shared Concerns Spotlight
 * Team Nav Bharat - HSC 2027 Prototype
 */

(function () {
  'use strict';

  function getStatusClass(status) {
    switch (status) {
      case 'Received': return 'status-received';
      case 'Awaiting human review': return 'status-review';
      case 'Corroboration review': return 'status-review';
      case 'Referred to verified service owner': return 'status-referred';
      case 'Response received': return 'status-responded';
      case 'Resolved': return 'status-resolved';
      case 'Closed with reason': return 'status-closed';
      default: return 'status-received';
    }
  }

  function getDomainBadgeClass(domain) {
    if (domain.includes('education')) return 'education';
    if (domain.includes('health')) return 'healthcare';
    if (domain.includes('water')) return 'water';
    if (domain.includes('worker')) return 'worker';
    return 'general';
  }

  function formatDaysAgo(dateString) {
    if (!dateString) return '';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return window.CivicApp.lang === 'mr' ? 'आज दाखल' : 'Logged today';
    if (days === 1) return window.CivicApp.lang === 'mr' ? '१ दिवसापूर्वी' : '1 day ago';
    return window.CivicApp.lang === 'mr' ? `${days} दिवसांपूर्वी` : `${days} days ago`;
  }

  window.renderDashboard = function () {
    const reports = window.CivicApp.reports || [];
    const lang = window.CivicApp.lang;

    // 1. Update Metrics
    const totalCount = reports.length;
    const totalSharedVoices = reports.reduce((acc, r) => acc + (r.aggregate_count || 1), 0);
    const resolvedOrResponded = reports.filter(r => r.status === 'Resolved' || r.status === 'Response received').length;
    const resolutionPct = totalCount > 0 ? Math.round((resolvedOrResponded / totalCount) * 100) : 0;

    const elTotal = document.getElementById('stat-total-issues');
    const elShared = document.getElementById('stat-shared-citizens');
    const elResRate = document.getElementById('stat-resolution-rate');

    if (elTotal) elTotal.textContent = totalCount;
    if (elShared) elShared.textContent = totalSharedVoices;
    if (elResRate) elResRate.textContent = `${resolutionPct}%`;

    // 2. Render Shared Concerns Spotlight (Education, Healthcare, Water, Worker)
    const sharedContainer = document.getElementById('shared-concerns-container');
    if (sharedContainer) {
      const sharedReports = reports.filter(r => r.report_mode === 'shared_recurring_concern' || r.report_mode === 'event_service_update' || (r.aggregate_count && r.aggregate_count > 1));

      if (sharedReports.length === 0) {
        sharedContainer.innerHTML = `<p class="section-note">${lang === 'mr' ? 'कोणतीही सामायिक तक्रार उपलब्ध नाही.' : 'No shared concerns found.'}</p>`;
      } else {
        sharedContainer.innerHTML = sharedReports.map(item => {
          const title = (lang === 'mr' && item.title_mr) ? item.title_mr : item.title;
          const statusText = (lang === 'mr' && item.status_mr) ? item.status_mr : item.status;
          const domainBadgeCls = getDomainBadgeClass(item.domain);

          return `
            <div class="shared-card" onclick="window.openIssueModal('${item.id}')" tabindex="0" role="button" aria-label="View shared concern ${item.id}">
              <div>
                <div class="shared-header">
                  <span class="shared-domain-badge ${domainBadgeCls}">${item.domain.replace('_', ' ')}</span>
                  <span class="aggregate-badge" title="Aggregate submissions in cluster">
                    👥 ${item.aggregate_count} ${lang === 'mr' ? 'सह-नोंदी' : 'Voices'}
                  </span>
                </div>
                <h4 class="shared-title">${title}</h4>
                <div class="shared-locality">📍 ${item.coarse_locality}</div>
              </div>
              <div class="shared-footer">
                <span class="status-badge ${getStatusClass(item.status)}">${statusText}</span>
                <span class="ref-badge">${item.id}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Filter and Render Public Feed
    filterAndRenderFeed();
  };

  function filterAndRenderFeed() {
    const reports = window.CivicApp.reports || [];
    const lang = window.CivicApp.lang;

    const query = (document.getElementById('search-query')?.value || '').toLowerCase().trim();
    const domainFilter = document.getElementById('filter-domain')?.value || 'all';
    const statusFilter = document.getElementById('filter-status')?.value || 'all';
    const talukaFilter = document.getElementById('filter-taluka')?.value || 'all';

    const filtered = reports.filter(item => {
      // Domain filter
      if (domainFilter !== 'all' && item.domain !== domainFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      // Taluka filter
      if (talukaFilter !== 'all' && item.taluka !== talukaFilter) return false;
      // Search query
      if (query) {
        const titleMatch = (item.title || '').toLowerCase().includes(query) || (item.title_mr || '').toLowerCase().includes(query);
        const locMatch = (item.coarse_locality || '').toLowerCase().includes(query);
        const refMatch = (item.id || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        if (!titleMatch && !locMatch && !refMatch && !descMatch) return false;
      }
      return true;
    });

    const listEl = document.getElementById('public-issues-list');
    const countEl = document.getElementById('issues-result-count');

    if (countEl) {
      countEl.textContent = lang === 'mr'
        ? `${filtered.length} समस्या दर्शवत आहे`
        : `Showing ${filtered.length} issues`;
    }

    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-selection-placeholder">
          <div class="placeholder-icon">🔎</div>
          <h4>${lang === 'mr' ? 'कोणतीही तक्रार आढळली नाही' : 'No matching issues found'}</h4>
          <p>${lang === 'mr' ? 'कृपया फिल्टर किंवा शोध शब्द बदलून पहा.' : 'Try adjusting your filters or search keywords.'}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const title = (lang === 'mr' && item.title_mr) ? item.title_mr : item.title;
      const desc = (lang === 'mr' && item.description_mr) ? item.description_mr : item.description;
      const statusText = (lang === 'mr' && item.status_mr) ? item.status_mr : item.status;
      const timeLabel = formatDaysAgo(item.submitted_at);

      return `
        <article class="issue-card" onclick="window.openIssueModal('${item.id}')" tabindex="0" role="article" aria-label="Issue ${item.id}: ${title}">
          <div class="issue-card-top">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="ref-badge">${item.id}</span>
              <span class="status-badge ${getStatusClass(item.status)}">${statusText}</span>
              ${item.aggregate_count > 1 ? `<span class="aggregate-badge">👥 ${item.aggregate_count} ${lang === 'mr' ? 'सह-नोंदी' : 'Grouped'}</span>` : ''}
            </div>
            <span style="font-size:0.75rem; color:var(--text-dim);">${timeLabel}</span>
          </div>

          <h3 class="issue-title">${title}</h3>
          <p class="issue-desc">${desc}</p>

          <div class="issue-meta-row">
            <span class="meta-loc">📍 <strong>${item.coarse_locality}</strong></span>
            <span class="meta-inst">${lang === 'mr' ? 'जबाबदार संस्था:' : 'Service Owner:'} <strong>${item.assigned_institution}</strong></span>
          </div>
        </article>
      `;
    }).join('');
  }

  // Issue Detail Modal Controller
  window.openIssueModal = function (issueId) {
    const report = window.CivicApp.reports.find(r => r.id === issueId);
    if (!report) return;

    const modal = document.getElementById('issue-detail-modal');
    const modalContent = document.getElementById('modal-body-content');
    const refEl = document.getElementById('modal-ref-id');
    const statusEl = document.getElementById('modal-status-badge');
    const lang = window.CivicApp.lang;

    if (refEl) refEl.textContent = report.id;
    if (statusEl) {
      statusEl.className = `status-badge ${getStatusClass(report.status)}`;
      statusEl.textContent = (lang === 'mr' && report.status_mr) ? report.status_mr : report.status;
    }

    const title = (lang === 'mr' && report.title_mr) ? report.title_mr : report.title;
    const desc = (lang === 'mr' && report.description_mr) ? report.description_mr : report.description;

    const historyHtml = (report.history || []).map(h => {
      const timeStr = new Date(h.timestamp).toLocaleString();
      return `
        <div class="timeline-event">
          <div class="event-top">
            <span class="event-action">${h.action}</span>
            <span class="event-time">${timeStr}</span>
          </div>
          <div class="event-actor">${h.actor}</div>
          <p class="event-notes">${h.notes}</p>
        </div>
      `;
    }).join('');

    modalContent.innerHTML = `
      <div style="margin-bottom:1.25rem;">
        <span class="banner-badge" style="margin-bottom:0.6rem; display:inline-block;">${report.fictional_disclaimer}</span>
        <h2 style="font-size:1.35rem; color:#ffffff; margin-bottom:0.4rem;">${title}</h2>
        <div style="font-size:0.85rem; color:var(--text-muted); display:flex; gap:1.25rem; flex-wrap:wrap;">
          <span>📍 <strong>${report.coarse_locality}</strong></span>
          <span>🏛️ <strong>${report.assigned_institution}</strong></span>
        </div>
      </div>

      <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:1.25rem;">
        <h4 style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.4rem;">
          ${lang === 'mr' ? 'समस्या तपशील:' : 'Issue Observations:'}
        </h4>
        <p style="font-size:0.92rem; color:#e2e8f0; line-height:1.6;">${desc}</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.25rem;">
        <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <small style="color:var(--text-dim); display:block;">${lang === 'mr' ? 'वैधानिक आधार' : 'Statutory Mandate'}</small>
          <strong style="color:#ffffff; font-size:0.85rem;">${report.statutory_mandate || 'Public Service Guarantee'}</strong>
        </div>
        <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <small style="color:var(--text-dim); display:block;">${lang === 'mr' ? 'नागरिक सनद उद्दिष्ट' : 'Citizen Charter SLA'}</small>
          <strong style="color:var(--primary); font-size:0.85rem;">${report.sla_days_standard ? report.sla_days_standard + ' Working Days' : '5 Days'}</strong>
        </div>
      </div>

      <!-- AI & Safeguards Disclosures -->
      <div class="ai-safeguard-box" style="margin-bottom:1.25rem;">
        <strong>🛡️ AI Heuristic & Safeguard Status:</strong>
        <p style="margin-top:0.25rem; font-size:0.78rem;">
          ${report.ai_assistance ? report.ai_assistance.uncertainty_label : 'AI classification is purely advisory heurisitic.'}
        </p>
        <p style="margin-top:0.25rem; font-size:0.76rem; color:var(--emerald);">
          ✓ ${report.ai_assistance ? report.ai_assistance.redaction_applied : 'Personal identifiers stripped prior to publication.'}
        </p>
      </div>

      <!-- Chronological Institutional Timeline -->
      <h4 style="font-size:0.95rem; font-weight:700; color:#ffffff; margin-bottom:0.5rem;">
        ${lang === 'mr' ? 'संस्थात्मक प्रतिसाद व प्रगती इतिहास' : 'Institutional Response & Review History'}
      </h4>
      <div class="modal-timeline">
        ${historyHtml}
      </div>
    `;

    modal.classList.remove('hidden');
  };

  window.closeIssueModal = function () {
    const modal = document.getElementById('issue-detail-modal');
    if (modal) modal.classList.add('hidden');
  };

  // Attach search and filter event listeners
  document.addEventListener('DOMContentLoaded', () => {
    ['search-query', 'filter-domain', 'filter-status', 'filter-taluka'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', filterAndRenderFeed);
        el.addEventListener('change', filterAndRenderFeed);
      }
    });

    // Close modal on escape key or backdrop click
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') window.closeIssueModal();
    });

    const modal = document.getElementById('issue-detail-modal');
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) window.closeIssueModal();
      });
    }
  });

})();
