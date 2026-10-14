# CivicLoop (नागरिक चक्र)
### Accountable Public Service Listening & Institutional Resolution Platform
**Team Nav Bharat** — Solo Student Entry  
**Competition:** Hack for Social Cause 2027 (HSC 2027), MY Bharat / VBYLD  
**Host Institution:** IIT Bombay / Ministry of Youth Affairs & Sports  
**Theme:** Governance and Civic Technology  
**Pilot District:** Nashik District, Maharashtra, India  
**License:** [MIT License](LICENSE)

---

## 📌 Implementation Plan in Five Bullets

1. **Repository & Governance Foundation:** Established a clean, local repository with an MIT license, `.gitignore`, and source-attributed reference datasets (`india_governance.json`, `nashik_routes.json`, `economic_records.json`, `sample_reports.json`) anchored in official primary sources (India Code, LGD codes, MoF Union Budget, ECI, 15th Finance Commission, and RBI).
2. **Citizen Reporting & Privacy-First Intake:** Implemented an accessible, bilingual (English & Marathi) reporting workflow supporting individual issues, shared community concerns, and public event updates across 10 civic domains; automatically sanitizes PII, defaults to coarse localities (talukas/wards), avoids Aadhaar/biometric inputs, and ensures non-punitive, assembly-respecting civic listening.
3. **Public Status & Shared Concerns Dashboard:** Built a high-performance public dashboard featuring aggregate counters, domain and taluka filters, full 7-step status lifecycles (from *Received* to *Resolved* or *Closed*), and coarse cluster views for shared healthcare, education/exam-integrity, water, and worker concerns without exposing reporter identities or treating collective grievances as security threats.
4. **Authority Reviewer & Audit Queue:** Developed an interactive authority workspace with verified statutory routing suggestions, SLA/due-date standards, duplicate linkage, missing-information requests, human-in-the-loop escalation with auditable justification logs, and strict AI safeguard boundaries (advisory heuristics only, no automated guilt or credibility scoring).
5. **Polity & Public Finance Explorer & HSC Dossier:** Integrated a navigable reference explorer for Indian fiscal federalism and administrative structures, accompanied by complete documentation: architecture notes, data dictionary, 3–5 minute demo video script, IIT Bombay 6–7 slide deck outline, AI disclosure template, and competition checklist.

---

## 💡 The Problem & The Solution

### The Problem
Residents often cannot tell which public body is responsible for a broken road, water leak, sanitation hazard, streetlight outage, school/exam concern, or healthcare access issue. Inquiries are frequently scattered, ignored, or politicized. Furthermore, when citizens express shared concerns through collective action, student demonstrations, or worker strikes, existing platforms either fail to listen or treat democratic assembly as a security threat.

### The CivicLoop Solution
CivicLoop is a prototype for reporting public-service issues or shared concerns, grouping similar reports, routing grievances to verified statutory service bodies, tracking official responses, and presenting a transparent, privacy-safe public status. It operates as a **civic listening and resolution tool**, not an enforcement, campaigning, or crowd-control system. Peaceful protest and strike activity is treated as legitimate civic demand to be heard and resolved through institutional dialogue.

---

## 🌟 Key Application Features

* **10 Civic Domains:** Roads & Infrastructure, Water & Sanitation, Education & Exams, Healthcare, Public Administration / RTS, Environment, Worker & Service Disruption, Integrity Grievances, Collective Concerns / Event Updates, and Other Public Concerns.
* **3 Reporting Modes:**
  * Single Service Issue (e.g. pothole or broken valve).
  * Shared / Recurring Concern (e.g. rural PHC doctor vacancies or exam center conditions).
  * Public Event / Service Update (e.g. industrial worker transit disruption during peaceful assembly).
* **Privacy-Safe Ingestion:** Defaults to coarse locality (Taluka / Ward / Gram Panchayat). Never requests Aadhaar, student IDs, phone numbers, faces, or precise GPS coordinates.
* **7-Step Status Lifecycle:**
  `Received` ➔ `Awaiting human review` ➔ `Corroboration review` ➔ `Referred to verified service owner` ➔ `Response received` ➔ `Resolved` ➔ `Closed with reason`.
* **Shared Concerns Aggregation:** Automatically groups similar reports by domain and coarse locality to highlight collective community priorities with aggregate counts.
* **Authority Resolution Workspace:** Private work queue for designated triage officers to validate statutory routing, configure citizen charter due dates, publish official institutional responses, and execute auditable human escalations.
* **Bilingual UI:** Instant one-click toggle between English (`EN`) and Marathi (`मराठी`).
* **Indian Polity & Public Finance Reference:** 3-Tier constitutional federalism diagram, Nashik service routing matrix (rural vs. urban), and fiscal federalism data (Union tax devolution, 15th FC local body grants, and District Planning Committee funds).

---

## 🛡️ AI & Rights Safeguards Charter

1. **Peaceful Assembly Protection (Article 19(1)(b)):** Reports concerning strikes, student demonstrations, or protests are treated as issue-level civic listening. The platform strictly prohibits tracking demonstrators, indexing participants, facial scanning, or treating peaceful assembly as a public threat.
2. **No AI Truth or Credibility Verdicts:** AI heuristics suggest classification and routing candidates only. AI output is **never** proof of truth, falsity, credibility, guilt, or officer performance. No automated police referral or automated media leaks.
3. **Decoupled Identity:** Reporter identities are not coupled with public records. Issues are identified by randomized references (`CIVIC-2026-XXXX`).
4. **Human Review for Escalation:** Automated algorithmic escalation is strictly prohibited. Every escalation requires a human reviewer with an auditable written justification.

