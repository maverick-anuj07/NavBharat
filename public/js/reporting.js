/**
 * CivicLoop - Citizen Reporting Flow & Privacy-Safe Ingestion
 * Team Nav Bharat - HSC 2027 Prototype
 */

(function () {
  'use strict';

  let newlyCreatedId = null;

  window.initReportingWizard = function () {
    // 1. Domain Pill Selection
    const pills = document.querySelectorAll('.domain-pill');
    const hiddenDomainInput = document.getElementById('selected-domain');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const selected = pill.getAttribute('data-domain');
        if (hiddenDomainInput) hiddenDomainInput.value = selected;
        updateAiAssistantHeuristic();
      });
    });

    // 2. Dynamic Heuristics on input changes
    ['form-taluka', 'form-coarse-area', 'form-title'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateAiAssistantHeuristic);
        el.addEventListener('change', updateAiAssistantHeuristic);
      }
    });

    // 3. Mock Evidence Dropzone
    const dropzone = document.getElementById('mock-file-upload');
    const badge = document.getElementById('upload-status-badge');
    if (dropzone && badge) {
      dropzone.addEventListener('click', () => {
        badge.textContent = "✓ 1 simulated photo attached (EXIF GPS & faces sanitized)";
        badge.style.background = "rgba(16, 185, 129, 0.25)";
        badge.style.color = "#34d399";
      });
    }

    // 4. Form Submission
    const form = document.getElementById('citizen-report-form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  };

  function updateAiAssistantHeuristic() {
    const domain = document.getElementById('selected-domain')?.value || 'roads_infrastructure';
    const taluka = document.getElementById('form-taluka')?.value || 'Nashik';
    const locality = (document.getElementById('form-coarse-area')?.value || '').toLowerCase();

    const candidateEl = document.getElementById('ai-candidate-routing');
    const statuteEl = document.getElementById('ai-statute-match');
    const duplicateEl = document.getElementById('ai-duplicate-match');
    const confidenceEl = document.getElementById('ai-confidence-label');

    // Routing heuristic based on domain & taluka
    let candidate = "Nashik Municipal Corporation (Urban Works)";
    let statute = "Maharashtra Municipal Corporations Act, 1949 (Sec. 202)";
    let conf = "94% Heuristic match";

    const isRural = taluka !== 'Nashik' || locality.includes('gram') || locality.includes('village') || locality.includes('rural');

    if (domain === 'roads_infrastructure') {
      if (isRural) {
        candidate = "Public Works Department (PWD) - Nashik Rural Division";
        statute = "PWD Road Classification & Maintenance Manual";
      } else {
        candidate = "Nashik Municipal Corporation (Public Works Dept)";
        statute = "MMC Act 1949, Section 202";
      }
    } else if (domain === 'water_sanitation') {
      if (isRural) {
        candidate = "Nashik Zilla Parishad - Rural Water Supply Department (ग्रामीण पाणी पुरवठा)";
        statute = "Maharashtra Zilla Parishads & Panchayat Samitis Act, 1961 (Sec. 100)";
      } else {
        candidate = "NMC Water Supply & Sewerage Department";
        statute = "MMC Act 1949, Section 189";
      }
    } else if (domain === 'education_examinations') {
      candidate = "Nashik Divisional Board - MSBSHSE (महाराष्ट्र राज्य माध्यमिक व उच्च माध्यमिक मंडळ)";
      statute = "Maharashtra Secondary & Higher Secondary Education Boards Act, 1965";
      conf = "91% Heuristic match";
    } else if (domain === 'healthcare') {
      if (isRural) {
        candidate = "District Health Office (DHO) - Nashik Zilla Parishad (PHC Network)";
        statute = "National Health Mission Standards";
      } else {
        candidate = "District Civil Hospital Nashik / NMC Urban Health Posts";
        statute = "Maharashtra Civil Medical Code";
      }
      conf = "96% Heuristic match";
    } else if (domain === 'worker_service_disruption') {
      candidate = "Labour Commissionerate Nashik & NMPML Transit Operations";
      statute = "Industrial Disputes Act, 1947; Road Transport Corporations Act, 1950";
      conf = "95% Heuristic match";
    } else if (domain === 'environment') {
      candidate = "Maharashtra Pollution Control Board (MPCB) - Regional Office Nashik";
      statute = "Water (Prevention & Control of Pollution) Act, 1974";
      conf = "97% Heuristic match";
    } else if (domain === 'collective_concern_event') {
      candidate = "District Public Hearing & Dialogue Desk (Collectorate Nashik)";
      statute = "Non-Punitive Grievance Protocol (Right to Peaceful Assembly Protected)";
      conf = "98% Heuristic match";
    }

    // Check potential cluster duplicates in open reports
    const existingMatches = (window.CivicApp.reports || []).filter(r => r.domain === domain && r.taluka === taluka);
    let duplicateNote = `No similar ${domain} reports in ${taluka}. Fresh case.`;
    if (existingMatches.length > 0) {
      duplicateNote = `Found ${existingMatches.length} existing ${domain} cases in ${taluka}. May be clustered upon review.`;
    }

    if (candidateEl) candidateEl.textContent = candidate;
    if (statuteEl) statuteEl.textContent = statute;
    if (duplicateEl) duplicateEl.textContent = duplicateNote;
    if (confidenceEl) confidenceEl.textContent = conf;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('form-title')?.value.trim();
    const desc = document.getElementById('form-desc')?.value.trim();
    const domain = document.getElementById('selected-domain')?.value;
    const taluka = document.getElementById('form-taluka')?.value;
    const coarseArea = document.getElementById('form-coarse-area')?.value.trim();
    const modeEl = document.querySelector('input[name="report_mode"]:checked');
    const reportMode = modeEl ? modeEl.value : 'individual_issue';
    const consent = document.getElementById('consent-check')?.checked;

    if (!title || !desc || !coarseArea) {
      alert("Please fill in the title, description, and coarse locality.");
      return;
    }
    if (!consent) {
      alert("Please confirm the data minimization and non-governmental prototype consent.");
      return;
    }

    const payload = {
      title: title,
      description: desc,
      domain: domain,
      taluka: taluka,
      coarse_locality: `${coarseArea}, ${taluka} Taluka`,
      locality_type: (taluka === 'Nashik' && !coarseArea.toLowerCase().includes('rural')) ? 'urban' : 'rural',
      report_mode: reportMode
    };

    const submitBtn = document.getElementById('btn-submit-report');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";
    }

    try {
      let createdReport = null;
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          createdReport = await response.json();
        }
      } catch (err) {
        console.warn("API POST failed, falling back to client-side local ingestion", err);
      }

      // If server is not responding, do client-side creation
      if (!createdReport) {
        const fallbackId = `CIVIC-2026-0${900 + (window.CivicApp.reports?.length || 0) + 1}`;
        createdReport = {
          id: fallbackId,
          fictional_disclaimer: "DEMO SAMPLE - 100% FICTIONAL RECORD FOR CIVICLOOP PILOT",
          domain: payload.domain,
          report_mode: payload.report_mode,
          title: payload.title,
          coarse_locality: payload.coarse_locality,
          locality_type: payload.locality_type,
          taluka: payload.taluka,
          submitted_at: new Date().toISOString(),
          status: "Received",
          status_mr: "नोंद झाली (प्राप्त)",
          aggregate_count: payload.report_mode === 'shared_recurring_concern' ? 2 : 1,
          description: payload.description,
          assigned_institution: document.getElementById('ai-candidate-routing')?.textContent || "Nashik District Triage Desk",
          statutory_mandate: document.getElementById('ai-statute-match')?.textContent || "RTS Act 2015",
          sla_days_standard: 5,
          ai_assistance: {
            uncertainty_label: "AI ADVISORY HEURISTIC: Requires human officer verification.",
            redaction_applied: "All personal identifiers withheld; coarse locality applied."
          },
          history: [
            {
              timestamp: new Date().toISOString(),
              actor: "Citizen Reporter (Anonymous)",
              action: "Report Received",
              notes: "Logged in local prototype session."
            }
          ]
        };
        window.CivicApp.reports.unshift(createdReport);
      } else {
        // Already in server in-memory list, also update local state
        const exists = window.CivicApp.reports.some(r => r.id === createdReport.id);
        if (!exists) window.CivicApp.reports.unshift(createdReport);
      }

      newlyCreatedId = createdReport.id;

      // Show Success Banner
      const successCard = document.getElementById('submission-success-card');
      const refEl = document.getElementById('new-issue-ref');
      if (refEl) refEl.textContent = newlyCreatedId;
      if (successCard) successCard.classList.remove('hidden');

      // Scroll to success banner
      successCard.scrollIntoView({ behavior: 'smooth' });

      // Refresh Dashboard and Authority Queues
      if (window.renderDashboard) window.renderDashboard();
      if (window.renderAuthorityQueue) window.renderAuthorityQueue();

    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = window.t('btn_submit_report');
      }
    }
  }

  window.viewSubmittedReport = function () {
    window.switchTab('tab-dashboard');
    if (newlyCreatedId) {
      setTimeout(() => {
        window.openIssueModal(newlyCreatedId);
      }, 300);
    }
  };

  window.resetReportForm = function () {
    const form = document.getElementById('citizen-report-form');
    if (form) form.reset();
    const successCard = document.getElementById('submission-success-card');
    if (successCard) successCard.classList.add('hidden');
    updateAiAssistantHeuristic();
  };

})();
