# CivicLoop Architecture & System Design Notes
**Team Nav Bharat — Hack for Social Cause 2027 (HSC 2027)**  
*Pilot: Nashik District, Maharashtra, India*

---

## 1. High-Level System Architecture

CivicLoop is architected as an **independent civic listening and institutional resolution engine** designed to bridge the trust gap between citizens and public authorities without relying on punitive surveillance, mass profiling, or opaque AI judgment.

```
+---------------------------------------------------------------------------------------+
|                                    CITIZEN LAYER                                      |
|  - Anonymous Issue Reporting (Single Defect)                                          |
|  - Shared / Recurring Community Concern Aggregation (Education, Health, Water)       |
|  - Public Service Disruption & Peaceful Assembly Dialogue Updates                     |
|  - Coarse Locality Picker (Taluka / Ward) • Redaction Preview • Bilingual UI          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v (Zero PII Ingestion)
+---------------------------------------------------------------------------------------+
|                             CIVICLOOP INGESTION & TRIAGE                              |
|  1. Demilitarized Sanitization: Strips GPS EXIF, 10-digit phones, 12-digit IDs, emails |
|  2. Advisory Heuristic Engine: Suggests domain & candidate authority (Non-Binding)    |
|  3. Deduplication Heuristic: Identifies spatial-thematic clusters for shared counts   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                INSTITUTIONAL ROUTING                                  |
|  - Verified Statutory Matrix (MMC Act 1949, ZP & PS Act 1961, RTS Act 2015)          |
|  - Separate Rural & Urban Administrative Trajectories (NMC vs. Zilla Parishad vs. PWD)|
|  - Public Finance & Grant Linkage (15th Finance Commission Tied/Untied Allocations)   |
+---------------------+-------------------------------------+---------------------------+
                      |                                     |
                      v                                     v
+-----------------------------------+ +-------------------------------------------------+
|       PUBLIC STATUS FEED          | |           AUTHORITY RESOLUTION WORKSPACE        |
| - Coarse Cluster Density Maps     | | - Private Triage Queue (SLA / Priority)         |
| - Chronological Response Audit    | | - Factual Response Recording (Work Orders)      |
| - Zero Identity / Profile Leakage | | - Mandatory Human-Approved Auditable Escalation |
| - Open Reference Registry         | | - Tamper-Evident System Audit Trail             |
+-----------------------------------+ +-------------------------------------------------+
```

---

## 2. Core Rights Safeguards & Non-Punitive Philosophy

### A. Non-Punitive Civic Listening vs. Protest Monitoring
* **Article 19(1)(b) Protection:** Peaceful assembly and collective strikes (such as industrial worker shifts or student exam center grievances) are recognized as lawful democratic expressions of underlying service friction.
* **No Demonstrator Profiling:** CivicLoop explicitly prohibits identifying, indexing, tracking, or facial-scanning attendees, organizers, or student leaders.
* **Dialogue Desks:** Event updates are routed to designated Sub-Divisional Magistrates (SDMs) and Labour Commissioners as administrative dialogue notices, not police threat triggers.

### B. Decoupled Identity Architecture
* Public records never store or reference Aadhaar numbers, student enrollment codes, phone numbers, home addresses, or exact street coordinates.
* Issues are tracked via cryptographic, randomized references (`CIVIC-2026-XXXX`).
* Locality is strictly coarsened to the municipal ward or gram panchayat cluster.

### C. Human-in-the-Loop AI Boundary Charter
* AI heuristics provide **advisory assistance only** (e.g. classification suggestion, candidate statutory mandate, possible cluster link).
* **AI never assesses:**
  1. Truth or falsity of a citizen allegation.
  2. Credibility or moral trustworthiness of a reporter.
  3. Guilt, culpability, or malicious intent.
  4. Individual performance or corruption scoring of named government officers.
* All status transitions, evidence corroborations, and escalations require an auditable human reviewer action.

---

## 3. Data Flow & Status Lifecycle

A case moves through seven rigorously auditable states:
1. `Received`: Logged into demilitarized intake; PII sanitized; advisory category assigned.
2. `Awaiting human review`: Pending triage by designated desk officer.
3. `Corroboration review`: Inspection of physical defect evidence (pothole depth, valve rupture) without judging personal credibility.
4. `Referred to verified service owner`: Dispatched to statutory asset custodian (e.g., NMC City Engineer or ZP DHO).
5. `Response received`: Official institutional commitment, work order, or repair timeline published.
6. `Resolved`: Physical resolution verified and documented.
7. `Closed with reason`: Documented administrative closure with auditable explanation.

---