---

## 🏛️ Sourced Indian Governance Reference Data

All starter data in `data/` is attributed to official Tier-1 government sources:
* **The Constitution of India & Acts:** [India Code](https://www.indiacode.gov.in/) (Arts. 243-243ZG, 245-255, 7th, 11th, and 12th Schedules).
* **Local Government Directory (LGD):** [Ministry of Panchayati Raj](https://panchayat.gov.in/en/lgd/) (State 27, Nashik District 485, 15 Talukas).
* **Union Budget & Public Finance:** [Ministry of Finance](https://www.indiabudget.gov.in/) (Receipts Budget, Demands for Grants).
* **Intergovernmental Transfers:** [Finance Commission of India](https://fincomindia.nic.in/) (15th FC 41% tax devolution & local body grants).
* **Monetary & Banking Framework:** [Reserve Bank of India](https://www.rbi.org.in/) (State Finances & Ways and Means Advances).
* **Electoral Boundaries:** [Election Commission of India](https://www.eci.gov.in/statistical-reports) (Lok Sabha & Vidhan Sabha delimitation).
* **Nashik Local Administration:** [Nashik District Collectorate](https://nashik.gov.in/), [Nashik Municipal Corporation](https://nmc.gov.in/), and [Nashik Zilla Parishad](https://nashikzp.gov.in/).

---

## 🚀 Quickstart & Local Execution

CivicLoop is built with **zero external dependencies** and can be run immediately on any machine with Node.js installed.

### 1. Run the Local Prototype Server
```bash
# From the project root
npm start
# OR directly
node server.js
```
The server will start at: **`http://localhost:3000`**

### 2. Run Automated Healthcheck & Test Suite
```bash
npm test
# OR directly
node test/healthcheck.js
```
The healthcheck validates:
* JSON schema integrity for all 4 governance and sample datasets.
* Privacy safeguards (confirming zero real phone numbers, Aadhaar, or private IDs).
* HTTP server routes (`/api/reports`, `/api/governance`, `/api/nashik-routes`, `/api/economic-records`, `/api/audit-log`).

---

## 📁 Project Structure

```
civicloop/
├── data/
│   ├── india_governance.json    # Constitutional structure, jurisdictions, institutions, sources
│   ├── nashik_routes.json       # Rural vs. urban service routing matrix for Nashik
│   ├── sample_reports.json      # Fictional sample issues across 10 domains
│   └── economic_records.json    # Sourced fiscal federalism & fund flow records
├── public/
│   ├── index.html               # Semantic, accessible, bilingual single-page app
│   ├── css/
│   │   └── style.css            # Modern civic tech design system & responsive layout
│   └── js/
│       ├── app.js               # State management, English/Marathi dictionary, router
│       ├── dashboard.js         # Public feed, metrics, shared concerns, detail modal
│       ├── reporting.js         # Citizen intake wizard, heuristic assistant, PII sanitizer
│       ├── authority.js         # Triage queue, response composer, human escalation, audit log
│       └── governance.js        # Polity explorer, routing matrix table, source registry
├── docs/
│   ├── architecture.md          # System architecture, data flow, rights model
│   ├── data_dictionary.md       # Complete entity schemas and field descriptions
│   ├── demo_script.md           # 3–5 minute competition demo video script
│   ├── presentation_deck_outline.md # 6–7 slide presentation deck tailored for IIT Bombay
│   ├── ai_tool_disclosure.md    # Draft AI tool usage disclosure for student verification
│   └── hsc_submission_checklist.md  # Step-by-step portal submission & deadline reconciliation
├── test/
│   └── healthcheck.js           # Automated validation and integrity test script
├── server.js                    # Built-in zero-dependency local HTTP server
├── package.json                 # Project configuration & npm scripts
├── .gitignore                   # Standard git ignore definitions
└── LICENSE                      # MIT Open Source License
```

---

## ⚠️ Limitations & Disclaimers

1. **Academic Demonstration Prototype:** CivicLoop was developed for Hack for Social Cause 2027 by Team Nav Bharat. It has **no live government connection, official endorsement, or legal standing**.
2. **100% Fictional Demo Data:** All sample reports, citizen pseudonyms, work orders, and response notes are simulated for academic evaluation.
3. **Illustrative Timelines:** Service response timelines and SLAs are illustrative figures drawn from citizen charter guidelines; they are not statutory guarantees.
4. **Ephemeral Storage:** Citizen submissions are held in local runtime memory and local storage during the demo session; no persistent surveillance database is created.

---

## 📝 Remaining HSC Submission Steps for the Student

1. **Verify Deadline in Official Portal:** Log into the competition portal to check the authoritative submission deadline countdown (reconciling conflicting dates in guidelines).
2. **Download Official IIT Bombay PPT Template:** Paste the slide content from `docs/presentation_deck_outline.md` into the official template.
3. **Record 3–5 Minute Demo Video:** Follow the click-by-click narration in `docs/demo_script.md`.
4. **Sign Annexures & AI Disclosure:** Confirm your contribution percentage in `docs/ai_tool_disclosure.md` and sign the official annexure with your institution.
5. **Local Review First:** Keep all work local until you have reviewed the prototype. When ready, initialize the remote repository and submit before the portal cutoff.
