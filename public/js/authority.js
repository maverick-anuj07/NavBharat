/**
 * CivicLoop - Authority Reviewer Workspace & Auditable Escalation Engine
 * Team Nav Bharat - HSC 2027 Prototype
 */

(function () {
  'use strict';

  let activeFilter = 'all';

  window.initAuthorityWorkspace = function () {
    // Attach Filter Buttons
    document.querySelectorAll('[data-auth-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-auth-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-auth-filter');
        window.renderAuthorityQueue();
      });
    });

    // Attach Status Action Buttons
    document.querySelectorAll('.status-btn[data-new-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newStatus = btn.getAttribute('data-new-status');
        updateCaseStatus(newStatus);
      });
    });

    window.renderAuthorityQueue();
  };

  window.renderAuthorityQueue = function () {
    const reports = window.CivicApp.reports || [];
    const listEl = document.getElementById('authority-queue-list');
    const pendingEl = document.getElementById('auth-pending-count');
    const actionedEl = document.getElementById('auth-actioned-count');
    const lang = window.CivicApp.lang;

    // Calculate Triage Desk Counts
    const pending = reports.filter(r => r.status === 'Received' || r.status === 'Awaiting human review' || r.status === 'Corroboration review').length;
    const actioned = reports.filter(r => r.status === 'Referred to verified service owner' || r.status === 'Response received' || r.status === 'Resolved').length;

    if (pendingEl) pendingEl.textContent = pending;
    if (actionedEl) actionedEl.textContent = actioned;

    // Filter Queue
    const filtered = reports.filter(r => {
      if (activeFilter === 'review') {
        return r.status === 'Received' || r.status === 'Awaiting human review' || r.status === 'Corroboration review';
      }
      if (activeFilter === 'escalated') {
        return !!r.escalation;
      }
      return true;
    });

    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-selection-placeholder"><p>No cases matching filter.</p></div>`;
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const isSelected = item.id === window.CivicApp.selectedCaseId;
      const title = (lang === 'mr' && item.title_mr) ? item.title_mr : item.title;
      const statusText = (lang === 'mr' && item.status_mr) ? item.status_mr : item.status;

      return `
        <div class="queue-item ${isSelected ? 'active' : ''}" onclick="window.selectAuthorityCase('${item.id}')" tabindex="0" role="button" aria-label="Select case ${item.id}">
          <div class="queue-item-top">
            <span class="ref-badge">${item.id}</span>
            <span class="status-badge" style="font-size:0.7rem;">${statusText}</span>
          </div>
          <div class="queue-item-title">${title}</div>
          <div class="queue-item-sub">📍 ${item.coarse_locality}</div>
          ${item.escalation ? `<div style="font-size:0.72rem; color:var(--amber); margin-top:0.3rem;">⚡ Escalated: ${item.escalation.escalated_to}</div>` : ''}
        </div>
      `;
    }).join('');

    // If no case is selected yet, select the first one
    if (!window.CivicApp.selectedCaseId && filtered.length > 0) {
      window.selectAuthorityCase(filtered[0].id);
    } else if (window.CivicApp.selectedCaseId) {
      window.selectAuthorityCase(window.CivicApp.selectedCaseId);
    }

    // Also re-render Audit Log table
    renderAuditLogs();
  };

  window.selectAuthorityCase = function (caseId) {
    window.CivicApp.selectedCaseId = caseId;
    const report = window.CivicApp.reports.find(r => r.id === caseId);

    // Update active highlight in queue
    document.querySelectorAll('.queue-item').forEach(el => {
      el.classList.toggle('active', el.textContent.includes(caseId));
    });

    const emptyState = document.getElementById('auth-empty-state');
    const workspaceCard = document.getElementById('auth-workspace-card');

    if (!report) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (workspaceCard) workspaceCard.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (workspaceCard) workspaceCard.classList.remove('hidden');

    const lang = window.CivicApp.lang;
    const title = (lang === 'mr' && report.title_mr) ? report.title_mr : report.title;
    const statusText = (lang === 'mr' && report.status_mr) ? report.status_mr : report.status;

    // Fill elements
    const idEl = document.getElementById('ws-case-id');
    const badgeEl = document.getElementById('ws-status-badge');
    const aggEl = document.getElementById('ws-aggregate-pill');
    const titleEl = document.getElementById('ws-case-title');
    const locEl = document.getElementById('ws-case-locality');
    const instEl = document.getElementById('ws-assigned-institution');
    const statuteEl = document.getElementById('ws-statutory-basis');
    const dueDateInput = document.getElementById('ws-due-date-input');

    if (idEl) idEl.textContent = report.id;
    if (badgeEl) {
      badgeEl.textContent = statusText;
      badgeEl.className = `status-badge ${getStatusBadgeClass(report.status)}`;
    }
    if (aggEl) {
      aggEl.textContent = `${report.aggregate_count || 1} Reports Clustered`;
    }
    if (titleEl) titleEl.textContent = title;
    if (locEl) locEl.textContent = `📍 ${report.coarse_locality}`;
    if (instEl) instEl.textContent = report.assigned_institution || "Nashik Triage Desk";
    if (statuteEl) statuteEl.textContent = report.statutory_mandate || "Citizen Charter RTS Standard";

    if (dueDateInput && report.due_date) {
      dueDateInput.value = report.due_date.substring(0, 10);
    }
  };

  function getStatusBadgeClass(status) {
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

  async function updateCaseStatus(newStatus) {
    const caseId = window.CivicApp.selectedCaseId;
    if (!caseId) return;

    const report = window.CivicApp.reports.find(r => r.id === caseId);
    if (!report) return;

    report.status = newStatus;
    report.status_mr = newStatus;

    const timestamp = new Date().toISOString();
    report.history.push({
      timestamp: timestamp,
      actor: "Reviewing Officer (Nashik Triage Desk)",
      action: `Status changed to: ${newStatus}`,
      notes: `Review officer transition applied in triage workspace.`
    });

    // Also record in system audit log
    window.CivicApp.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timestamp,
      actor: "Reviewing Officer (Grievance Cell)",
      action: "STATUS_TRANSITION",
      target_id: caseId,
      reason: `Case moved to ${newStatus}.`
    });

    // Send PATCH to backend if active
    try {
      await fetch(`/api/reports/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          status_mr: newStatus,
          actor: "Reviewing Officer (Nashik Triage Desk)",
          response_note: `Status updated to ${newStatus}`
        })
      });
    } catch (e) {
      console.warn("Could not patch status to server", e);
    }

    window.selectAuthorityCase(caseId);
    window.renderAuthorityQueue();
    if (window.renderDashboard) window.renderDashboard();
  }

  window.saveInstitutionalResponse = async function () {
    const caseId = window.CivicApp.selectedCaseId;
    if (!caseId) return;

    const textarea = document.getElementById('ws-response-text');
    const note = textarea ? textarea.value.trim() : '';

    if (!note) {
      alert("Please enter an official response statement or work order details.");
      return;
    }

    const report = window.CivicApp.reports.find(r => r.id === caseId);
    if (!report) return;

    const timestamp = new Date().toISOString();
    report.status = "Response received";
    report.status_mr = "संस्थेकडून प्रतिसाद प्राप्त";

    report.history.push({
      timestamp: timestamp,
      actor: "Authorized Service Owner (Operational Wing)",
      action: "Official Institutional Response Recorded",
      notes: note
    });

    // Audit log
    window.CivicApp.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timestamp,
      actor: "Service Owner Representative",
      action: "INSTITUTIONAL_RESPONSE_PUBLISHED",
      target_id: caseId,
      reason: note
    });

    try {
      await fetch(`/api/reports/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: "Response received",
          actor: "Authorized Service Owner",
          response_note: note
        })
      });
    } catch (e) {
      console.warn("Could not patch response note to server", e);
    }

    if (textarea) textarea.value = '';
    alert("Institutional update successfully recorded and published to the public record.");

    window.selectAuthorityCase(caseId);
    window.renderAuthorityQueue();
    if (window.renderDashboard) window.renderDashboard();
  };

  window.triggerHumanEscalation = async function () {
    const caseId = window.CivicApp.selectedCaseId;
    if (!caseId) return;

    const authoritySelect = document.getElementById('ws-escalate-authority');
    const reasonTextarea = document.getElementById('ws-escalate-reason');

    const targetAuthority = authoritySelect ? authoritySelect.value : "District Collectorate";
    const reason = reasonTextarea ? reasonTextarea.value.trim() : '';

    if (!reason) {
      alert("Auditable justification is MANDATORY for human escalation. Please state the ground (e.g. SLA breach, public safety risk).");
      return;
    }

    const report = window.CivicApp.reports.find(r => r.id === caseId);
    if (!report) return;

    const timestamp = new Date().toISOString();

    report.escalation = {
      escalated_at: timestamp,
      escalated_by: "Designated Triage Lead (Human Review)",
      reason: reason,
      escalated_to: targetAuthority
    };

    report.history.push({
      timestamp: timestamp,
      actor: "Designated Triage Lead",
      action: "Auditable Human Escalation Approved",
      notes: `Escalated to: ${targetAuthority}. Ground: ${reason}`
    });

    // Append to System Audit Log
    window.CivicApp.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timestamp,
      actor: "Designated Triage Lead",
      action: "HUMAN_APPROVED_ESCALATION",
      target_id: caseId,
      reason: `Escalated to ${targetAuthority}: ${reason}`
    });

    try {
      await fetch(`/api/reports/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: "Designated Triage Lead",
          escalation_reason: reason,
          escalated_to: targetAuthority
        })
      });
    } catch (e) {
      console.warn("Could not patch escalation to server", e);
    }

    if (reasonTextarea) reasonTextarea.value = '';
    alert(`Formal escalation to ${targetAuthority} approved and recorded in the audit trail.`);

    window.selectAuthorityCase(caseId);
    window.renderAuthorityQueue();
    if (window.renderDashboard) window.renderDashboard();
  };

  function renderAuditLogs() {
    const tableBody = document.getElementById('audit-log-rows');
    if (!tableBody) return;

    const logs = window.CivicApp.auditLogs || [];
    if (logs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No audit events recorded yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = logs.map(log => {
      const timeStr = new Date(log.timestamp).toLocaleString();
      return `
        <tr>
          <td><span class="ref-badge">${log.id}</span></td>
          <td style="white-space:nowrap; font-size:0.75rem;">${timeStr}</td>
          <td><strong>${log.actor}</strong></td>
          <td><span class="info-pill" style="font-size:0.7rem;">${log.action}</span></td>
          <td><span class="ref-badge" style="cursor:pointer;" onclick="window.selectAuthorityCase('${log.target_id}')">${log.target_id}</span></td>
          <td style="font-size:0.8rem; color:#cbd5e1;">${log.reason}</td>
        </tr>
      `;
    }).join('');
  }

})();
