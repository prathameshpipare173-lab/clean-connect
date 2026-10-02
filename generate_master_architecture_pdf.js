import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generateMasterArchitecturePDF() {
  const outputPath = path.resolve('Clean_Connect_Complete_Technical_Architecture.pdf');
  const doc = new PDFDocument({
    margins: { top: 40, bottom: 25, left: 40, right: 40 },
    size: 'A4',
    autoFirstPage: true,
    info: {
      Title: 'Clean Connect — Complete Technical Architecture & Specification',
      Author: 'Clean Connect Engineering Team',
      Subject: 'Comprehensive Technical Blueprint, Full Stack Details, APIs, and Architecture',
      Keywords: 'React, Capacitor, Android, Gemini AI, GIS, GVP, Local-First, Rural Waste Management',
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const PAGE_WIDTH = doc.page.width;
  const PAGE_HEIGHT = doc.page.height;
  const MARGIN = 40;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
  const TOTAL_PAGES = 7;

  // Color Palette
  const C_FOREST_DARK = '#0D3B16';
  const C_FOREST_PRIMARY = '#176B28';
  const C_FOREST_LIGHT = '#E7F4E6';
  const C_GOLD = '#D9A441';
  const C_GOLD_BG = '#FEF3C7';
  const C_TEXT_MAIN = '#172019';
  const C_TEXT_MUTED = '#4B5563';
  const C_BORDER = '#E5E7EB';
  const C_BG_CARD = '#F9FAFB';
  const C_CODE_BG = '#1E293B';
  const C_CODE_TEXT = '#38BDF8';

  function drawTopHeader(title) {
    doc.save();
    doc.fillColor(C_FOREST_PRIMARY);
    doc.rect(0, 0, PAGE_WIDTH, 24).fill();
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('CLEAN CONNECT — TECHNICAL ARCHITECTURE SPECIFICATION', MARGIN, 8, { lineBreak: false });
    doc.fillColor('#D8EED5').fontSize(8).font('Helvetica').text(title, MARGIN, 8, { align: 'right', width: CONTENT_WIDTH, lineBreak: false });
    doc.restore();
    doc.y = 36;
  }

  function drawBottomFooter(pageNum) {
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.save();
    doc.fillColor('#F3F4F6');
    doc.rect(0, PAGE_HEIGHT - 20, PAGE_WIDTH, 20).fill();
    doc.fillColor(C_FOREST_PRIMARY).fontSize(7.5).font('Helvetica-Bold').text('CLEAN CONNECT', MARGIN, PAGE_HEIGHT - 14, { lineBreak: false });
    doc.fillColor(C_TEXT_MUTED).font('Helvetica').text(' • Panhala Taluka Rural Circular Economy Architecture', MARGIN + 74, PAGE_HEIGHT - 14, { lineBreak: false });
    doc.text(`Page ${pageNum} of ${TOTAL_PAGES}`, PAGE_WIDTH - MARGIN - 80, PAGE_HEIGHT - 14, { align: 'right', width: 80, lineBreak: false });
    doc.restore();
    doc.page.margins.bottom = oldBottom;
  }

  function sectionHeading(num, text) {
    doc.moveDown(0.7);
    const y = doc.y;
    doc.save();
    doc.fillColor(C_FOREST_PRIMARY).rect(MARGIN, y, 4, 17).fill();
    doc.fillColor(C_TEXT_MAIN).fontSize(12.5).font('Helvetica-Bold').text(`${num}. ${text}`, MARGIN + 12, y + 2);
    doc.restore();
    doc.moveDown(0.4);
  }

  function subHeading(text) {
    doc.moveDown(0.35);
    doc.fillColor(C_FOREST_DARK).fontSize(10).font('Helvetica-Bold').text(text, MARGIN);
    doc.moveDown(0.25);
  }

  function paragraph(text) {
    doc.fillColor(C_TEXT_MUTED).fontSize(8.5).font('Helvetica').text(text, { lineGap: 2.2 });
    doc.moveDown(0.3);
  }

  function bullet(label, desc) {
    const y = doc.y;
    doc.save();
    doc.fillColor(C_FOREST_PRIMARY).circle(MARGIN + 4, y + 5, 2.2).fill();
    doc.restore();
    doc.fillColor(C_TEXT_MAIN).fontSize(8.5).font('Helvetica-Bold').text(label + ': ', MARGIN + 14, y, { continued: true });
    doc.fillColor(C_TEXT_MUTED).font('Helvetica').text(desc, { lineGap: 1.8 });
    doc.moveDown(0.25);
  }

  function callout(title, text, type = 'info') {
    doc.moveDown(0.25);
    const bg = type === 'alert' ? '#FEE2E2' : type === 'gold' ? C_GOLD_BG : C_FOREST_LIGHT;
    const border = type === 'alert' ? '#EF4444' : type === 'gold' ? C_GOLD : C_FOREST_PRIMARY;
    const titleColor = type === 'alert' ? '#991B1B' : type === 'gold' ? '#92400E' : C_FOREST_DARK;
    
    const startY = doc.y;
    doc.save();
    doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, 40, 6).fillAndStroke(bg, border);
    doc.fillColor(titleColor).fontSize(8).font('Helvetica-Bold').text(title, MARGIN + 10, startY + 6, { lineBreak: false });
    doc.fillColor(C_TEXT_MUTED).fontSize(7.5).font('Helvetica').text(text, MARGIN + 10, startY + 17, { width: CONTENT_WIDTH - 20, lineGap: 1.8 });
    doc.restore();
    doc.y = startY + 44;
    doc.moveDown(0.25);
  }

  function drawTable(headers, rows, colWidths) {
    doc.moveDown(0.25);
    let startY = doc.y;
    
    // Header Row
    doc.save();
    doc.rect(MARGIN, startY, CONTENT_WIDTH, 17).fill(C_FOREST_PRIMARY);
    let xOffset = MARGIN + 6;
    headers.forEach((h, i) => {
      doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold').text(h, xOffset, startY + 4.5, { width: colWidths[i] - 10, lineBreak: false });
      xOffset += colWidths[i];
    });
    doc.restore();
    startY += 17;

    // Body Rows
    rows.forEach((row, rIdx) => {
      const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : C_BG_CARD;
      const rowH = 15;

      doc.save();
      doc.rect(MARGIN, startY, CONTENT_WIDTH, rowH).fillAndStroke(rowBg, C_BORDER);
      let cellX = MARGIN + 6;
      row.forEach((cell, cIdx) => {
        const isBold = cIdx === 0;
        doc.fillColor(isBold ? C_TEXT_MAIN : C_TEXT_MUTED).fontSize(7).font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .text(cell, cellX, startY + 3.5, { width: colWidths[cIdx] - 10, ellipsis: true, lineBreak: false });
        cellX += colWidths[cIdx];
      });
      doc.restore();
      startY += rowH;
    });

    doc.y = startY + 4;
    doc.moveDown(0.25);
  }

  function codeBlock(title, code) {
    doc.moveDown(0.25);
    const lines = code.split('\n');
    const boxH = (lines.length * 10) + 18;

    const startY = doc.y;
    doc.save();
    doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, boxH, 6).fill(C_CODE_BG);
    doc.fillColor('#94A3B8').fontSize(6.8).font('Helvetica-Bold').text(title.toUpperCase(), MARGIN + 10, startY + 5, { lineBreak: false });
    
    let lineY = startY + 16;
    lines.forEach(line => {
      doc.fillColor(C_CODE_TEXT).fontSize(6.8).font('Courier').text(line, MARGIN + 10, lineY, { lineBreak: false });
      lineY += 10;
    });
    doc.restore();
    doc.y = startY + boxH + 4;
    doc.moveDown(0.25);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(C_FOREST_DARK);
  
  doc.save();
  doc.fillColor('#176B28');
  doc.circle(PAGE_WIDTH - 40, 80, 140).fill();
  doc.fillColor('#0A2810');
  doc.circle(40, PAGE_HEIGHT - 60, 120).fill();
  doc.restore();

  // White Card container
  doc.save();
  doc.roundedRect(MARGIN, 50, CONTENT_WIDTH, PAGE_HEIGHT - 100, 16).fill('#FFFFFF');
  
  // Header badge
  doc.fillColor(C_FOREST_PRIMARY).roundedRect(MARGIN + 24, 75, 230, 22, 11).fill();
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('RURAL CIRCULAR ECONOMY PLATFORM', MARGIN + 32, 81);

  // Main Title
  doc.fillColor(C_FOREST_DARK).fontSize(28).font('Helvetica-Bold').text('CLEAN CONNECT', MARGIN + 24, 110);
  doc.fillColor(C_FOREST_PRIMARY).fontSize(14).font('Helvetica-Bold').text('Comprehensive Technical Architecture & Specification', MARGIN + 24, 142);
  doc.fillColor(C_TEXT_MUTED).fontSize(9.5).font('Helvetica').text('Detailed Blueprint covering Front-End, Back-End, Mobile Runtime, AI Vision, GIS Engines, APIs, and Gamification Subsystems', MARGIN + 24, 162, { width: CONTENT_WIDTH - 48, lineGap: 2.5 });

  // Metadata Grid Box
  const metaY = 210;
  doc.roundedRect(MARGIN + 24, metaY, CONTENT_WIDTH - 48, 130, 8).fillAndStroke(C_BG_CARD, C_BORDER);
  
  doc.fillColor(C_FOREST_PRIMARY).fontSize(9).font('Helvetica-Bold').text('PROJECT & SPECIFICATION METADATA', MARGIN + 36, metaY + 12);
  
  const metaItems = [
    ['System Name', 'Clean Connect (Waste-to-Wealth Platform)'],
    ['Deployment Target', 'Android Native (Capacitor 8) & Web SPA (React 18)'],
    ['Target Geography', 'Panhala Taluka, Kolhapur District, Maharashtra, India'],
    ['Core Intelligence', 'Google Gemini 1.5 Flash Multimodal Vision API'],
    ['Architecture Paradigm', 'Local-First Reactive State with Offline Queue Sync'],
    ['Document Version', 'Release 2.4.0 — Production Ready (August 2026)']
  ];

  let curMetaY = metaY + 30;
  metaItems.forEach(([k, v]) => {
    doc.fillColor(C_TEXT_MAIN).fontSize(8).font('Helvetica-Bold').text(k + ':', MARGIN + 36, curMetaY, { width: 140, lineBreak: false });
    doc.fillColor(C_TEXT_MUTED).font('Helvetica').text(v, MARGIN + 180, curMetaY, { width: CONTENT_WIDTH - 230, lineBreak: false });
    curMetaY += 15;
  });

  // Table of Contents Preview
  doc.fillColor(C_FOREST_DARK).fontSize(10.5).font('Helvetica-Bold').text('DOCUMENT CONTENTS', MARGIN + 24, 360);
  const toc = [
    '1. Executive Summary & Problem Space',
    '2. Complete Technology Stack & Language Inventory',
    '3. High-Level System Architecture & Component Interactions',
    '4. Front-End Architecture (React 18, State, Styling & GIS)',
    '5. Back-End & Local-First Persistence Engine',
    '6. Native Mobile Container Architecture (Capacitor Android)',
    '7. Complete API Specifications & Integration Blueprints',
    '8. Multi-Role User Workflows & RBAC Security Model',
    '9. Codebase Directory & File Manifest',
    '10. Build, Packaging & Deployment Pipeline'
  ];

  let tocY = 380;
  toc.forEach(t => {
    doc.fillColor(C_FOREST_PRIMARY).fontSize(8).font('Helvetica-Bold').text('▶', MARGIN + 24, tocY, { lineBreak: false });
    doc.fillColor(C_TEXT_MAIN).font('Helvetica').text(t, MARGIN + 38, tocY, { lineBreak: false });
    tocY += 15;
  });

  doc.fillColor(C_TEXT_MUTED).fontSize(8).font('Helvetica').text('Confidential & Proprietary — Clean Connect Engineering', MARGIN + 24, PAGE_HEIGHT - 75, { align: 'center', width: CONTENT_WIDTH - 48, lineBreak: false });
  doc.restore();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: SECTION 1 & SECTION 2
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('1. Executive Summary | 2. Full Tech Stack');

  sectionHeading(1, 'Executive Summary & Problem Statement');
  paragraph(
    'Clean Connect is a purpose-built rural waste management, decentralized recycling, and circular economy intelligence platform. In rural India—specifically talukas such as Panhala in Kolhapur, Maharashtra—waste management suffers from poor segregation at the source, lack of door-to-door logistics accountability, and absence of commercial links to industrial recyclers. Clean Connect bridges these gaps through a unified digital platform combining household incentives, P2P organic manure trading, and Gram Panchayat governance.'
  );
  paragraph(
    'The application operates on a Local-First reactive architectural foundation packaged as an Android native APK via Capacitor 8. It delivers zero-latency user experiences across remote villages with intermittent connectivity, while leveraging hardware-level GPS, camera sensors, and multimodal AI recognition.'
  );

  callout('CORE MISSION GOAL', 'To convert rural waste into economic wealth by providing instant cash/points for segregated waste, empowering local Swachhata Sathis (agents), enabling farmer-to-farmer compost exchange, and allocating Gram Vikas Points (GVP) to fund public village infrastructure projects.');

  sectionHeading(2, 'Complete Technology Stack & Language Inventory');
  paragraph('Clean Connect is built using modern, highly optimized open-source technologies across every architectural layer:');

  const stackTableHeaders = ['Domain / Layer', 'Technology / Tool', 'Version', 'Role & Responsibility'];
  const stackTableWidths = [90, 110, 55, CONTENT_WIDTH - 255];
  const stackTableData = [
    ['User Interface', 'React 18 (SPA)', '18.3.1', 'Component lifecycle, virtual DOM, reactive UI'],
    ['DOM Lifecycle', 'React DOM', '18.3.1', 'DOM reconciliation & event delegation'],
    ['Client Router', 'React Router DOM', '6.28.0', 'SPA routing, RoleGuard RBAC, history state'],
    ['Mobile Container', 'Capacitor Android', '8.5.0', 'Native WebView wrapper & Java plugin bridge'],
    ['Capacitor CLI', '@capacitor/cli', '8.5.0', 'Asset syncing & native build orchestration'],
    ['Native Plugins', '@capacitor/camera, geo, app', '8.x', 'Hardware camera, GPS, back button handling'],
    ['CSS Engine', 'Tailwind CSS', '3.4.15', 'Utility styling with Material Design 3 tokens'],
    ['CSS Processing', 'PostCSS & Autoprefixer', '8.4 / 10.4', 'Vendor prefixing & CSS compilation'],
    ['Icons', 'Lucide React', '0.460.0', 'Lightweight vector iconography tree'],
    ['Charts & KPI', 'Recharts', '2.13.3', 'SVG charts for Panchayat metrics & trends'],
    ['Geospatial Maps', 'MapLibre GL & Leaflet', '5.1 / 1.9', 'Vector map rendering, GPS pin drops, route lines'],
    ['Geocoding API', 'OSM Nominatim REST', 'v2', 'Reverse geocoding coordinates to village address'],
    ['Navigation Engine', 'OSRM (Open Source Routing)', 'v5', 'Turn-by-turn routing & road distance matrix'],
    ['AI Computer Vision', '@google/generative-ai', '0.24.1', 'Gemini 1.5 Flash automated waste classification'],
    ['Unique Identity', 'UUID & CCID Generator', '11.0.3', 'Alphanumeric CC-XXXXXXX household tokens'],
    ['State Management', 'React Context API', 'Native', 'AuthContext & DataContext reactive stores'],
    ['Local Database', 'Web Storage (LocalStorage)', 'Native', 'JSON schema stores with seed migrations'],
    ['Build System', 'Vite & Rollup', '6.0.1', 'Lightning-fast ES modules & production bundling'],
    ['Native JVM/SDK', 'Gradle & JDK 21 (API 34)', '8.14.3', 'Android APK compilation & manifest packing']
  ];
  drawTable(stackTableHeaders, stackTableData, stackTableWidths);
  drawBottomFooter(2);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3: SECTION 3 & SECTION 4
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('3. System Architecture | 4. Front-End Architecture');

  sectionHeading(3, 'High-Level System Architecture');
  paragraph(
    'Clean Connect follows a multi-tier client-centric architecture. The client bundle runs inside a secure, hardware-accelerated Android WebView orchestrated by Capacitor. State is synchronized instantaneously with local partitioned persistence, eliminating network blocking during critical field operations.'
  );

  bullet('Presentation Tier', 'Responsive React 18 Single Page Application styled with tailored Tailwind MD3 design tokens, Google Fonts (Plus Jakarta Sans & Inter), and micro-animated interactions.');
  bullet('Native Bridge Tier', 'Capacitor 8 Java plugins interfacing with camera hardware, GPS location listeners, and Android OS lifecycle events.');
  bullet('State & Persistence Tier', 'React Context providers (AuthContext, DataContext) managing immutable state transitions, automatic schema migrations, and atomic wallet ledgers in LocalStorage.');
  bullet('External Intelligence Tier', 'Asynchronous cloud services including Google Gemini 1.5 Flash vision model, OpenStreetMap Nominatim reverse geocoding, and OSRM routing servers.');

  sectionHeading(4, 'Front-End Architecture & Design System');
  subHeading('4.1 State Management via React Context API');
  paragraph(
    'Clean Connect isolates application concerns into two primary context providers to ensure high performance and prevent unnecessary re-renders:'
  );
  bullet('AuthContext (`src/contexts/AuthContext.jsx`)', 'Handles user authentication, active sessions, Role-Based Access Control (RBAC), OTP validation workflows, and profile switching.');
  bullet('DataContext (`src/contexts/DataContext.jsx`)', 'Central relational entity store managing waste logs, wallet transactions, manure marketplace orders, Gram Vikas Points (GVP) transactions, dump reports, and village rankings.');

  subHeading('4.2 Material Design 3 & Eco Theme Styling');
  paragraph(
    'The styling system combines Tailwind CSS with curated color tokens representing the rural green economy: Deep Forest (`#0D3B16`), Lush Green (`#176B28`), Gold Amber (`#D9A441`), Steel Blue (`#3A6B8C`), and Dark Purple (`#4A2D73`). All UI cards feature rounded borders (`rounded-2xl` to `rounded-[32px]`), subtle elevation shadows (`shadow-soft`), and tactile click feedback (`active:scale-95`).'
  );

  subHeading('4.3 Geospatial Mapping & GIS Integration');
  paragraph(
    'Clean Connect incorporates MapLibre GL and Leaflet to provide rich geographic interfaces: interactive pin drops for waste logging, real-time agent position tracking with pulsing radar markers, and road-following navigation lines computed via the OSRM routing engine.'
  );
  drawBottomFooter(3);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4: SECTION 5 & SECTION 6
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('5. Back-End & Data | 6. Native Android Container');

  sectionHeading(5, 'Back-End & Local-First Persistence Engine');
  paragraph(
    'To guarantee operational reliability in remote agricultural and hilly areas of Panhala with zero cell reception, Clean Connect implements a local-first persistence engine utilizing partitioned JSON stores in browser Web Storage:'
  );

  const storageTableHeaders = ['Storage Key', 'Entity Stored', 'Schema Description & Keys'];
  const storageTableWidths = [120, 110, CONTENT_WIDTH - 230];
  const storageTableData = [
    ['avengers_users', 'User Accounts', 'id, ccId, name, email, phone, role, village_id, designation'],
    ['avengers_villages', 'Service Areas', 'id, name, marathi_name, taluka, lat, lng, gvp_score, tier'],
    ['avengers_waste_entries', 'Waste Logs', 'id, household_id, category, weight_kg, status, lat, lng, timestamp'],
    ['avengers_wallets', 'User Wallets', 'household_id, cash_balance, points_balance, total_points_earned'],
    ['avengers_wallet_ledger', 'Financial Ledger', 'id, wallet_id, type (credit/debit), amount, points, reason, timestamp'],
    ['avengers_gvp_transactions', 'GVP Ledger', 'id, panchayatId, category, points, sourceType, sourceId, timestamp'],
    ['avengers_manure_listings', 'P2P Manure Ads', 'id, seller_id, manure_type, quantity_kg, price_per_kg, points_per_kg'],
    ['avengers_lots', 'Recycler Lots', 'id, village_id, category, total_weight_kg, price_per_kg, status'],
    ['avengers_dump_reports', 'Illegal Dumps', 'id, reporter_user_id, lat, lng, description, reward_points, status'],
    ['avengers_seeded', 'Migration Version', 'String tag (e.g. PANHALA_2026_V2) triggering idempotent data seeding']
  ];
  drawTable(storageTableHeaders, storageTableData, storageTableWidths);

  subHeading('5.1 Idempotent Seeding & Data Normalization');
  paragraph(
    'The initialization lifecycle evaluates the `avengers_seeded` flag. If outdated or absent, the `resetPanhalaDemoData()` routine executes, migrating mock datasets while strictly preserving all non-demo real user registrations. Waste entries and ledger items undergo structural normalization ensuring both `timestamp` and `createdAt` are populated to prevent runtime parsing exceptions.'
  );

  sectionHeading(6, 'Native Android Mobile Architecture (Capacitor 8)');
  paragraph(
    'Capacitor bridges the web application into a compiled native Android project (`com.avengers.wastetowealth`), packaging compiled static assets into `android/app/src/main/assets/public` and running within an optimized Android System WebView.'
  );

  bullet('Hardware Camera Plugin (`@capacitor/camera`)', 'Captures high-resolution waste logs and proof-of-collection photographs directly from the rear camera with instant base64 transcoding for AI analysis.');
  bullet('Hardware Geolocation Plugin (`@capacitor/geolocation`)', 'Leverages fused GPS and Wi-Fi location providers to obtain high-accuracy coordinates (< 10m precision) with automated web fallback.');
  bullet('Hardware Back Navigation (`@capacitor/app` & `BackButtonHandler.jsx`)', 'Intercepts the physical Android back button to navigate history smoothly or exit the app safely without abrupt WebView crashes.');
  drawBottomFooter(4);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5: SECTION 7 (APIs PART 1)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('7. Complete API Specifications (AI, GIS & GVP)');

  sectionHeading(7, 'Complete API Specifications & Integrations');

  subHeading('7.1 Google Gemini 1.5 Flash Multimodal Vision API');
  paragraph(
    'The AI Waste Classifier ingests base64 image data captured from the device camera and transmits a zero-shot prompt requiring structured JSON output:'
  );
  
  codeBlock('Gemini 1.5 Flash Request & Response Schema', 
`// Request Prompt
const prompt = "Analyze this waste item for rural Indian waste management. 
Return strictly JSON with keys: detectedWaste, recommendedCategory (wet, dry, plastic, 
paper, ewaste, hazardous, metal, other), confidence (0-1), instructions.";

// Response JSON
{
  "detectedWaste": "PET Plastic Water Bottle",
  "recommendedCategory": "plastic",
  "confidence": 0.96,
  "instructions": "Empty liquid, crush bottle flat, and place in blue dry segregation bin."
}`
  );

  subHeading('7.2 OpenStreetMap Nominatim Reverse Geocoding API');
  paragraph(
    'Converts raw GPS latitude and longitude into human-readable rural addresses, extracting village names, landmarks, and taluka information:'
  );

  codeBlock('Nominatim Reverse Geocoding REST Endpoint',
`GET https://nominatim.openstreetmap.org/reverse?format=json&lat=16.80668&lon=74.11259&zoom=18
Headers: { "User-Agent": "CleanConnect-Panhala/2.0" }

Response:
{
  "display_name": "Shivaji Chowk, Panhala Fort, Panhala, Kolhapur, Maharashtra, 416201, India",
  "address": { "road": "Fort Road", "village": "Panhala", "county": "Panhala", "state": "Maharashtra" }
}`
  );

  subHeading('7.3 Gram Vikas Points (GVP) Gamification Engine API');
  paragraph(
    'The GVP Engine translates household compliance and recycler handoffs into community development grants for the Gram Panchayat:'
  );

  const gvpTableHeaders = ['Action / Event Trigger', 'Points Awarded', 'Category Tag', 'Economic / Social Goal'];
  const gvpTableWidths = [125, 65, 95, CONTENT_WIDTH - 285];
  const gvpTableData = [
    ['Waste Pickup Completed', '+20 GVP', 'WASTE_PICKUP', 'Incentivize daily household collection'],
    ['On-Time Pickup (< 4 hrs)', '+10 GVP', 'PICKUP_BONUS', 'Reward rapid agent pickup responsiveness'],
    ['Recycler Bulk Transfer', '+2 GVP / kg', 'RECYCLER_TRANSFER', 'Encourage commercial recycling volume'],
    ['Organic Farm Composting', '+1.5 GVP / kg', 'ORGANIC_COMPOST', 'Support rural organic fertilizer generation'],
    ['Segregation Milestone', '+50 GVP', 'SEGREGATION', 'Achieve >85% village segregation rate'],
    ['Participation Milestone', '+30 GVP', 'PARTICIPATION', 'Milestone: 50, 100, 200 registered homes'],
    ['Environment Bonus Drive', '+100 GVP', 'ENVIRONMENT_BONUS', 'Historic site cleanup (Panhala Fort)'],
    ['Delayed Pickup (>24h)', '-10 GVP', 'PENALTY', 'Penalize uncollected waste bottlenecks']
  ];
  drawTable(gvpTableHeaders, gvpTableData, gvpTableWidths);
  drawBottomFooter(5);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6: SECTION 7 (APIs PART 2) & SECTION 8
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('7. APIs (Contd.) | 8. Multi-Role RBAC Security');

  subHeading('7.4 P2P Organic Manure Marketplace API');
  paragraph(
    'Farmers create listings for decomposed cow dung, vermicompost, and organic compost. Buyers can purchase using cash or earned Green Points through atomic wallet debit/credit transactions.'
  );

  codeBlock('P2P Manure Order Placement Contract',
`createManureOrder({
  listingId: "mn_pnh_001",
  buyerId: "u_pnh_demo_001",
  sellerId: "u_pnh_004",
  manureType: "Vermicompost (Gandul Khat)",
  quantityKg: 25,
  pointsAmount: 100, // 4 pts/kg
  deliveryNotes: "Deliver near Tabak Udyan gate."
});`
  );

  sectionHeading(8, 'Multi-Role User Workflows & RBAC Security');
  paragraph(
    'Clean Connect enforces strict Role-Based Access Control (RBAC) across four distinct rural stakeholder profiles:'
  );

  bullet('1. Villager / Household (`villager`)', 'Logs waste by weight and category, scans waste via AI, tracks live agent arrival on map, earns Green Points & cash, redeems store vouchers, buys/sells manure, and reports illegal roadside dumping.');
  bullet('2. Collection Agent / Swachhata Sathi (`agent`)', 'Views dynamic queue of assigned village pickups, launches turn-by-turn navigation to GPS coordinates, photographs collection proof, and triggers instant wallet disbursements.');
  bullet('3. Industrial Recycler (`recycler`)', 'Explores bulk aggregated waste lots generated by Gram Panchayats, submits auction bids, claims lots, and uploads digital recycling certificates.');
  bullet('4. Gram Panchayat Administrator (`admin`)', 'Oversees taluka-level cleanliness metrics, allocates field agents, tracks GVP development funds across 5 tiers, sanctions public improvement grants, and monitors household compliance rankings.');

  const roleTableHeaders = ['Role Key', 'Portal Home Path', 'Allowed Route Prefix', 'Brand Accent Color'];
  const roleTableWidths = [85, 110, 140, CONTENT_WIDTH - 335];
  const roleTableData = [
    ['villager', '/villager', '/villager/*', '#2C5F2D (Forest Green)'],
    ['agent', '/agent', '/agent/*', '#1B7A78 (Teal)'],
    ['recycler', '/recycler', '/recycler/*', '#3A6B8C (Steel Blue)'],
    ['admin', '/admin', '/admin/*', '#4A2D73 (Deep Purple)']
  ];
  drawTable(roleTableHeaders, roleTableData, roleTableWidths);
  drawBottomFooter(6);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 7: SECTION 9 & SECTION 10
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawTopHeader('9. Codebase Manifest | 10. Build & Deployment');

  sectionHeading(9, 'Complete Codebase File Manifest');
  paragraph('A concise index of all core application source files and their architectural responsibilities:');

  const fileTableHeaders = ['File Path', 'Architectural Role & Description'];
  const fileTableWidths = [160, CONTENT_WIDTH - 160];
  const fileTableData = [
    ['src/App.jsx', 'App root, animated emerald splash screen, route definitions, and navbar isolation'],
    ['src/contexts/AuthContext.jsx', 'User session management, RBAC login/logout, OTP verification & phone masking'],
    ['src/contexts/DataContext.jsx', 'Master data engine, normalized seed loader, atomic CRUD, and GVP ledger mutations'],
    ['src/data/villages.js', 'Master database of 10 Panhala service areas with canonical GPS coordinates'],
    ['src/data/seed.js', 'Realistic Panhala demonstration dataset (50 villagers, lots, manure ads, GVP logs)'],
    ['src/pages/auth/Login.jsx', 'Login screen with Panhala Fort panoramic hero banner & 1-tap demo logins'],
    ['src/pages/auth/Register.jsx', 'GPS "Detect My Village" registration with Haversine distance sorting'],
    ['src/pages/admin/PanchayatDashboard.jsx', 'Admin control center, GVP indicators, Recharts analytics, and reports access'],
    ['src/pages/admin/GVPDashboard.jsx', 'Gram Vikas Points ledger, category breakdown, and Tier advancement tracker'],
    ['src/pages/villager/VillagerDashboard.jsx', 'Villager home hub, active pickups, Green Points balance, and shortcut grid'],
    ['src/pages/villager/Map.jsx', 'GPU-accelerated MapLibre GIS map with interactive waste pins & live agent radar'],
    ['src/pages/agent/PickupList.jsx', 'Assigned route queue for Swachhata Sathis with 1-click GPS navigation'],
    ['src/pages/recycler/LotMarketplace.jsx', 'Industrial recycling marketplace for aggregated village waste lots'],
    ['src/utils/gvpConfig.js', 'Gram Vikas Points rules, point matrices, and development project thresholds'],
    ['src/utils/geocoding.js', 'Haversine distance calculation and Nominatim reverse geocoding client'],
    ['capacitor.config.json', 'Capacitor native app configuration with Android scheme and appId metadata']
  ];
  drawTable(fileTableHeaders, fileTableData, fileTableWidths);

  sectionHeading(10, 'Build, Packaging & Deployment Pipeline');
  paragraph(
    'The application build pipeline transforms modern ES modules into an optimized, signed Android APK ready for device deployment:'
  );

  codeBlock('Production Build & Deployment Commands',
`# 1. Compile Web Bundle with Vite
npm run build

# 2. Sync Web Assets to Native Android Project
npx cap sync android

# 3. Assemble Android Debug APK via Gradle & JDK 21
$env:JAVA_HOME="C:\\Users\\manth\\jdk21\\jdk-21.0.6+7"
.\\android\\gradlew.bat -p android assembleDebug

# 4. Streamed Installation to Connected Physical Device via ADB
adb -s <DEVICE_SERIAL> install -r android/app/build/outputs/apk/debug/app-debug.apk

# 5. Launch Application Activity
adb -s <DEVICE_SERIAL> shell am start -n com.avengers.wastetowealth/.MainActivity`
  );
  drawBottomFooter(7);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

generateMasterArchitecturePDF().then(file => {
  console.log('Successfully generated technical architecture PDF at:', file);
}).catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
