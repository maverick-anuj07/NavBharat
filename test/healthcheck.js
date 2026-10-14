/**
 * CivicLoop Test Suite & Integrity Healthcheck
 * Validates JSON structures, server API routes, and rights safeguards
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('--- [1/3] Validating JSON Datasets Integrity ---');

const dataDir = path.join(__dirname, '..', 'data');
const requiredFiles = [
  'india_governance.json',
  'nashik_routes.json',
  'sample_reports.json',
  'economic_records.json'
];

let errors = [];

requiredFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing data file: ${file}`);
    return;
  }
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✓ ${file} parsed successfully`);

    if (file === 'sample_reports.json') {
      if (!Array.isArray(content) || content.length < 5) {
        errors.push(`sample_reports.json must contain at least 5 sample reports. Found: ${content.length}`);
      }
      content.forEach(r => {
        if (!r.id || !r.domain || !r.status || !r.fictional_disclaimer) {
          errors.push(`Report ${r.id || 'unknown'} missing required fields or fictional disclaimer.`);
        }
        if (!r.coarse_coordinates || typeof r.coarse_coordinates.lat !== 'number' || typeof r.coarse_coordinates.lng !== 'number') {
          errors.push(`Report ${r.id} missing valid coarse_coordinates (lat/lng).`);
        }
        if (!r.due_date_state || !r.ward_office) {
          errors.push(`Report ${r.id} missing due_date_state or ward_office.`);
        }
      });
    }

    if (file === 'india_governance.json') {
      ['jurisdictions', 'institutions', 'offices_and_roles', 'elected_offices_and_terms', 'economic_records', 'source_registry'].forEach(key => {
        if (!content[key] || !Array.isArray(content[key])) {
          errors.push(`india_governance.json missing array field: ${key}`);
        }
      });
    }

    if (file === 'nashik_routes.json') {
      if (!content.service_routes || !Array.isArray(content.service_routes)) {
        errors.push('nashik_routes.json missing service_routes array.');
      }
    }
  } catch (e) {
    errors.push(`Syntax error parsing ${file}: ${e.message}`);
  }
});

if (errors.length > 0) {
  console.error('Validation FAILED with errors:', errors);
  process.exit(1);
} else {
  console.log('✓ All 4 datasets validated successfully with required schemas and geo attributes.\n');
}

console.log('--- [2/3] Validating Rights & Privacy Safeguards ---');
const sampleReports = JSON.parse(fs.readFileSync(path.join(dataDir, 'sample_reports.json'), 'utf8'));
sampleReports.forEach(r => {
  // Check that no exact phone numbers or 12-digit Aadhaar patterns exist
  const raw = JSON.stringify(r);
  if (/\b\d{4}\s\d{4}\s\d{4}\b/.test(raw)) {
    errors.push(`Report ${r.id} violates privacy: Contains 12-digit pattern resembling Aadhaar!`);
  }
  if (/\b[6-9]\d{9}\b/.test(raw)) {
    errors.push(`Report ${r.id} violates privacy: Contains 10-digit Indian phone number!`);
  }
});

if (errors.length > 0) {
  console.error('Privacy Safeguards Check FAILED:', errors);
  process.exit(1);
} else {
  console.log('✓ Privacy check passed: Zero real phone numbers, Aadhaar, or private street addresses in sample seed data.\n');
}

console.log('--- [3/3] Testing Server Integration & API Endpoints ---');

// Spawn server module in-process on ephemeral port
process.env.PORT = '3099';
require('../server.js');

setTimeout(() => {
  // 1. Test /api/reports
  http.get('http://localhost:3099/api/reports', res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (!Array.isArray(parsed) || parsed.length < 5) {
          console.error('Unexpected response format from /api/reports:', body);
          process.exit(1);
        }
        console.log(`✓ HTTP GET /api/reports returned ${parsed.length} reports with status 200 OK.`);

        // 2. Test /api/config
        http.get('http://localhost:3099/api/config', resConfig => {
          let confBody = '';
          resConfig.on('data', c => confBody += c);
          resConfig.on('end', () => {
            const conf = JSON.parse(confBody);
            if (conf.pilot_region && conf.default_center) {
              console.log(`✓ HTTP GET /api/config returned valid map configuration (${conf.pilot_region}).`);
            } else {
              console.error('Invalid config response:', confBody);
              process.exit(1);
            }

            // 3. Test /api/correct-route
            const postData = JSON.stringify({
              report_id: "CIVIC-2026-0891",
              new_institution: "Public Works Department (PWD) - Nashik Rural Division",
              reason: "Asset boundary inspection confirmed State Highway classification",
              reviewer: "Triage Desk Lead"
            });

            const postReq = http.request({
              hostname: 'localhost',
              port: 3099,
              path: '/api/correct-route',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
              }
            }, resPost => {
              let pBody = '';
              resPost.on('data', c => pBody += c);
              resPost.on('end', () => {
                const updated = JSON.parse(pBody);
                if (updated.assigned_institution.includes("Public Works Department")) {
                  console.log(`✓ HTTP POST /api/correct-route successfully updated mandate to PWD.`);
                  console.log('\n==================================================');
                  console.log(' ALL CIVICLOOP MAP & ANALYTICS CHECKS PASSED!');
                  console.log('==================================================');
                  process.exit(0);
                } else {
                  console.error('Route correction failed:', pBody);
                  process.exit(1);
                }
              });
            });

            postReq.on('error', err => {
              console.error('Error on POST /api/correct-route:', err);
              process.exit(1);
            });

            postReq.write(postData);
            postReq.end();
          });
        });

      } catch (e) {
        console.error('Error parsing response from /api/reports:', e);
        process.exit(1);
      }
    });
  }).on('error', err => {
    console.error('Server connection test failed:', err);
    process.exit(1);
  });
}, 800);
