/**
 * CivicLoop Local Prototype Server
 * Team Nav Bharat - HSC 2027 Governance & Civic Tech
 * Pilot: Nashik District, Maharashtra
 *
 * Zero-dependency Node.js HTTP server. Runs out of the box on any machine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// In-memory data store initialized from seed files
let reportsState = [];
let auditLogs = [];
let governanceData = null;
let nashikRoutes = null;
let economicRecords = null;

function loadSeedData() {
  try {
    const reportsPath = path.join(DATA_DIR, 'sample_reports.json');
    if (fs.existsSync(reportsPath)) {
      reportsState = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
    }
    const govPath = path.join(DATA_DIR, 'india_governance.json');
    if (fs.existsSync(govPath)) {
      governanceData = JSON.parse(fs.readFileSync(govPath, 'utf8'));
    }
    const routesPath = path.join(DATA_DIR, 'nashik_routes.json');
    if (fs.existsSync(routesPath)) {
      nashikRoutes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    }
    const econPath = path.join(DATA_DIR, 'economic_records.json');
    if (fs.existsSync(econPath)) {
      economicRecords = JSON.parse(fs.readFileSync(econPath, 'utf8'));
    }
    // Seed initial audit log
    auditLogs = [
      {
        id: "AUD-001",
        timestamp: "2026-10-10T11:15:00+05:30",
        actor: "Triage Officer (NMC Grievance Cell)",
        action: "ROUTING_VERIFICATION",
        target_id: "CIVIC-2026-0891",
        reason: "Confirmed road asset falls under NMC jurisdiction (Ward 12). Dispatched work order."
      },
      {
        "id": "AUD-002",
        "timestamp": "2026-10-11T15:00:00+05:30",
        "actor": "Moderation & Safeguards Lead",
        "action": "CORROBORATION_REVIEW",
        "target_id": "CIVIC-2026-0893",
        "reason": "Redacted private student usernames. Flagged unverified paper leak rumors for physical exam squad inspection."
      },
      {
        "id": "AUD-003",
        "timestamp": "2026-10-12T09:00:00+05:30",
        "actor": "District Labour Liaison Desk",
        "action": "COLLECTIVE_LISTENING_ROUTING",
        "target_id": "CIVIC-2026-0895",
        "reason": "Routed worker shift bus disruption directly to NMPML depot manager. Confirmed peaceful assembly protection."
      }
    ];
    console.log(`[CivicLoop] Successfully loaded ${reportsState.length} sample reports and governance datasets.`);
  } catch (err) {
    console.error('[CivicLoop] Error loading seed data:', err);
  }
}

loadSeedData();

// Simple privacy sanitization helper (strips 10/12-digit phone/Aadhaar patterns, emails)
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Redact 12-digit numbers (potential Aadhaar)
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED 12-DIGIT ID]')
    // Redact 10-digit Indian mobile numbers
    .replace(/\b[6-9]\d{9}\b/g, '[REDACTED CONTACT NUMBER]')
    // Redact email addresses
    .replace(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]')
    // Escape standard HTML tags
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const method = req.method;

  // Set CORS headers for local versatility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/reports' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reportsState));
    return;
  }

  if (pathname === '/api/reports' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        // Basic validation
        if (!payload.title || !payload.domain || !payload.coarse_locality) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Missing required fields: title, domain, coarse_locality" }));
          return;
        }

        const newId = `CIVIC-2026-0${900 + reportsState.length + 1}`;
        const timestamp = new Date().toISOString();

        // Sanitize textual inputs
        const cleanTitle = sanitizeText(payload.title);
        const cleanDescription = sanitizeText(payload.description || '');
        const cleanLocality = sanitizeText(payload.coarse_locality);

        // Find candidate route from nashik_routes
        let candidateOwner = "Nashik District Triage Cell";
        let candidateStatute = "Grievance Redressal Protocol";
        let slaDays = 5;

        if (nashikRoutes && nashikRoutes.service_routes) {
          const match = nashikRoutes.service_routes.find(r => r.domain === payload.domain);
          if (match) {
            candidateOwner = match.responsible_institution;
            candidateStatute = match.statutory_reference;
            slaDays = match.illustrative_sla_days || 5;
          }
        }

        const newReport = {
          id: newId,
          fictional_disclaimer: "DEMO SAMPLE - 100% FICTIONAL RECORD FOR CIVICLOOP PILOT",
          domain: payload.domain,
          report_mode: payload.report_mode || "individual_issue",
          title: cleanTitle,
          title_mr: payload.title_mr || cleanTitle,
          coarse_locality: cleanLocality,
          locality_type: payload.locality_type || "urban",
          taluka: payload.taluka || "Nashik",
          submitted_at: timestamp,
          status: "Received",
          status_mr: "नोंद झाली (प्राप्त)",
          aggregate_count: payload.report_mode === 'shared_recurring_concern' ? 2 : 1,
          related_group_id: `GRP-${payload.taluka ? payload.taluka.substring(0,3).toUpperCase() : 'NSK'}-${payload.domain.substring(0,4).toUpperCase()}-NEW`,
          description: cleanDescription,
          description_mr: payload.description_mr || cleanDescription,
          evidence_placeholder: "redacted_evidence_placeholder.png (GPS stripped, faces blurred)",
          assigned_institution: candidateOwner,
          responsible_role: "Designated Triage Officer",
          statutory_mandate: candidateStatute,
          due_date: new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000).toISOString(),
          sla_days_standard: slaDays,
          ai_assistance: {
            suggested_category: payload.domain,
            category_confidence: "92% Heuristic match",
            suggested_routing: candidateOwner,
            duplicate_flag: "Potential cluster with existing " + payload.domain + " issues in " + (payload.taluka || "Nashik"),
            uncertainty_label: "AI ADVISORY ONLY: Must be verified by human reviewer before escalation. Never proof of truth or fault.",
            redaction_applied: "PII scrubbed; exact GPS discarded in favor of coarse locality."
          },
          history: [
            {
              timestamp: timestamp,
              actor: "Citizen Reporter (Anonymous Pseudonym)",
              action: "Report Received",
              notes: "Submitted via CivicLoop portal with explicit data-minimization consent."
            }
          ]
        };

        reportsState.unshift(newReport);

        // Record in audit log
        auditLogs.unshift({
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: timestamp,
          actor: "System Ingestion Desk",
          action: "NEW_REPORT_INGESTION",
          target_id: newId,
          reason: `Ingested ${payload.report_mode} in domain ${payload.domain} at ${cleanLocality}.`
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newReport));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/reports/') && method === 'PATCH') {
    const reportId = pathname.replace('/api/reports/', '');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        const report = reportsState.find(r => r.id === reportId);
        if (!report) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Report not found" }));
          return;
        }

        const now = new Date().toISOString();

        if (update.status) {
          report.status = update.status;
          report.status_mr = update.status_mr || update.status;
        }
        if (update.assigned_institution) {
          report.assigned_institution = sanitizeText(update.assigned_institution);
        }
        if (update.due_date) {
          report.due_date = update.due_date;
        }
        if (update.response_note) {
          const cleanNote = sanitizeText(update.response_note);
          report.history.push({
            timestamp: now,
            actor: update.actor || "Reviewing Officer (Grievance Cell)",
            action: update.status || "Institutional Response",
            notes: cleanNote
          });
        }
        if (update.escalation_reason) {
          const cleanReason = sanitizeText(update.escalation_reason);
          report.escalation = {
            escalated_at: now,
            escalated_by: update.actor || "Authority Reviewer",
            reason: cleanReason,
            escalated_to: update.escalated_to || "District Collectorate / Appellate Authority"
          };
          report.history.push({
            timestamp: now,
            actor: update.actor || "Authority Reviewer",
            action: "Auditable Escalation Approved",
            notes: `Escalated to ${report.escalation.escalated_to}. Reason: ${cleanReason}`
          });

          // Log in system audit
          auditLogs.unshift({
            id: `AUD-${Date.now().toString().slice(-4)}`,
            timestamp: now,
            actor: update.actor || "Authority Reviewer",
            action: "HUMAN_APPROVED_ESCALATION",
            target_id: reportId,
            reason: cleanReason
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON update" }));
      }
    });
    return;
  }

  if (pathname === '/api/governance' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(governanceData || {}));
    return;
  }

  if (pathname === '/api/nashik-routes' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nashikRoutes || {}));
    return;
  }

  if (pathname === '/api/economic-records' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(economicRecords || {}));
    return;
  }

  if (pathname === '/api/config' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      google_maps_configured: !!process.env.GOOGLE_MAPS_API_KEY,
      google_maps_key: process.env.GOOGLE_MAPS_API_KEY || null,
      default_center: { lat: 19.9975, lng: 73.7898 },
      pilot_region: "Nashik District, Maharashtra",
      offline_mock_mode: !process.env.GOOGLE_MAPS_API_KEY
    }));
    return;
  }

  if (pathname === '/api/correct-route' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const report = reportsState.find(r => r.id === payload.report_id);
        if (!report) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Report not found" }));
          return;
        }

        const now = new Date().toISOString();
        const oldOwner = report.assigned_institution;
        const newOwner = sanitizeText(payload.new_institution);
        const cleanReason = sanitizeText(payload.reason || 'Administrative jurisdiction correction');
        const reviewer = sanitizeText(payload.reviewer || 'Triage Officer');

        report.assigned_institution = newOwner;
        report.history.push({
          timestamp: now,
          actor: reviewer,
          action: "Routing Mandate Corrected",
          notes: `Reassigned from "${oldOwner}" to "${newOwner}". Auditable Reason: ${cleanReason}`
        });

        auditLogs.unshift({
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: now,
          actor: reviewer,
          action: "MANDATE_ROUTING_CORRECTION",
          target_id: report.id,
          reason: `Reassigned to ${newOwner}: ${cleanReason}`
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid payload" }));
      }
    });
    return;
  }

  if (pathname === '/api/audit-log' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(auditLogs));
    return;
  }

  // Static File Serving
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  // Prevent directory traversal
  let safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If file doesn't exist in public, check in root or data
  if (!fs.existsSync(filePath)) {
    if (safePath.startsWith('data/')) {
      filePath = path.join(__dirname, safePath);
    } else {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - CivicLoop Prototype');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` CivicLoop - Team Nav Bharat (HSC 2027 Prototype)`);
  console.log(` Pilot Location: Nashik District, Maharashtra`);
  console.log(` Local Server running at: http://localhost:${PORT}`);
  console.log(` Zero external dependencies required.`);
  console.log(` Press Ctrl+C to terminate.`);
  console.log(`================================================================`);
});
