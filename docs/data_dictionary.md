# CivicLoop Data Dictionary & Governance Reference Schema
**Team Nav Bharat — Hack for Social Cause 2027 (HSC 2027)**  
*Pilot: Nashik District, Maharashtra*

This document defines the schema, field types, constraints, and source verification standards for all structured datasets included in `data/`.

---

## 1. Jurisdictions (`jurisdictions`)
Stored in: `data/india_governance.json`

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `jurisdiction_id` | String (Unique) | Stable uppercase identifier | `JUR-MH-NSK-ULB-NMC` |
| `official_name` | String | De jure administrative name | `Nashik Municipal Corporation` |
| `level` | String | Level: Union, State, District, Sub-district, ULB, RLB | `Urban Local Body` |
| `parent_id` | String (Nullable)| Reference to parent jurisdiction | `JUR-MH-NASHIK-DIST` |
| `official_code` | String | Statutory census / LGD code | `250165` (LGD) |
| `code_type` | String | Standardization authority | `LGD Local Body Code` |
| `valid_from` | Date (YYYY-MM-DD) | Formation date | `1982-11-07` |
| `valid_to` | Date (Nullable) | Dissolution date or null if active | `null` |
| `source_id` | String | Source registry citation | `SRC-LGD-MOPR` |
| `last_verified` | Date | Verification audit date | `2026-10-14` |
| `status` | String | `active` or `reorganized` | `active` |

---

## 2. Institutions (`institutions`)
Stored in: `data/india_governance.json`

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `institution_id` | String (Unique) | Stable entity identifier | `INST-MAHA-HEALTH-DHO` |
| `official_name` | String | Official gazetted title | `District Health Office (DHO), Nashik ZP` |
| `institution_type`| String | Constitutional, Statutory, Executive, ULB, PRI | `District Public Health Authority` |
| `jurisdiction_id` | String | Operating jurisdiction reference | `JUR-MH-NSK-RLB-ZP` |
| `mandate_summary` | String | Core statutory responsibilities | `100+ PHCs, rural immunization, maternal health`|
| `official_website`| URL | Public governmental portal | `https://nashikzp.gov.in/health` |
| `source_id` | String | Source registry reference | `SRC-NASHIK-ZP` |
| `verification_state`| String | `verified` or `provisional` | `verified` |

---

## 3. Offices & Roles (`offices_and_roles`)
Stored in: `data/india_governance.json`

*Caveat: Role titles and statutory functions are verified from gazettes. Individual officer names are not hardcoded as permanent service owners due to periodic civil service transfers.*

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `role_id` | String | Stable role code (e.g., `ROLE-MH-NSK-COLL`) |
| `role_name` | String | Statutory title (e.g., `Collector & District Magistrate, Nashik`) |
| `appointing_mechanism` | String | IAS cadre allocation / State departmental promotion mechanism |
| `institution_id` | String | Linked institution code |
| `public_responsibilities` | Array | Factual list of executive obligations under law |
| `holder_attribution_caveat` | String | Explicit caveat regarding officer turnover |

---

## 4. Elected Offices & Terms (`elected_offices_and_terms`)
Stored in: `data/india_governance.json`

*Caveat: Elected legislators (MPs, MLAs) deliberate policy and represent citizen voices. Statutory municipal maintenance and executive grievance redressal are legally assigned to executive local bodies. CivicLoop keeps legislative representation separate from executive case ownership.*

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `office_id` | String | Constituency identifier (`ELEC-LS-MH-20-NASHIK`) |
| `office_title` | String | Parliamentary / Assembly office title |
| `constituency_name` | String | Official ECI constituency name (`20-Nashik`) |
| `legislative_tier` | String | Lok Sabha, Rajya Sabha, Vidhan Sabha, Vidhan Parishad |
| `constitutional_article`| String | Constitutional basis (`Article 81`) |
| `source_id` | String | Citations from ECI statistical portals |
| `service_boundary_caveat` | String | Clear notice distinguishing legislative oversight from departmental service delivery |

---

## 5. Economic & Public Finance Records (`economic_records`)
Stored in: `data/economic_records.json`

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Fiscal entry code (`REC-TAX-DEV-MH-2425`) |
| `entity` | String | Public body or receiving state (`Government of Maharashtra`) |
| `fiscal_year` | String | Target financial year (`2024-25`) |
| `category` | String | Tax Devolution, Tied Grant, Untied Grant, Plan Scheme |
| `amount_inr_crores` | Float | Official financial value in Crores INR (`77800.0`) |
| `stage` | String | Budget Estimates (BE), Revised Estimates (RE), Actuals |
| `source_name` | String | MoF Union Budget / Finance Commission statement reference |
| `caveat` | String | Formula weights (population, area, forest) and statutory conditions |

---

## 6. Service Mandates & Routing Matrix (`service_routes`)
Stored in: `data/nashik_routes.json`

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `route_id` | String | Route code (`RT-WATER-URBAN-NMC`) |
| `domain` | String | One of 10 civic domains |
| `locality_type` | String | `urban`, `rural`, `semi_urban`, or `all` |
| `responsible_institution` | String | Statutory body accountable for resolution |
| `routing_condition` | String | Factual trigger criteria |
| `escalation_channel` | String | Hierarchy of human appellate escalation |
| `illustrative_sla_days` | Integer | Illustrative working days SLA based on citizen charters |
| `statutory_reference` | String | Act, section, and citizen charter standard |
| `verification_state` | String | `verified_statutory` |

---

## 7. Sample Reports (`sample_reports`)
Stored in: `data/sample_reports.json`

| Field Name | Type | Safeguard Principle |
| :--- | :--- | :--- |
| `id` | String | Random reference (`CIVIC-2026-XXXX`). Never linked to voter or citizen ID. |
| `fictional_disclaimer` | String | **Mandatory:** `DEMO SAMPLE - 100% FICTIONAL RECORD FOR CIVICLOOP PILOT` |
| `domain` | String | Categorization domain |
| `report_mode` | String | `individual_issue`, `shared_recurring_concern`, `event_service_update` |
| `coarse_locality` | String | Ward, Gram Panchayat, or Taluka level. No street coordinates or house numbers. |
| `status` | String | Lifecycle state (7-step pipeline) |
| `aggregate_count` | Integer | Clustered voice count for shared community concerns |
| `history` | Array | Chronological, attribution-labeled action events with timestamps |
| `ai_assistance` | Object | Heuristic suggestions with explicit uncertainty disclaimer and redaction audit |
