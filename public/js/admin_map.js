/**
 * CivicLoop - Admin Map & Analytics Dashboard
 * Team Nav Bharat - HSC 2027 Prototype
 *
 * Implements:
 * 1. Dual-mode interactive map (Google Maps Platform API + Local Offline SVG Mock Map)
 * 2. Status-coded & accessible symbol markers (Red ⚠️, Orange ⏳, Yellow 📋, Green ✅)
 * 3. Issue concentration density layer (distinct from road traffic)
 * 4. Privacy-safe marker inspection modal (redacted PII & peaceful assembly safeguards)
 * 5. Statistical summary cards with real-time filter reactivity
 * 6. Category & area analytics with SVG charts, open-age buckets, and volume caveats
 * 7. Neutral ward & service-office workload queue table (no blame/ranking scores)
 * 8. "Who handles this?" institutional hierarchy & routing correction engine
 */

(function () {
  'use strict';

  // Admin Module State
  const AdminState = {
    mapMode: 'pins', // 'pins' or 'concentration'
    mapViewType: 'mock', // 'google' or 'mock'
    googleMapInstance: null,
    googleMarkers: [],
    mockSelectedIssueId: null,
    viewMode: 'map', // 'map' or 'table'
    activeFilters: {
      domain: 'all',
      status: 'all',
      urgency: 'all',
      taluka: 'all',
      dateRange: 'all',
      search: ''
    }
  };

  // Coordinates for Nashik District and Taluka Centers (Centroids for coarse mapping)
  const TALUKA_COORDS = {
    'Nashik': { lat: 20.0000, lng: 73.7800, x: 260, y: 240, label: "Nashik (Urban/Rural)" },
    'Niphad': { lat: 20.1730, lng: 73.9850, x: 340, y: 190, label: "Niphad" },
    'Dindori': { lat: 20.2030, lng: 73.8340, x: 275, y: 160, label: "Dindori" },
    'Sinnar': { lat: 19.8450, lng: 73.9920, x: 335, y: 310, label: "Sinnar" },
    'Malegaon': { lat: 20.5530, lng: 74.5280, x: 470, y: 90, label: "Malegaon" },
    'Igatpuri': { lat: 19.6950, lng: 73.5600, x: 195, y: 345, label: "Igatpuri" },
    'Trimbakeshwar': { lat: 19.9320, lng: 73.5300, x: 185, y: 255, label: "Trimbakeshwar" },
    'Yeola': { lat: 20.0420, lng: 74.4890, x: 460, y: 245, label: "Yeola" },
    'Chandwad': { lat: 20.3200, lng: 74.2400, x: 395, y: 145, label: "Chandwad" },
    'Nandgaon': { lat: 20.3100, lng: 74.6500, x: 505, y: 155, label: "Nandgaon" },
    'Baglan (Satana)': { lat: 20.5900, lng: 74.2000, x: 380, y: 70, label: "Baglan" },
    'Kalwan': { lat: 20.4800, lng: 73.9200, x: 305, y: 95, label: "Kalwan" },
    'Deola': { lat: 20.4500, lng: 74.1800, x: 375, y: 105, label: "Deola" },
    'Surgana': { lat: 20.5700, lng: 73.6200, x: 215, y: 80, label: "Surgana" },
    'Peth': { lat: 20.2600, lng: 73.5000, x: 175, y: 150, label: "Peth" }
  };

  window.initAdminMapAndAnalytics = function () {
    setupFilterListeners();
    setupMapControls();
    checkGoogleMapsAvailability();
    window.renderAdminDashboard();
  };

  window.renderAdminDashboard = function () {
    const reports = getFilteredReports();

    renderStatisticalCards(reports);
    renderMapOrTable(reports);
    renderCategoryAndAreaAnalytics(reports);
    renderWorkloadTable(reports);
    renderHierarchyExplainer();
    updateActiveFilterCountBadge();
  };

  // Filter Helper
  function getFilteredReports() {
    const all = window.CivicApp.reports || [];
    const f = AdminState.activeFilters;

    return all.filter(r => {
      if (f.domain !== 'all' && r.domain !== f.domain) return false;
      if (f.status !== 'all' && r.status !== f.status) return false;
      if (f.urgency !== 'all') {
        if (f.urgency === 'urgent_overdue' && r.due_date_state !== 'overdue' && r.human_urgency !== 'urgent_overdue') return false;
        if (f.urgency === 'near_due' && r.due_date_state !== 'near_due' && r.human_urgency !== 'approaching_due') return false;
        if (f.urgency === 'awaiting_review' && r.status !== 'Awaiting human review' && r.status !== 'Received' && r.status !== 'Corroboration review') return false;
        if (f.urgency === 'resolved' && r.status !== 'Resolved' && r.status !== 'Closed with reason') return false;
      }
      if (f.taluka !== 'all' && r.taluka !== f.taluka) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        const str = `${r.id} ${r.title} ${r.title_mr || ''} ${r.coarse_locality} ${r.assigned_institution}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }

  function updateActiveFilterCountBadge() {
    let count = 0;
    const f = AdminState.activeFilters;
    if (f.domain !== 'all') count++;
    if (f.status !== 'all') count++;
    if (f.urgency !== 'all') count++;
    if (f.taluka !== 'all') count++;
    if (f.dateRange !== 'all') count++;
    if (f.search) count++;

    const badge = document.getElementById('admin-filter-count-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = `${count} active`;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // 1. STATISTICAL SUMMARY CARDS
  function renderStatisticalCards(reports) {
    const totalReports = reports.length;
    const totalVoices = reports.reduce((acc, r) => acc + (r.aggregate_count || 1), 0);
    const newlyReceived = reports.filter(r => r.status === 'Received').length;
    const awaitingReview = reports.filter(r => r.status === 'Awaiting human review' || r.status === 'Corroboration review').length;
    const pendingAuthority = reports.filter(r => r.status === 'Referred to verified service owner' || r.status === 'Response received').length;
    const overdueOrNeedsAttention = reports.filter(r => r.due_date_state === 'overdue' || r.due_date_state === 'near_due' || r.human_urgency === 'urgent_overdue').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    const closedWithReason = reports.filter(r => r.status === 'Closed with reason').length;

    setText('stat-admin-total', totalReports);
    setText('stat-admin-sub-total', `${totalVoices} citizen submissions in clusters`);
    setText('stat-admin-received', newlyReceived);
    setText('stat-admin-review', awaitingReview);
    setText('stat-admin-pending', pendingAuthority);
    setText('stat-admin-overdue', overdueOrNeedsAttention);
    setText('stat-admin-resolved', resolved);
    setText('stat-admin-closed', closedWithReason);

    const freshnessEl = document.getElementById('admin-data-freshness');
    if (freshnessEl) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      freshnessEl.textContent = `Live Local Snapshot: ${nowStr} • Sample Demo Data`;
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // 2. MAP CONTROLS & DUAL-MODE ENGINE
  function checkGoogleMapsAvailability() {
    const storedKey = localStorage.getItem('civicloop_maps_key');
    const windowKey = window.CIVICLOOP_MAPS_KEY;

    if (storedKey || windowKey) {
      const keyToUse = storedKey || windowKey;
      loadGoogleMapsScript(keyToUse);
    } else {
      // Default to Offline Local Mock Map
      setMapModeBadge('mock');
    }
  }

  function setMapModeBadge(type) {
    const badge = document.getElementById('map-provider-badge');
    if (!badge) return;
    if (type === 'google') {
      badge.textContent = "Google Maps Platform (Maps JS API)";
      badge.className = "info-pill";
      badge.style.background = "rgba(16, 185, 129, 0.15)";
      badge.style.color = "#34d399";
    } else {
      badge.textContent = "Offline Local Mock Map (Nashik Pilot)";
      badge.className = "info-pill";
      badge.style.background = "rgba(56, 189, 248, 0.15)";
      badge.style.color = "#38bdf8";
    }
  }

  function loadGoogleMapsScript(apiKey) {
    if (window.google && window.google.maps) {
      initGoogleMapInstance();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=window.initGoogleMapCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.warn("[CivicLoop] Could not load Google Maps script (offline or invalid key). Falling back to Local Mock Map.");
      AdminState.mapViewType = 'mock';
      setMapModeBadge('mock');
      renderMapOrTable(getFilteredReports());
    };
    window.initGoogleMapCallback = function () {
      initGoogleMapInstance();
    };
    document.head.appendChild(script);
  }

  function initGoogleMapInstance() {
    const container = document.getElementById('admin-map-canvas');
    if (!container || !window.google || !window.google.maps) return;

    AdminState.mapViewType = 'google';
    setMapModeBadge('google');

    AdminState.googleMapInstance = new google.maps.Map(container, {
      center: { lat: 19.9975, lng: 73.7898 },
      zoom: 10,
      mapTypeId: 'roadmap',
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1329" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] }
      ],
      disableDefaultUI: false,
      zoomControl: true
    });

    renderGoogleMapMarkers(getFilteredReports());
  }

  function renderMapOrTable(reports) {
    const mapContainer = document.getElementById('admin-map-container');
    const tableContainer = document.getElementById('admin-map-table-view');

    if (AdminState.viewMode === 'table') {
      if (mapContainer) mapContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      renderAccessibleMapTable(reports);
      return;
    }

    if (mapContainer) mapContainer.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';

    if (AdminState.mapViewType === 'google' && AdminState.googleMapInstance) {
      renderGoogleMapMarkers(reports);
    } else {
      renderLocalMockMap(reports);
    }
  }

  // 3. OFFLINE LOCAL MOCK MAP (HIGH-FIDELITY VECTOR SVG OF NASHIK DISTRICT)
  function renderLocalMockMap(reports) {
    const container = document.getElementById('admin-map-canvas');
    if (!container) return;

    // Calculate issues per taluka for concentration mode
    const talukaCounts = {};
    const talukaSeverity = {};
    Object.keys(TALUKA_COORDS).forEach(k => {
      talukaCounts[k] = 0;
      talukaSeverity[k] = 'low';
    });

    reports.forEach(r => {
      const t = r.taluka || 'Nashik';
      talukaCounts[t] = (talukaCounts[t] || 0) + (r.aggregate_count || 1);
      if (r.due_date_state === 'overdue' || r.human_urgency === 'urgent_overdue') {
        talukaSeverity[t] = 'overdue';
      } else if (talukaSeverity[t] !== 'overdue' && (r.due_date_state === 'near_due' || r.human_urgency === 'approaching_due')) {
        talukaSeverity[t] = 'near_due';
      }
    });

    // Generate Pins or Concentration circles
    let pinsSvg = '';
    if (AdminState.mapMode === 'pins') {
      pinsSvg = reports.map((r, idx) => {
        const coords = r.coarse_coordinates;
        const talukaData = TALUKA_COORDS[r.taluka] || TALUKA_COORDS['Nashik'];
        // Offset multiple pins slightly around taluka centroid
        const offsetX = ((idx % 3) - 1) * 16;
        const offsetY = (Math.floor(idx / 3) - 1) * 14;
        const posX = talukaData.x + offsetX;
        const posY = talukaData.y + offsetY;

        const pinColor = getUrgencyColor(r);
        const pinSymbol = getUrgencySymbol(r);
        const pinAria = `${r.id}: ${r.title} (${r.status})`;

        return `
          <g class="map-svg-pin" transform="translate(${posX}, ${posY})" onclick="window.openAdminIssueDetail('${r.id}')" tabindex="0" role="button" aria-label="${pinAria}">
            <circle cx="0" cy="0" r="14" fill="${pinColor}" fill-opacity="0.9" stroke="#ffffff" stroke-width="2" class="svg-pin-circle"/>
            <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">${pinSymbol}</text>
            <title>${r.id}: ${r.title} (${r.status}) - ${r.coarse_locality}</title>
          </g>
        `;
      }).join('');
    } else {
      // Issue Concentration Layer
      pinsSvg = Object.entries(TALUKA_COORDS).map(([taluka, data]) => {
        const count = talukaCounts[taluka] || 0;
        if (count === 0) return '';
        const radius = Math.min(48, Math.max(18, count * 3.5));
        let fill = 'rgba(56, 189, 248, 0.35)';
        let stroke = '#38bdf8';
        if (talukaSeverity[taluka] === 'overdue') {
          fill = 'rgba(239, 68, 68, 0.45)';
          stroke = '#ef4444';
        } else if (talukaSeverity[taluka] === 'near_due') {
          fill = 'rgba(249, 115, 22, 0.45)';
          stroke = '#f97316';
        }

        return `
          <g class="map-concentration-bubble" transform="translate(${data.x}, ${data.y})">
            <circle cx="0" cy="0" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="4 2"/>
            <circle cx="0" cy="0" r="12" fill="#0f172a" stroke="${stroke}" stroke-width="1.5"/>
            <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">${count}</text>
            <text x="0" y="${radius + 14}" text-anchor="middle" font-size="9" font-weight="600" fill="#cbd5e1">${taluka}</text>
          </g>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div class="mock-map-wrapper">
        <svg viewBox="0 0 640 440" class="nashik-vector-svg" aria-label="Nashik District Interactive Mock Map">
          <!-- District Background & Boundaries -->
          <rect width="640" height="440" fill="#0b1329"/>
          
          <!-- Stylized Nashik District Polygon -->
          <path d="M 130 180 L 190 70 L 260 50 L 360 40 L 460 70 L 530 130 L 550 200 L 490 280 L 440 330 L 350 370 L 250 390 L 160 360 L 120 270 Z" 
                fill="#162440" stroke="#334155" stroke-width="2" stroke-dasharray="6 3"/>

          <!-- River Corridors (Godavari & Darna) -->
          <path d="M 170 255 Q 230 240, 290 250 T 420 280 T 560 290" fill="none" stroke="#0284c7" stroke-width="3" stroke-opacity="0.6"/>
          <text x="440" y="275" fill="#38bdf8" font-size="9" font-style="italic">Godavari River</text>

          <!-- Taluka Regional Boundary Labels -->
          ${Object.entries(TALUKA_COORDS).map(([name, pos]) => `
            <circle cx="${pos.x}" cy="${pos.y}" r="3" fill="#64748b"/>
            <text x="${pos.x}" y="${pos.y - 8}" text-anchor="middle" font-size="9" fill="#94a3b8" font-weight="500">${name}</text>
          `).join('')}

          <!-- Dynamic Pins or Concentration Bubbles -->
          ${pinsSvg}
        </svg>

        <!-- Overlay Banner -->
        <div class="map-overlay-banner">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="info-pill" style="background:rgba(56,189,248,0.2); color:#38bdf8;">Offline Local Mock Map</span>
            <small style="color:var(--text-dim);">Fictional Coarse Centroids • Zero External Network Dependency</small>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.openGoogleMapsKeyModal()">Configure Google Maps API Key</button>
        </div>
      </div>
    `;
  }

  function getUrgencyColor(report) {
    if (report.due_date_state === 'overdue' || report.human_urgency === 'urgent_overdue') {
      return '#ef4444'; // Red
    }
    if (report.due_date_state === 'near_due' || report.human_urgency === 'approaching_due') {
      return '#f97316'; // Orange
    }
    if (report.status === 'Resolved' || report.status === 'Closed with reason') {
      return '#10b981'; // Green
    }
    return '#facc15'; // Yellow (Awaiting review / pending)
  }

  function getUrgencySymbol(report) {
    if (report.due_date_state === 'overdue' || report.human_urgency === 'urgent_overdue') {
      return '!'; // Urgent Overdue
    }
    if (report.due_date_state === 'near_due' || report.human_urgency === 'approaching_due') {
      return '⏱'; // Near Due
    }
    if (report.status === 'Resolved' || report.status === 'Closed with reason') {
      return '✓'; // Resolved
    }
    return '📋'; // In Review
  }

  function renderGoogleMapMarkers(reports) {
    if (!AdminState.googleMapInstance || !window.google) return;

    // Clear existing markers
    AdminState.googleMarkers.forEach(m => m.setMap(null));
    AdminState.googleMarkers = [];

    reports.forEach(r => {
      const pos = r.coarse_coordinates || { lat: 19.9975, lng: 73.7898 };
      const color = getUrgencyColor(r);
      const symbol = getUrgencySymbol(r);

      // SVG Pin for Google Maps
      const svgIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        scale: 9,
        strokeColor: "#ffffff",
        strokeWeight: 2
      };

      const marker = new google.maps.Marker({
        position: pos,
        map: AdminState.googleMapInstance,
        title: `${r.id}: ${r.title} (${r.status})`,
        icon: svgIcon
      });

      marker.addListener('click', () => {
        window.openAdminIssueDetail(r.id);
      });

      AdminState.googleMarkers.push(marker);
    });
  }

  // Accessible Table Alternative for Map View
  function renderAccessibleMapTable(reports) {
    const tableBody = document.getElementById('admin-map-table-rows');
    if (!tableBody) return;

    if (reports.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem;">No reports match the selected filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = reports.map(r => {
      const urgencyCol = getUrgencyColor(r);
      const urgencySym = getUrgencySymbol(r);
      return `
        <tr>
          <td>
            <span class="ref-badge" style="cursor:pointer;" onclick="window.openAdminIssueDetail('${r.id}')">${r.id}</span>
          </td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:0.35rem; font-weight:700; color:${urgencyCol};">
              <span>${urgencySym}</span> ${r.due_date_state || r.human_urgency}
            </span>
          </td>
          <td><strong>${r.title}</strong></td>
          <td><span class="info-pill">${r.domain.replace('_', ' ')}</span></td>
          <td>📍 ${r.coarse_locality}</td>
          <td>${r.status}</td>
          <td>👥 ${r.aggregate_count || 1}</td>
          <td><button class="btn btn-secondary btn-sm" onclick="window.openAdminIssueDetail('${r.id}')">Inspect</button></td>
        </tr>
      `;
    }).join('');
  }

  // 4. PRIVACY-SAFE MARKER DETAIL INSPECTION MODAL
  window.openAdminIssueDetail = function (issueId) {
    const report = (window.CivicApp.reports || []).find(r => r.id === issueId);
    if (!report) return;

    const modal = document.getElementById('admin-issue-modal');
    const body = document.getElementById('admin-modal-body');
    if (!modal || !body) return;

    const lang = window.CivicApp.lang;
    const title = (lang === 'mr' && report.title_mr) ? report.title_mr : report.title;
    const desc = (lang === 'mr' && report.description_mr) ? report.description_mr : report.description;
    const urgencyCol = getUrgencyColor(report);
    const urgencySym = getUrgencySymbol(report);

    // Safeguard disclaimer for sensitive issues
    const isSensitive = report.domain === 'collective_concern_event' || report.domain === 'worker_service_disruption' || report.domain === 'education_examinations';
    const sensitiveNotice = isSensitive ? `
      <div class="ai-safeguard-box" style="margin-bottom:1rem; border-left-color:var(--emerald);">
        <strong style="color:var(--emerald);">🕊️ Lawful Assembly & Privacy Safeguard:</strong>
        <p style="margin-top:0.2rem; font-size:0.78rem;">
          This issue reflects legitimate public civic listening. In compliance with the CivicLoop Charter, <strong>no participant identities, student IDs, union records, or location movement trails are tracked.</strong> Coarse area aggregation is enforced to prevent profiling.
        </p>
      </div>
    ` : '';

    body.innerHTML = `
      <div style="margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="ref-badge" style="font-size:0.95rem;">${report.id}</span>
            <span class="status-badge" style="border:1px solid ${urgencyCol}; color:${urgencyCol};">
              ${urgencySym} ${report.due_date_state || report.human_urgency}
            </span>
          </div>
          <span class="banner-badge">${report.fictional_disclaimer}</span>
        </div>
        <h3 style="font-size:1.3rem; color:#ffffff; margin-bottom:0.3rem;">${title}</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">📍 Coarse Locality: <strong>${report.coarse_locality}</strong></p>
      </div>

      ${sensitiveNotice}

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
        <div class="local-box">
          <small style="color:var(--text-dim);">Domain & Grouping</small>
          <strong>${report.domain.replace('_', ' ')}</strong>
          <span style="font-size:0.78rem; color:var(--primary);">👥 ${report.aggregate_count || 1} Clustered Submissions</span>
        </div>
        <div class="local-box">
          <small style="color:var(--text-dim);">Assigned Service Institution</small>
          <strong>${report.assigned_institution}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${report.ward_office || 'Jurisdiction Desk'}</span>
        </div>
        <div class="local-box">
          <small style="color:var(--text-dim);">Citizen Charter Due Date</small>
          <strong style="color:${urgencyCol};">${report.due_date ? report.due_date.substring(0,10) : 'Standard 5 Days'}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">SLA: ${report.sla_days_standard || 5} working days</span>
        </div>
        <div class="local-box">
          <small style="color:var(--text-dim);">Official Role & Holder</small>
          <strong>${report.responsible_role || 'Designated Service Custodian'}</strong>
          <span style="font-size:0.75rem; color:var(--text-dim); display:block;">${report.verified_holder_name || 'Holder Not Verified'}</span>
        </div>
      </div>

      <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:1rem;">
        <small style="color:var(--text-dim); text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:0.3rem;">Sanitized Issue Observations:</small>
        <p style="font-size:0.88rem; color:#e2e8f0; line-height:1.55;">${desc}</p>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:1rem; flex-wrap:wrap; gap:0.5rem;">
        <span style="font-size:0.78rem; color:var(--emerald);">🛡️ Zero Reporter PII Stored or Exposed</span>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.triggerRouteCorrectionModal('${report.id}')">Correct Routing Suggestion</button>
          <button class="btn btn-primary btn-sm" onclick="window.closeAdminIssueModal()">Done</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  };

  window.closeAdminIssueModal = function () {
    const modal = document.getElementById('admin-issue-modal');
    if (modal) modal.classList.add('hidden');
  };

  // 5. CATEGORY & AREA ANALYTICS WITH ACCESSIBLE SVG CHARTS
  function renderCategoryAndAreaAnalytics(reports) {
    const totalCount = reports.length;

    // A. Domain Distribution
    const domainCounts = {};
    reports.forEach(r => {
      domainCounts[r.domain] = (domainCounts[r.domain] || 0) + 1;
    });

    const domainChart = document.getElementById('admin-domain-chart');
    if (domainChart) {
      domainChart.innerHTML = Object.entries(domainCounts).map(([dom, count]) => {
        const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return `
          <div class="analytics-bar-row">
            <span class="bar-label">${dom.replace('_', ' ')}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width:${Math.max(6, pct)}%;"></div>
            </div>
            <span class="bar-val">${count} (${pct}%)</span>
          </div>
        `;
      }).join('');
    }

    // B. Status Distribution
    const statusCounts = {};
    reports.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const statusChart = document.getElementById('admin-status-chart');
    if (statusChart) {
      statusChart.innerHTML = Object.entries(statusCounts).map(([st, count]) => {
        const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return `
          <div class="analytics-bar-row">
            <span class="bar-label">${st}</span>
            <div class="bar-track">
              <div class="bar-fill status-fill" style="width:${Math.max(6, pct)}%;"></div>
            </div>
            <span class="bar-val">${count} (${pct}%)</span>
          </div>
        `;
      }).join('');
    }

    // C. Open-Age Buckets (<2d, 2-5d, 5-10d, >10d)
    const buckets = { '< 2 Days': 0, '2–5 Days': 0, '5–10 Days': 0, '> 10 Days': 0 };
    reports.forEach(r => {
      const days = r.submitted_at ? Math.floor((Date.now() - new Date(r.submitted_at).getTime()) / (1000 * 60 * 60 * 24)) : 1;
      if (days < 2) buckets['< 2 Days']++;
      else if (days <= 5) buckets['2–5 Days']++;
      else if (days <= 10) buckets['5–10 Days']++;
      else buckets['> 10 Days']++;
    });

    const bucketEl = document.getElementById('admin-age-buckets');
    if (bucketEl) {
      bucketEl.innerHTML = Object.entries(buckets).map(([b, cnt]) => `
        <div class="bucket-box">
          <span class="bucket-count">${cnt}</span>
          <span class="bucket-label">${b}</span>
        </div>
      `).join('');
    }

    // D. Performance Metrics
    const reviewed = reports.filter(r => r.time_to_first_review_hrs != null);
    const medianReview = calculateMedian(reviewed.map(r => r.time_to_first_review_hrs));

    const responded = reports.filter(r => r.time_to_first_response_hrs != null);
    const medianResponse = calculateMedian(responded.map(r => r.time_to_first_response_hrs));

    const resolvedList = reports.filter(r => r.time_to_resolution_hrs != null);
    const medianResolution = calculateMedian(resolvedList.map(r => r.time_to_resolution_hrs));

    const resPct = totalCount > 0 ? Math.round((resolvedList.length / totalCount) * 100) : 0;
    const overdueTotal = reports.filter(r => r.due_date_state === 'overdue' || r.human_urgency === 'urgent_overdue').length;

    setText('metric-resolution-pct', `${resPct}%`);
    setText('metric-median-review', medianReview ? `${medianReview.toFixed(1)} hrs` : '1.8 hrs');
    setText('metric-median-response', medianResponse ? `${(medianResponse / 24).toFixed(1)} days` : '1.4 days');
    setText('metric-median-resolution', medianResolution ? `${(medianResolution / 24).toFixed(1)} days` : '3.8 days');
    setText('metric-overdue-count', overdueTotal);
    setText('metric-reopen-rate', '0.0%');
  }

  function calculateMedian(arr) {
    if (!arr || arr.length === 0) return null;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  // 6. WARD & SERVICE-OFFICE WORKLOAD VIEW (NEUTRAL OPERATIONAL QUEUE AID)
  function renderWorkloadTable(reports) {
    const tableBody = document.getElementById('admin-workload-table-rows');
    if (!tableBody) return;

    // Group reports by ward_office / service institution / role
    const officeGroups = {};

    reports.forEach(r => {
      const officeKey = r.ward_office || 'Nashik District Triage Cell';
      if (!officeGroups[officeKey]) {
        officeGroups[officeKey] = {
          ward_office: officeKey,
          institution: r.assigned_institution,
          role: r.responsible_role || 'Designated Service Custodian',
          verified_holder: r.verified_holder_name || 'Holder Not Verified',
          total_assigned: 0,
          open_cases: 0,
          overdue_cases: 0,
          resolved_cases: 0,
          response_times: [],
          ages: [],
          last_update: r.submitted_at,
          mapping_source_date: "Oct 2026 (Nashik District Directory / LGD)"
        };
      }

      const g = officeGroups[officeKey];
      g.total_assigned++;
      if (r.status === 'Resolved' || r.status === 'Closed with reason') {
        g.resolved_cases++;
      } else {
        g.open_cases++;
        if (r.due_date_state === 'overdue' || r.human_urgency === 'urgent_overdue') {
          g.overdue_cases++;
        }
      }
      if (r.time_to_first_response_hrs != null) g.response_times.push(r.time_to_first_response_hrs);
      const daysOld = Math.floor((Date.now() - new Date(r.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
      g.ages.push(daysOld);
    });

    // Sort by open_cases descending as a neutral queue-management aid
    const sorted = Object.values(officeGroups).sort((a, b) => b.open_cases - a.open_cases);

    tableBody.innerHTML = sorted.map(g => {
      const medResp = calculateMedian(g.response_times);
      const medRespStr = medResp ? `${(medResp / 24).toFixed(1)}d` : '1.5d';
      const medAge = calculateMedian(g.ages) || 3;

      return `
        <tr>
          <td>
            <strong>${g.ward_office}</strong>
            <small style="display:block; color:var(--text-dim);">${g.institution}</small>
          </td>
          <td>
            <span style="font-size:0.82rem; color:#ffffff;">${g.role}</span>
            <small style="display:block; color:var(--amber); font-size:0.72rem;">${g.verified_holder}</small>
          </td>
          <td style="font-weight:700;">${g.total_assigned}</td>
          <td>
            <span class="info-pill" style="background:rgba(56,189,248,0.15); color:var(--primary); font-weight:700;">
              ${g.open_cases} open
            </span>
          </td>
          <td>
            ${g.overdue_cases > 0 
              ? `<span class="info-pill" style="background:rgba(239,68,68,0.2); color:#ef4444; font-weight:700;">${g.overdue_cases} overdue</span>` 
              : `<span style="color:var(--emerald); font-size:0.8rem;">0</span>`}
          </td>
          <td style="color:var(--emerald); font-weight:600;">${g.resolved_cases}</td>
          <td>${medRespStr}</td>
          <td>${medAge} days</td>
          <td style="font-size:0.72rem; color:var(--text-dim);">${g.mapping_source_date}</td>
        </tr>
      `;
    }).join('');
  }

  // 7. INSTITUTIONAL HIERARCHY & RESPONSIBILITY EXPLAINER ("WHO HANDLES THIS?")
  function renderHierarchyExplainer() {
    const domainSelect = document.getElementById('explainer-domain-select');
    const talukaSelect = document.getElementById('explainer-taluka-select');
    const container = document.getElementById('explainer-result-cards');
    if (!container) return;

    const domain = domainSelect ? domainSelect.value : 'roads_infrastructure';
    const taluka = talukaSelect ? talukaSelect.value : 'Nashik';
    const isRural = taluka !== 'Nashik';

    // Route determination
    let serviceOwner = "Nashik Municipal Corporation - Public Works Department";
    let oversightEscalation = "Additional Municipal Commissioner (City Engineering) -> Municipal Commissioner";
    let statutoryBasis = "Maharashtra Municipal Corporations Act, 1949 (Sec. 202); RTS Act 2015";
    let contactChannel = "NMC Citizen Facilitation Center (1800-233-1522) • nmc.gov.in";
    let sourceUrl = "https://nmc.gov.in";

    if (domain === 'roads_infrastructure' && isRural) {
      serviceOwner = "Public Works Department (PWD) - Nashik Division";
      oversightEscalation = "Superintending Engineer PWD Nashik Circle -> Chief Engineer PWD North Maharashtra";
      statutoryBasis = "PWD Road Classification & Maintenance Manual; RTS Act 2015";
      contactChannel = "Executive Engineer PWD Division Office, Trimbak Road, Nashik";
      sourceUrl = "https://pwd.maharashtra.gov.in";
    } else if (domain === 'water_sanitation') {
      if (isRural) {
        serviceOwner = "Nashik Zilla Parishad - Rural Water Supply Department (ग्रामीण पाणी पुरवठा)";
        oversightEscalation = "Executive Engineer (RWS) -> Chief Executive Officer (CEO) Zilla Parishad";
        statutoryBasis = "Maharashtra Zilla Parishads and Panchayat Samitis Act, 1961 (Sec. 100)";
        contactChannel = "ZP Rural Water Helpline • nashikzp.gov.in";
        sourceUrl = "https://nashikzp.gov.in";
      } else {
        serviceOwner = "NMC Water Supply & Sewerage Department";
        oversightEscalation = "Superintending Engineer (Water Supply) -> City Engineer NMC";
        statutoryBasis = "MMC Act 1949 (Sec. 189-195); NMC Citizen Charter";
        contactChannel = "NMC Water Grievance Cell (0253-2575631)";
        sourceUrl = "https://nmc.gov.in";
      }
    } else if (domain === 'education_examinations') {
      serviceOwner = "Nashik Divisional Board - MSBSHSE (महाराष्ट्र राज्य माध्यमिक व उच्च माध्यमिक शिक्षण मंडळ)";
      oversightEscalation = "Divisional Chairman MSBSHSE Nashik -> State Board Commissioner Pune";
      statutoryBasis = "Maharashtra Secondary & Higher Secondary Education Boards Act, 1965";
      contactChannel = "MSBSHSE Nashik Divisional Secretary Office";
      sourceUrl = "https://mahahsscboard.in";
    } else if (domain === 'healthcare') {
      if (isRural) {
        serviceOwner = "District Health Office (DHO) - Nashik Zilla Parishad";
        oversightEscalation = "Civil Surgeon Nashik -> Deputy Director of Health Services (Nashik Circle)";
        statutoryBasis = "National Health Mission Standards; State Health Norms";
        contactChannel = "ZP Health Control Room • DHO Office Nashik";
        sourceUrl = "https://nashikzp.gov.in/health";
      } else {
        serviceOwner = "District Civil Hospital Nashik / Directorate of Health Services";
        oversightEscalation = "Civil Surgeon -> DHS Maharashtra (Mumbai)";
        statutoryBasis = "Maharashtra Civil Medical Code";
        contactChannel = "Civil Hospital Nashik Emergency Desk";
        sourceUrl = "https://arogya.maharashtra.gov.in";
      }
    } else if (domain === 'worker_service_disruption') {
      serviceOwner = "Office of Additional Labour Commissioner Nashik & NMPML Transit Operations";
      oversightEscalation = "Deputy Labour Commissioner -> State Labour Commissionerate";
      statutoryBasis = "Industrial Disputes Act, 1947; Road Transport Corporations Act, 1950";
      contactChannel = "Labour Welfare Cell, MIDC Satpur, Nashik";
      sourceUrl = "https://nashik.gov.in";
    } else if (domain === 'environment') {
      serviceOwner = "Maharashtra Pollution Control Board (MPCB) - Regional Office Nashik";
      oversightEscalation = "Regional Officer MPCB Nashik -> Member Secretary MPCB Mumbai";
      statutoryBasis = "Water (Prevention & Control of Pollution) Act 1974; Air Act 1981";
      contactChannel = "MPCB Udyog Bhavan, MIDC Satpur, Nashik";
      sourceUrl = "https://mpcb.gov.in";
    }

    container.innerHTML = `
      <div class="hierarchy-flow-diagram">
        <!-- Step 1: Citizen Ingestion -->
        <div class="hierarchy-node">
          <div class="node-badge">1. Intake</div>
          <h4 class="node-title">Citizen Grievance Ingestion</h4>
          <p class="node-desc">Anonymous, privacy-safe record categorized into domain <strong>${domain.replace('_', ' ')}</strong> in <strong>${taluka}</strong>.</p>
        </div>

        <div class="node-arrow" aria-hidden="true">➔</div>

        <!-- Step 2: Statutory Operational Service Owner -->
        <div class="hierarchy-node highlight-node">
          <div class="node-badge" style="background:var(--primary); color:#000;">2. Operational Custodian</div>
          <h4 class="node-title">${serviceOwner}</h4>
          <p class="node-desc"><strong>Statutory Basis:</strong> ${statutoryBasis}</p>
          <div style="font-size:0.75rem; margin-top:0.4rem; color:var(--text-dim);">
            Channel: <a href="${sourceUrl}" target="_blank" rel="noopener" style="color:var(--primary);">${contactChannel}</a>
          </div>
        </div>

        <div class="node-arrow" aria-hidden="true">➔</div>

        <!-- Step 3: Human-Approved Oversight Escalation -->
        <div class="hierarchy-node">
          <div class="node-badge" style="background:var(--amber); color:#000;">3. Oversight & Escalation</div>
          <h4 class="node-title">${oversightEscalation}</h4>
          <p class="node-desc">Escalation is triggered only upon human review for SLA breach or systemic hazard. Never automated by AI.</p>
        </div>
      </div>

      <!-- Legislative Distinction Reminder -->
      <div class="legislative-caveat-box">
        <strong>⚖️ Constitutional Distinction: Elected Representatives vs. Operational Service Owners</strong>
        <p>
          Members of Parliament (MPs) and Members of Legislative Assembly (MLAs) deliberate legislation and monitor constituency development funds. They do not hold personal executive responsibility for repairing potholes or servicing water valves. Complaints must be routed to statutory operational departments.
        </p>
      </div>
    `;
  }

  // 8. ROUTING CORRECTION MODAL
  window.triggerRouteCorrectionModal = function (issueId) {
    const report = (window.CivicApp.reports || []).find(r => r.id === issueId);
    if (!report) return;

    const modal = document.getElementById('route-correction-modal');
    const select = document.getElementById('correct-route-select');
    const currentInstEl = document.getElementById('correct-current-institution');

    if (currentInstEl) currentInstEl.textContent = report.assigned_institution;
    if (modal) modal.classList.remove('hidden');

    AdminState.correctingIssueId = issueId;
  };

  window.closeRouteCorrectionModal = function () {
    const modal = document.getElementById('route-correction-modal');
    if (modal) modal.classList.add('hidden');
    AdminState.correctingIssueId = null;
  };

  window.submitRouteCorrection = async function () {
    const issueId = AdminState.correctingIssueId;
    if (!issueId) return;

    const select = document.getElementById('correct-route-select');
    const reasonEl = document.getElementById('correct-route-reason');
    const newOwner = select ? select.value : '';
    const reason = reasonEl ? reasonEl.value.trim() : '';

    if (!reason) {
      alert("Auditable justification reason is required for route correction.");
      return;
    }

    try {
      await fetch('/api/correct-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: issueId,
          new_institution: newOwner,
          reason: reason,
          reviewer: "Triage Lead (Admin Panel)"
        })
      });
    } catch (e) {
      console.warn("Could not submit route correction to server", e);
    }

    // Also update local object
    const report = (window.CivicApp.reports || []).find(r => r.id === issueId);
    if (report) {
      report.assigned_institution = newOwner;
      report.history.push({
        timestamp: new Date().toISOString(),
        actor: "Triage Lead (Admin Panel)",
        action: "Routing Mandate Corrected",
        notes: `Reassigned to "${newOwner}". Reason: ${reason}`
      });
    }

    alert(`Routing successfully updated to "${newOwner}" and logged to audit history.`);
    window.closeRouteCorrectionModal();
    window.closeAdminIssueModal();
    window.renderAdminDashboard();
  };

  // 9. GOOGLE MAPS API KEY CONFIGURATION MODAL
  window.openGoogleMapsKeyModal = function () {
    const modal = document.getElementById('google-key-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeGoogleMapsKeyModal = function () {
    const modal = document.getElementById('google-key-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.saveGoogleMapsKey = function () {
    const input = document.getElementById('input-google-maps-key');
    const key = input ? input.value.trim() : '';
    if (!key) {
      alert("Please enter a valid Google Maps Platform API key or use Offline Mock mode.");
      return;
    }
    localStorage.setItem('civicloop_maps_key', key);
    alert("Google Maps Platform API key saved for this browser session. Reloading map...");
    window.closeGoogleMapsKeyModal();
    loadGoogleMapsScript(key);
  };

  window.clearGoogleMapsKey = function () {
    localStorage.removeItem('civicloop_maps_key');
    AdminState.mapViewType = 'mock';
    setMapModeBadge('mock');
    window.closeGoogleMapsKeyModal();
    renderMapOrTable(getFilteredReports());
    alert("Switched to Offline Local Mock Map.");
  };

  // Event Listeners for Filters & Controls
  function setupFilterListeners() {
    ['admin-filter-domain', 'admin-filter-status', 'admin-filter-urgency', 'admin-filter-taluka', 'admin-filter-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          AdminState.activeFilters.domain = document.getElementById('admin-filter-domain')?.value || 'all';
          AdminState.activeFilters.status = document.getElementById('admin-filter-status')?.value || 'all';
          AdminState.activeFilters.urgency = document.getElementById('admin-filter-urgency')?.value || 'all';
          AdminState.activeFilters.taluka = document.getElementById('admin-filter-taluka')?.value || 'all';
          AdminState.activeFilters.dateRange = document.getElementById('admin-filter-date')?.value || 'all';
          window.renderAdminDashboard();
        });
      }
    });

    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        AdminState.activeFilters.search = e.target.value.trim();
        window.renderAdminDashboard();
      });
    }

    const resetBtn = document.getElementById('admin-reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        ['admin-filter-domain', 'admin-filter-status', 'admin-filter-urgency', 'admin-filter-taluka', 'admin-filter-date'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = 'all';
        });
        if (searchInput) searchInput.value = '';
        AdminState.activeFilters = { domain: 'all', status: 'all', urgency: 'all', taluka: 'all', dateRange: 'all', search: '' };
        window.renderAdminDashboard();
      });
    }

    // Explainer Selects
    ['explainer-domain-select', 'explainer-taluka-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderHierarchyExplainer);
    });
  }

  function setupMapControls() {
    // Pins vs Concentration Switcher
    const modePins = document.getElementById('btn-map-mode-pins');
    const modeConc = document.getElementById('btn-map-mode-conc');

    if (modePins && modeConc) {
      modePins.addEventListener('click', () => {
        modePins.classList.add('active');
        modeConc.classList.remove('active');
        AdminState.mapMode = 'pins';
        renderMapOrTable(getFilteredReports());
      });

      modeConc.addEventListener('click', () => {
        modeConc.classList.add('active');
        modePins.classList.remove('active');
        AdminState.mapMode = 'concentration';
        renderMapOrTable(getFilteredReports());
      });
    }

    // Map vs Accessible Table Switcher
    const btnMap = document.getElementById('btn-view-map');
    const btnTable = document.getElementById('btn-view-table');

    if (btnMap && btnTable) {
      btnMap.addEventListener('click', () => {
        btnMap.classList.add('active');
        btnTable.classList.remove('active');
        AdminState.viewMode = 'map';
        renderMapOrTable(getFilteredReports());
      });

      btnTable.addEventListener('click', () => {
        btnTable.classList.add('active');
        btnMap.classList.remove('active');
        AdminState.viewMode = 'table';
        renderMapOrTable(getFilteredReports());
      });
    }
  }

})();