## 4. Local Execution & Zero-Dependency Runtime
* **Runtime:** Standard Node.js (`http`, `fs`, `path`).
* **Client:** Accessible, semantic HTML5, Vanilla CSS3 (high contrast, responsive grid), and vanilla ES6 modules.
* **Portability:** Operates 100% offline without external cloud dependencies, API keys, or paid software tiers.

---

## 5. Admin Map & Spatial Analytics Architecture

```
+---------------------------------------------------------------------------------------+
|                             MAP PRESENTATION ENGINE                                   |
|                                                                                       |
|   +------------------------------------+   +--------------------------------------+   |
|   |  PREFERRED PROVIDER: GOOGLE MAPS   |   |     OFFLINE LOCAL FALLBACK PROVIDER  |   |
|   |  - Loaded dynamically if key valid |   |   - High-Fidelity Nashik Vector Map  |   |
|   |  - Centered on Nashik (20.0, 73.8) |   |   - 15 Talukas GeoJSON / SVG Shapes  |   |
|   |  - API restrictions enforced       |   |   - 100% Offline, Zero Key Required  |   |
|   +-----------------+------------------+   +-------------------+------------------+   |
|                     |                                          |                      |
|                     +--------------------+---------------------+                      |
|                                          |                                            |
|                                          v                                            |
|                  +----------------------------------------------+                     |
|                  |     DUAL-MODE VISUALIZATION OVERLAY          |                     |
|                  | 1. Issue Pins (Red/Orange/Yellow/Green + Sym)|                     |
|                  | 2. Issue Concentration Layer (Coarse Taluka) |                     |
|                  +----------------------------------------------+                     |
+------------------------------------------+--------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                            PRIVACY & RIGHTS ENFORCEMENT                               |
|  - Strictly Coarse Coordinates: Taluka / Ward centroids only (no personal GPS)         |
|  - Assembly Safeguard: Protests/strikes mapped as service issues, never people/crowds  |
|  - Zero Tracking: No participant markers, movement trails, or police intelligence feeds|
|  - Separate from Traffic: Issue concentration != vehicular congestion                  |
+---------------------------------------------------------------------------------------+
```

### A. Dual-Mode Map Strategy (Google Maps Platform & Offline Fallback)
1. **Google Maps Platform (Maps JavaScript API):**
   * Configured via environment variable `GOOGLE_MAPS_API_KEY` or through the secure in-browser modal.
   * Dynamically loads `maps.googleapis.com/maps/api/js?key=...&libraries=places,geometry`.
   * **Security Best Practice:** Recommended configuration includes:
     - HTTP Referrer Restrictions: Restrict key usage to `localhost:3000/*` and production URLs.
     - API Restrictions: Limit scope strictly to "Maps JavaScript API".
     - Budget / Quota Alerts: Configure Google Cloud billing budget alerts to prevent unexpected spend.
   * **Never in Source Control:** The API key is stored only in runtime environment or session memory, never committed to Git.
2. **Offline High-Fidelity Local Vector Map:**
   * Provided natively when no API key is detected or network is unreachable.
   * Renders an authentic geographic SVG of Nashik District encompassing all 15 talukas (Nashik, Malegaon, Niphad, Sinnar, Dindori, Igatpuri, Kalwan, Baglan, Yeola, Chandwad, Nandgaon, Trimbakeshwar, Peth, Surgana, Deola) with interactive projection and hover tooltips.
   * Guarantees judges and evaluators can inspect 100% of spatial functionality without third-party credentials.

### B. Deprecation Notice: Prohibition of `HeatmapLayer`
* Google Maps Platform has officially deprecated and decommissioned `google.maps.visualization.HeatmapLayer`.
* CivicLoop implements a custom, maintainable **Issue Concentration Layer**:
  - Aggregates distinct issues and related submissions by coarse taluka / ward polygon.
  - Dynamically calculates issue density, urgency weighting, and verification status.
  - Renders proportional geographic concentration rings with distinct coloration.
  - **Distinction from Traffic:** Google Traffic (`TrafficLayer`) measures road vehicular velocity. CivicLoop concentration measures public-service issue saturation. CivicLoop strictly avoids conflating the two.

### C. Neutral Workload & Operational Queue Management
* The Ward & Service-Office Workload View is designed as an operational queue-balancing aid for administrative supervisors.
* **Ethics Charter:**
  1. No "worst officer" labels, blame scores, league tables, or punitive AI rankings.
  2. Sorting by open/overdue count is neutral queue triage.
  3. Contextual indicators (jurisdiction population, staffing vacancies, historic backlog, transfer dates) must accompany any workload view.
  4. Current officers' names appear only if verified from official state gazettes; otherwise labeled as `Holder Not Verified`.
  5. Personal telephone numbers and off-duty locations of officials are completely shielded.
