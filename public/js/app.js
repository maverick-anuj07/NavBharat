/**
 * CivicLoop - Main Application State & Bilingual Engine
 * Team Nav Bharat - HSC 2027 Prototype
 */

(function () {
  'use strict';

  // Global State Container
  window.CivicApp = {
    lang: 'en',
    activeTab: 'tab-dashboard',
    reports: [],
    governance: null,
    routes: null,
    economicRecords: null,
    auditLogs: [],
    selectedCaseId: null
  };

  // Bilingual UI Localization Dictionary (English & Marathi)
  window.CivicI18n = {
    en: {
      skip_to_content: "Skip to main content",
      prototype_badge: "HSC 2027 PROTOTYPE",
      prototype_banner_text: "Non-governmental civic listening prototype by Team Nav Bharat for Hack for Social Cause 2027. All data is fictional sample data for Nashik district. Exact GPS & personal IDs are never collected.",
      pilot_tag: "Pilot: Nashik District, MH",
      brand_tagline: "Accountable Public Service Listening & Institutional Resolution",
      nav_dashboard: "Public Dashboard",
      nav_report: "Submit Issue",
      nav_authority: "Authority Desk",
      nav_governance: "Polity & Finance",
      nav_charter: "Safeguards & Charter",
      dash_title: "Nashik District Public Service Overview",
      dash_subtitle: "Transparent tracking of citizen reports, aggregate shared concerns, and official institutional commitments across rural and urban Nashik.",
      btn_raise_concern: "Raise a Concern",
      stat_active_issues: "Active Cases Logged",
      stat_shared_voices: "Co-Signed In Concerns",
      stat_avg_sla: "Citizen Charter Target",
      stat_responded: "Responded or Resolved",
      spotlight_heading: "Priority Shared & Collective Concerns",
      spotlight_pill: "Aggregated Without Personal Profiling",
      spotlight_note: "Co-reported systemic concerns requiring multi-agency or departmental coordination",
      search_placeholder: "Search by locality, issue, or reference ID...",
      filter_domain_label: "Domain:",
      filter_all_domains: "All Domains (10)",
      domain_roads: "Roads & Infrastructure",
      domain_water: "Water & Sanitation",
      domain_education: "Education & Exams",
      domain_healthcare: "Healthcare Access",
      domain_worker: "Worker / Service Disruption",
      domain_environment: "Environment & Pollution",
      domain_administration: "Public Administration",
      filter_status_label: "Status:",
      filter_all_statuses: "All Statuses",
      filter_taluka_label: "Taluka:",
      filter_all_talukas: "All 15 Talukas",
      privacy_guarantee_tag: "🛡️ Coarse Locality Redacted • Zero PII Exposed",
      report_form_title: "Report a Public Issue or Shared Concern",
      report_form_subtitle: "Your voice is routed directly to statutory service mandates. No Aadhaar, phone number, or exact address is required.",
      privacy_seal: "Privacy-Safe Demilitarized Ingestion",
      step_mode_legend: "1. Select Report Nature",
      mode_single_title: "Single Service Issue",
      mode_single_desc: "A localized defect such as a pothole, pipeline leak, or streetlight outage.",
      mode_shared_title: "Shared / Recurring Concern",
      mode_shared_desc: "A broader grievance affecting multiple students, patients, or community residents.",
      mode_event_title: "Public Event / Service Disruption",
      mode_event_desc: "Updates on lawful worker assembly, public transit outage, or examination center issues.",
      step_domain_legend: "2. Civic Domain",
      step_locality_legend: "3. Coarse Locality (Privacy Protected)",
      label_taluka: "Taluka / Sub-district *",
      label_coarse_area: "Ward / Division or Village Area *",
      hint_no_exact_address: "⚠️ Do NOT enter apartment numbers, house names, or exact street coordinates.",
      step_details_legend: "4. Issue Summary & Description",
      label_issue_title: "Short Title *",
      label_issue_desc: "Detailed Observations *",
      label_evidence: "Simulated Evidence (Demo Placeholder)",
      upload_desc: "Click to attach photo/document placeholder. (EXIF metadata & faces automatically sanitized)",
      ai_assistant_title: "Civic Heuristic Assistant",
      ai_advisory_pill: "Advisory Heuristic Only",
      ai_predicted_routing: "Candidate Service Mandate:",
      ai_statute_match: "Statutory Basis:",
      ai_duplicate_check: "Similar Cluster Heuristic:",
      ai_safeguard_title: "⚖️ Rights & Truth Safeguard Notice:",
      ai_safeguard_desc: "This algorithm provides non-binding classification suggestions. It is NEVER proof of truth or falsity, credibility, guilt, or political motive. All escalations mandate human authority verification.",
      consent_statement: "I understand that this is a civic listening prototype. My submission will be grouped by coarse locality without publishing my personal identity. I confirm that no real personal sensitive documents (Aadhaar, PAN, phone numbers) are included.",
      btn_submit_report: "Register Fictional Report & View Reference",
      submit_success_title: "Fictional Report Successfully Logged",
      label_issue_ref: "Issue Tracking Reference:",
      submit_success_notes: "Your report has entered the Received state. It will now be reviewed by the designated human triage desk. No phone or email was stored.",
      btn_view_on_dash: "Track in Public Dashboard",
      btn_submit_another: "Submit Another Concern",
      auth_title: "Institutional Reviewer & Resolution Workspace",
      auth_role_badge: "Simulation: Nashik Grievance Triage Desk",
      auth_subtitle: "Private work queue for verified service owners: validate statutory routing, set citizen-charter due dates, record official responses, and manage auditable escalations.",
      auth_lbl_pending: "Awaiting Triage",
      auth_lbl_actioned: "In Pipeline",
      queue_cases_heading: "Assigned Triage Queue",
      auth_select_case_title: "Select a Case from the Queue",
      auth_select_case_desc: "Inspect candidate routing, verify jurisdiction, attach institutional response, or approve human escalation.",
      ws_routing_title: "1. Mandate Routing & Jurisdiction Check",
      ws_assigned_inst: "Assigned Service Body:",
      ws_statutory_basis: "Statutory Mandate:",
      ws_due_date: "Citizen Charter Due Date:",
      ws_lifecycle_title: "2. Update Case Lifecycle State",
      ws_response_title: "3. Record Public Institutional Update",
      btn_publish_update: "Publish Institutional Update to Public Record",
      ws_escalation_title: "4. Auditable Human Escalation",
      ws_human_only: "Human Approval Mandatory",
      ws_escalation_desc: "Escalations cannot be automated by AI heuristics. You must record an official, auditable justification.",
      label_escalate_target: "Escalate To Authority *",
      label_escalate_reason: "Auditable Ground for Escalation *",
      btn_approve_escalation: "Approve & Log Formal Escalation",
      audit_log_title: "Auditable System Review & Safeguard Log",
      audit_log_badge: "Tamper-Evident History",
      audit_log_desc: "Every triage classification, evidence corroboration, and escalation is attributed to a verified reviewer.",
      gov_title: "Indian Polity, Governance & Public Finance Reference",
      gov_subtitle: "Source-attributed constitutional architecture of India, 3-tier federalism, Maharashtra & Nashik administrative routing, and public finance flows.",
      gov_source_seal: "Tier-1 Official Government Sources Only",
      polity_overview_heading: "Constitutional Architecture: Federal Parliamentary Republic",
      polity_overview_text: "India is a parliamentary, federal constitutional republic. The Union, States, and Local Self-Governments operate under statutory mandates defined by the Constitution and state legislative enactments. Crucially, service delivery ownership is governed by departmental jurisdiction and local laws — not by the individual whim of an elected MP or MLA. Civic complaints must be routed to the statutory asset owner (e.g. Municipal Corporation for city roads, PWD for State Highways, Zilla Parishad for rural health).",
      finance_heading: "Public Finance & Intergovernmental Fund Flows",
      finance_pill: "Union Budget & Finance Commission",
      finance_note: "How taxpayer money travels from the central divisible pool to Nashik local bodies",
      flow_1_title: "Union Tax Pool Devolution",
      flow_1_desc: "Union Government collects Gross Tax Revenue. Per the 15th Finance Commission formula, 41% of the net divisible tax pool is devolved horizontally to States.",
      flow_2_title: "Intergovernmental Grants",
      flow_2_desc: "Direct statutory grants are transferred under Article 275 for Rural Local Bodies (RLBs) and Urban Local Bodies (ULBs), divided into Tied (drinking water, sanitation) and Untied funds.",
      flow_3_title: "District Planning Committee (DPDC)",
      flow_3_desc: "Under Article 243ZD, the District Planning Committee consolidates municipal and rural plans into the District Annual Plan for road networks, tribal development, and public healthcare.",
      economic_records_title: "Sourced Fiscal Federalism Seed Data (Nashik & Maharashtra)",
      matrix_heading: "Nashik Service Routing Matrix: Rural vs. Urban Paths",
      matrix_note: "Statutory rules mapping problem domain to responsible institution",
      registry_title: "Official Source Registry & Data Provenance",
      registry_badge: "Verifiable Citations",
      registry_desc: "CivicLoop does not invent officeholders, deadlines, or legal powers. Below is the complete provenance registry of official government repositories consulted.",
      charter_title: "AI & Rights Safeguards Charter",
      charter_subtitle: "Ethical principles governing CivicLoop: protecting peaceful assembly, preventing surveillance, and ensuring algorithmic accountability.",
      charter_badge: "HSC 2027 Core Mandate",
      principle_1_title: "1. Peaceful Assembly Protection",
      principle_1_desc: "Reports concerning strikes, protests, student action, or paper leak grievances are treated as issue-level civic listening. CivicLoop strictly prohibits tracking demonstrators, mapping protest movements, facial indexing, or treating peaceful assembly as a public threat.",
      principle_2_title: "2. No AI Truth or Guilt Judgments",
      principle_2_desc: "AI heuristics only suggest classification and route matching. AI output is never evidence of truth or falsity, credibility, guilt, or officer culpability. No automated law-enforcement dispatch or automated public allegations are permitted.",
      principle_3_title: "3. Identity & Case Record Decoupling",
      principle_3_desc: "Reporter identities are never coupled to public issue records. We strictly avoid Aadhaar, student IDs, phone numbers, home addresses, faces, or precise GPS coordinates. Sensitive domains default to coarse locality (taluka/ward).",
      principle_4_title: "4. Mandatory Human Review for Escalation",
      principle_4_desc: "Every escalation to senior district leadership requires human authorization with an auditable, written justification. Automated algorithmic escalation is strictly prohibited to prevent grievance inflation or weaponization.",
      disclaimer_heading: "Formal Competition Disclaimers & Limitations",
      disclaimer_1: "Non-Governmental Prototype: CivicLoop is an independent academic prototype created by Team Nav Bharat for HSC 2027. It has no live government server integration.",
      disclaimer_2: "Fictional Demonstration Data: All sample issues, work orders, and response notes are simulated for evaluation purposes.",
      disclaimer_3: "Data Minimization & Deletion: Local demo state is stored ephemerally in browser memory and local storage. No persistent citizen surveillance records are created.",
      disclaimer_4: "Statutory Caveat: Governance references reflect public acts and gazetted sources as of October 2026 and do not constitute formal legal counsel."
    },
    mr: {
      skip_to_content: "मुख्य मजकुराकडे जा",
      prototype_badge: "HSC २०२७ प्रोटोटाइप",
      prototype_banner_text: "हॅक फॉर सोशल कॉज २०२७ साठी टीम नव भारत यांनी विकसित केलेला नागरी संवाद प्रोटोटाइप. सर्व माहिती नाशिक जिल्ह्यासाठी काल्पनिक नमुना आहे. अचूक जीपीएस किंवा वैयक्तिक ओळख क्रमांक गोळा केले जात नाहीत.",
      pilot_tag: "पायलट: नाशिक जिल्हा, महाराष्ट्र",
      brand_tagline: "उत्तरदायी सार्वजनिक सेवा संवाद व संस्थात्मक निवारण",
      nav_dashboard: "नागरिक डॅशबोर्ड",
      nav_report: "तक्रार नोंदवा",
      nav_authority: "प्रशासकीय कक्ष",
      nav_governance: "राज्यव्यवस्था व वित्त",
      nav_charter: "सुरक्षा व सनद",
      dash_title: "नाशिक जिल्हा सार्वजनिक सेवा आढावा",
      dash_subtitle: "ग्रामीण व शहरी नाशिकमधील नागरिकांच्या तक्रारी, एकत्रित सामूहिक मुद्दे व संस्थांच्या अधिकृत प्रतिसादांचे पारदर्शक निरीक्षण.",
      btn_raise_concern: "समस्या नोंदवा",
      stat_active_issues: "सक्रिय तक्रारी",
      stat_shared_voices: "एकत्रित सहभाग",
      stat_avg_sla: "सेवा हमी उद्दिष्ट",
      stat_responded: "प्रतिसाद / निवारण",
      spotlight_heading: "प्राधान्य सामूहिक व सामायिक समस्या",
      spotlight_pill: "नागरिकांची ओळख न दर्शवता संकलन",
      spotlight_note: "अनेक विभाग व संस्थांच्या समन्वयाची गरज असलेले सामूहिक प्रश्न",
      search_placeholder: "परिसर, समस्या किंवा संदर्भ क्रमांकाने शोधा...",
      filter_domain_label: "क्षेत्र:",
      filter_all_domains: "सर्व क्षेत्रे (१०)",
      domain_roads: "रस्ते व पायाभूत सुविधा",
      domain_water: "पाणीपुरवठा व स्वच्छता",
      domain_education: "शिक्षण व परीक्षा",
      domain_healthcare: "आरोग्य सेवा",
      domain_worker: "कामगार / सेवा खंडन",
      domain_environment: "पर्यावरण व नद्या",
      domain_administration: "प्रशासकीय सेवा / हक्क",
      filter_status_label: "स्थिती:",
      filter_all_statuses: "सर्व स्थिती",
      filter_taluka_label: "तालुका:",
      filter_all_talukas: "सर्व १५ तालुके",
      privacy_guarantee_tag: "🛡️ स्थूल परिसर सुरक्षितता • शून्य वैयक्तिक माहिती",
      report_form_title: "सार्वजनिक समस्या किंवा सामूहिक मुद्दा नोंदवा",
      report_form_subtitle: "तुमची तक्रार थेट वैधानिक जबाबदार यंत्रणेकडे पोहोचवली जाते. आधार, फोन किंवा घराचा पत्ता देण्याची गरज नाही.",
      privacy_seal: "गोपनीयता-संरक्षित सुरक्षित नोंदणी",
      step_mode_legend: "१. तक्रारीचे स्वरूप निवडा",
      mode_single_title: "वैयक्तिक सेवा समस्या",
      mode_single_desc: "खड्डा, पाईपलाईन गळती किंवा पथदिवा बंद यासारखी विशिष्ट स्थानिक अडचण.",
      mode_shared_title: "सामूहिक / वारंवार उद्भवणारी समस्या",
      mode_shared_desc: "अनेक विद्यार्थी, रुग्ण किंवा रहिवाशांना भेडसावणारा व्यापक प्रश्न.",
      mode_event_title: "सार्वजनिक कार्यक्रम / सेवा खंडन",
      mode_event_desc: "कामगार सभा, बस सेवा खंडन किंवा परीक्षा केंद्रातील गैरसोयीचे अद्यतन.",
      step_domain_legend: "२. समस्या क्षेत्र",
      step_locality_legend: "३. स्थूल परिसर (गोपनीयता संरक्षित)",
      label_taluka: "तालुका / उपविभाग *",
      label_coarse_area: "प्रभाग / विभाग किंवा गाव परिसर *",
      hint_no_exact_address: "⚠️ घराचा क्रमांक, इमारतीचे नाव किंवा अचूक जीपीएस टाकू नका.",
      step_details_legend: "४. समस्येचा सारांश व तपशील",
      label_issue_title: "थोडक्यात शीर्षक *",
      label_issue_desc: "सविस्तर माहिती व निरीक्षणे *",
      label_evidence: "प्रतिकात्मक पुरावा (डेमो प्लेसहोल्डर)",
      upload_desc: "छायाचित्र जोडण्यासाठी येथे क्लिक करा. (तारीख, स्थान व चेहरे स्वयंचलित वगळले जातात)",
      ai_assistant_title: "नागरी सहाय्यक (एआय सल्लागार)",
      ai_advisory_pill: "केवळ मार्गदर्शक सल्ला",
      ai_predicted_routing: "संभाव्य जबाबदार संस्था:",
      ai_statute_match: "वैधानिक आधार:",
      ai_duplicate_check: "परिसरातील सामायिक तपासणी:",
      ai_safeguard_title: "⚖️ हक्क व सत्यता सुरक्षा सूचना:",
      ai_safeguard_desc: "हे अल्गोरिदम केवळ वर्गीकरणाचे अंदाज देते. हा सत्य-असत्य, विश्वासार्हता किंवा दोषाचा कायदेशीर पुरावा नाही. पुढील कार्यवाहीसाठी मानवी अधिकाऱ्याची पडताळणी बंधनकारक आहे.",
      consent_statement: "मी समजतो की हा एक नागरी संवाद प्रोटोटाइप आहे. माझी माहिती वैयक्तिक ओळखीशिवाय स्थूल परिसराच्या आधारे संकलित केली जाईल. मी कोणताही खरा संवेदनशील दस्तावेज (आधार, पॅन, फोन नंबर) जोडलेला नाही.",
      btn_submit_report: "काल्पनिक तक्रार नोंदवून संदर्भ क्रमांक मिळवा",
      submit_success_title: "काल्पनिक तक्रार यशस्वीरीत्या नोंदवली गेली",
      label_issue_ref: "तक्रार संदर्भ क्रमांक:",
      submit_success_notes: "तुमची नोंद 'प्राप्त' स्थितीत दाखल झाली असून मानवी पुनरावलोकन डेस्ककडे पाठवली गेली आहे. कोणताही फोन किंवा ई-मेल साठवलेला नाही.",
      btn_view_on_dash: "नागरिक डॅशबोर्डवर तपासा",
      btn_submit_another: "दुसरी समस्या नोंदवा",
      auth_title: "संस्थात्मक पुनरावलोकन व निवारण कक्ष",
      auth_role_badge: "सिम्युलेशन: नाशिक तक्रार निवारण डेस्क",
      auth_subtitle: "अधिकृत सेवा संस्थांसाठी कार्यक्षेत्र: वैधानिक जबाबदारी निश्चित करा, सेवा हमीची मुदत ठरवा, अधिकृत प्रतिसाद नोंदवा आणि मानवी मंजुरीने वरिष्ठ स्तरावर पाठवा.",
      auth_lbl_pending: "पुनरावलोकन प्रलंबित",
      auth_lbl_actioned: "प्रक्रियेत",
      queue_cases_heading: "कार्यक्षेत्रातील प्रकरणे",
      auth_select_case_title: "यादीतून एक प्रकरण निवडा",
      auth_select_case_desc: "मार्ग पडताळणी करा, अधिकारक्षेत्र तपासा, संस्थात्मक प्रतिसाद जोडा किंवा मानवी मंजुरीने वरिष्ठ स्तरावर पाठवा.",
      ws_routing_title: "१. जबाबदारी व अधिकारक्षेत्र पडताळणी",
      ws_assigned_inst: "नियुक्त सेवा संस्था:",
      ws_statutory_basis: "वैधानिक आधार:",
      ws_due_date: "सेवा हक्क कायद्यानुसार अंतिम मुदत:",
      ws_lifecycle_title: "२. प्रकरणाची स्थिती अद्यतनित करा",
      ws_response_title: "३. अधिकृत संस्थात्मक प्रतिसाद नोंदवा",
      btn_publish_update: "सार्वजनिक नोंदीमध्ये अधिकृत प्रतिसाद प्रसिद्ध करा",
      ws_escalation_title: "४. मानवी मंजुरीने वरिष्ठ स्तरावर पाठवणे",
      ws_human_only: "केवळ मानवी मंजुरी आवश्यक",
      ws_escalation_desc: "एआयद्वारे स्वयंचलित वरिष्ठ स्तरावर पाठवता येत नाही. लिखित व पडताळण्यायोग्य अधिकृत कारण नमूद करणे बंधनकारक आहे.",
      label_escalate_target: "वरिष्ठ अधिकारक्षेत्र निवडा *",
      label_escalate_reason: "वरिष्ठ स्तरावर पाठवण्याचे लिखित कारण *",
      btn_approve_escalation: "औपचारिक मंजुरी नोंदवा",
      audit_log_title: "प्रणाली पुनरावलोकन व सुरक्षा ऑडिट लॉग",
      audit_log_badge: "अपरिवर्तनीय पारदर्शक इतिहास",
      audit_log_desc: "प्रत्येक वर्गीकरण, पुरावा तपासणी व वरिष्ठ स्तरावर पाठवण्याची नोंद प्रमाणित पुनरावलोकनकर्त्याशी जोडलेली असते.",
      gov_title: "भारतीय राज्यव्यवस्था, प्रशासन व सार्वजनिक वित्त संदर्भ",
      gov_subtitle: "भारताची घटनात्मक रचना, ३-स्तरीय संघराज्य पद्धत, महाराष्ट्र व नाशिक प्रशासकीय जबाबदाऱ्या आणि सार्वजनिक निधी वाटप.",
      gov_source_seal: "केवळ अधिकृत शासकीय स्रोत",
      polity_overview_heading: "घटनात्मक चौकट: संसदीय, संघराज्य प्रजासत्ताक",
      polity_overview_text: "भारत हे एक संसदीय संघराज्य प्रजासत्ताक आहे. केंद्र, राज्य आणि स्थानिक स्वराज्य संस्था राज्यघटनेने घालून दिलेल्या अधिकारांनुसार कार्य करतात. सार्वजनिक सेवेची जबाबदारी विभाग व स्थानिक कायद्यांवर अवलंबून असते — ती कोणत्याही लोकप्रतिनिधीच्या वैयक्तिक अधिकारात नसते. तक्रारींचे निवारण संबंधित वैधानिक संस्थेकडूनच होते.",
      finance_heading: "सार्वजनिक वित्त व आंतर-सरकारी निधी प्रवाह",
      finance_pill: "केंद्रीय अर्थसंकल्प व वित्त आयोग",
      finance_note: "करदात्यांचा पैसा केंद्रीय तिजोरीतून नाशिकच्या स्थानिक संस्थांपर्यंत कसा पोहोचतो",
      flow_1_title: "केंद्रीय कर वाटप",
      flow_1_desc: "केंद्र सरकार गोळा केलेल्या एकूण कर महसुलातील ४१% रक्कम १५ व्या वित्त आयोगाच्या सूत्रानुसार राज्यांना वितरित करते.",
      flow_2_title: "आंतर-सरकारी थेट अनुदान",
      flow_2_desc: "कलम २७५ अन्वये जिल्हा परिषद व महापालिकेला थेट पाणीपुरवठा व स्वच्छतेसाठी सशर्त व बिनशर्त अनुदाने मिळतात.",
      flow_3_title: "जिल्हा नियोजन समिती (DPDC)",
      flow_3_desc: "कलम २४३ZD अन्वये नाशिक जिल्हा नियोजन समिती ग्रामीण व शहरी क्षेत्रासाठी वार्षिक जिल्हा नियोजन आराखडा तयार करते.",
      economic_records_title: "अधिकृत आर्थिक संदर्भ माहिती (नाशिक व महाराष्ट्र)",
      matrix_heading: "नाशिक सेवा वितरण मॅट्रिक्स: ग्रामीण व शहरी मार्ग",
      matrix_note: "समस्येनुसार जबाबदार संस्था व सेवा नियमांची माहिती",
      registry_title: "अधिकृत माहिती स्रोत नोंदवही",
      registry_badge: "सत्यापित स्रोत",
      registry_desc: "सिव्हिक-लूप कोणतीही खोटी माहिती किंवा पदनामे तयार करत नाही. खाली अधिकृत शासकीय संकेतस्थळांची यादी दिली आहे.",
      charter_title: "एआय व नागरिक हक्क सुरक्षा सनद",
      charter_subtitle: "सिव्हिक-लूपची नैतिक तत्त्वे: शांततामय आंदोलनाचे रक्षण, गुप्त देखरेख प्रतिबंध आणि अल्गोरिदम उत्तरदायित्व.",
      charter_badge: "HSC २०२७ मुख्य तत्त्व",
      principle_1_title: "१. शांततामय आंदोलनाचे रक्षण",
      principle_1_desc: "संप, निदर्शने, विद्यार्थी आंदोलन किंवा पेपरफुटीच्या तक्रारी केवळ 'नागरी समस्या ऐकणे' या दृष्टीने हाताळल्या जातात. आंदोलकांवर पाळत ठेवणे किंवा चेहऱ्यांची ओळख करणे पूर्णपणे प्रतिबंधित आहे.",
      principle_2_title: "२. एआय सत्य किंवा दोषाचा न्यायनिवाडा करत नाही",
      principle_2_desc: "एआय केवळ वर्गीकरणाच्या सूचना देते. एआयचे निष्कर्ष हे सत्य-असत्य किंवा दोषाचा कायदेशीर पुरावा मानले जात नाहीत. पोलिसांकडे स्वयंचलित तक्रार नोंदणी प्रतिबंधित आहे.",
      principle_3_title: "३. तक्रारदार ओळख व प्रकरणाचे वेगळेपण",
      principle_3_desc: "नागरिकांची वैयक्तिक ओळख सार्वजनिक नोंदींमध्ये कधीही जोडली जात नाही. आधार, फोन नंबर, घराचा पत्ता किंवा अचूक जीपीएस साठवणे पूर्णपणे टाळले जाते.",
      principle_4_title: "४. वरिष्ठ स्तरावर पाठवण्यासाठी मानवी मंजुरी अनिवार्य",
      principle_4_desc: "वरिष्ठ अधिकाऱ्यांकडे प्रकरण पाठवण्यासाठी मानवी पुनरावलोकनकर्त्याची लिखित व अधिकृत मंजुरी आवश्यक आहे. स्वयंचलित प्रणालीला हा अधिकार नाही.",
      disclaimer_heading: "प्रोटोटाइप मर्यादा व कायदेशीर अस्वीकरण",
      disclaimer_1: "अशासकीय प्रोटोटाइप: सिव्हिक-लूप हा हॅक फॉर सोशल कॉज २०२७ साठी तयार केलेला शैक्षणिक प्रकल्प आहे. थेट सरकारी सर्व्हरशी जोडलेला नाही.",
      disclaimer_2: "काल्पनिक प्रात्यक्षिक माहिती: सर्व नमुना प्रकरणे व प्रतिसाद मूल्यमापनासाठी तयार केलेले काल्पनिक आहेत.",
      disclaimer_3: "डेटा संकोच व नष्ट करणे: सर्व माहिती केवळ ब्राउझर मेमरीमध्ये तात्पुरती साठवली जाते. कोणतीही कायमस्वरूपी पाळत ठेवली जात नाही.",
      disclaimer_4: "कायदेशीर मर्यादा: दिलेली संदर्भ माहिती अधिकृत कायद्यांवर आधारित असून तो कायदेशीर सल्ला नाही."
    }
  };

  // Translation Function
  window.t = function (key) {
    const dict = window.CivicI18n[window.CivicApp.lang] || window.CivicI18n.en;
    return dict[key] || window.CivicI18n.en[key] || key;
  };

  // Language Switcher Handler
  window.setLanguage = function (lang) {
    if (lang !== 'en' && lang !== 'mr') return;
    window.CivicApp.lang = lang;

    // Update active button state
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-mr').classList.toggle('active', lang === 'mr');
    document.getElementById('lang-en').setAttribute('aria-pressed', lang === 'en');
    document.getElementById('lang-mr').setAttribute('aria-pressed', lang === 'mr');

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Re-translate all DOM elements marked with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.t(key);
    });

    // Re-translate inputs with data-i18n-ph
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      el.setAttribute('placeholder', window.t(key));
    });

    // Trigger sub-module re-renders
    if (window.renderDashboard) window.renderDashboard();
    if (window.renderAuthorityQueue) window.renderAuthorityQueue();
    if (window.renderGovernanceExplorer) window.renderGovernanceExplorer();
  };

  // Tab Switcher Handler
  window.switchTab = function (targetTabId) {
    window.CivicApp.activeTab = targetTabId;

    // Update Tab Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === targetTabId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget);
    });

    // Update Tab Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });

    // Scroll to top of pane smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh views if needed
    if (targetTabId === 'tab-dashboard' && window.renderDashboard) {
      window.renderDashboard();
    } else if (targetTabId === 'tab-authority' && window.renderAuthorityQueue) {
      window.renderAuthorityQueue();
    } else if (targetTabId === 'tab-governance' && window.renderGovernanceExplorer) {
      window.renderGovernanceExplorer();
    }
  };

  // Initialize App on DOM Load
  document.addEventListener('DOMContentLoaded', async () => {
    // Attach Tab Clicks
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        window.switchTab(target);
      });
    });

    // Attach Language Clicks
    document.getElementById('lang-en').addEventListener('click', () => window.setLanguage('en'));
    document.getElementById('lang-mr').addEventListener('click', () => window.setLanguage('mr'));

    // Load Data
    await loadInitialData();

    // Render Initial State
    window.setLanguage('en');
    if (window.initReportingWizard) window.initReportingWizard();
    if (window.initAuthorityWorkspace) window.initAuthorityWorkspace();
  });

  async function loadInitialData() {
    try {
      // Fetch Reports
      const resReports = await fetch('/api/reports');
      if (resReports.ok) {
        window.CivicApp.reports = await resReports.json();
      }
    } catch (e) {
      console.warn('[CivicLoop] Could not fetch /api/reports, using embedded fallback.', e);
    }

    try {
      // Fetch Governance
      const resGov = await fetch('/api/governance');
      if (resGov.ok) {
        window.CivicApp.governance = await resGov.json();
      }
    } catch (e) {
      console.warn('[CivicLoop] Could not fetch /api/governance', e);
    }

    try {
      // Fetch Routes
      const resRoutes = await fetch('/api/nashik-routes');
      if (resRoutes.ok) {
        window.CivicApp.routes = await resRoutes.json();
      }
    } catch (e) {
      console.warn('[CivicLoop] Could not fetch /api/nashik-routes', e);
    }

    try {
      // Fetch Economic Records
      const resEcon = await fetch('/api/economic-records');
      if (resEcon.ok) {
        window.CivicApp.economicRecords = await resEcon.json();
      }
    } catch (e) {
      console.warn('[CivicLoop] Could not fetch /api/economic-records', e);
    }

    try {
      // Fetch Audit Logs
      const resAudit = await fetch('/api/audit-log');
      if (resAudit.ok) {
        window.CivicApp.auditLogs = await resAudit.json();
      }
    } catch (e) {
      console.warn('[CivicLoop] Could not fetch /api/audit-log', e);
    }
  }

})();
