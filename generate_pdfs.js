import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Helper to add header/footer on pages
function addPageDecoration(doc, title) {
  // We can listen to pageAdded events to draw header/footer
  let pageCount = 0;
  doc.on('pageAdded', () => {
    pageCount++;
    // Header
    doc.save();
    doc.fillColor('#154212');
    doc.rect(0, 0, doc.page.width, 25).fill();
    doc.fillColor('#ffffff').fontSize(8).text(title, 20, 8);
    
    // Footer
    doc.fillColor('#f3f3f6');
    doc.rect(0, doc.page.height - 25, doc.page.width, 25).fill();
    doc.fillColor('#42493e').fontSize(8).text(`Page ${pageCount}`, doc.page.width - 60, doc.page.height - 18, { align: 'right', width: 40 });
    doc.restore();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERATE TECHNICAL OVERVIEW PDF
// ─────────────────────────────────────────────────────────────────────────────
async function generateTechnicalOverview() {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  const writeStream = fs.createWriteStream('technical_overview.pdf');
  doc.pipe(writeStream);

  // Cover Page
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#154212');
  doc.fillColor('#ffffff');
  doc.fontSize(36).font('Helvetica-Bold').text('Clean Connect', 50, 180, { align: 'center' });
  doc.fontSize(18).font('Helvetica').text('Village Waste-to-Wealth Platform', 50, 230, { align: 'center' });
  doc.fontSize(22).font('Helvetica-Bold').text('Technical Architecture & Specifications', 50, 270, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Generated on: ' + new Date().toLocaleDateString(), 50, doc.page.height - 100, { align: 'center' });
  
  doc.addPage();

  // Document Title
  doc.fillColor('#1a1c1e').fontSize(22).font('Helvetica-Bold').text('1. Executive Technical Summary', 50, 50);
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').fillColor('#42493e').text(
    'Clean Connect is a local-first mobile application built for rural environments to facilitate waste management and incentive collection (Green Points). The application uses modern web standard technologies wrapped as a native application for Android using Capacitor to enable hardware access (camera and geolocation) while retaining highly flexible, offline-first performance.'
  );
  doc.moveDown(2);

  doc.fillColor('#1a1c1e').fontSize(16).font('Helvetica-Bold').text('2. Language Stack');
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').fillColor('#42493e').text(
    'The stack is structured to guarantee lightweight runtime on low-resource mobile screens:\n\n' +
    '• Frontend Web UI: JavaScript (ES6+), React 18, HTML5, CSS3, Tailwind CSS (Design Tokens configured for Material Design 3).\n' +
    '• Native Wrapper Bridge: `@capacitor/core` and `@capacitor/android` for wrapping standard web bundles into JVM WebViews and routing JavaScript bridges to Android Java APIs.\n' +
    '• Native Build System: Gradle build configuration files (Groovy/Kotlin script) compiling Android Java dependencies.\n' +
    '• Native Device Layer: Java runtime classes inside the Android framework package (e.g. MainActivity.java).'
  );
  doc.moveDown(2);

  doc.fillColor('#1a1c1e').fontSize(16).font('Helvetica-Bold').text('3. Backend Architecture & Persistence');
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').fillColor('#42493e').text(
    'To guarantee reliability under poor connectivity (e.g. USB tethering, lack of rural cell networks), Clean Connect uses an Offline-First architectural pattern:\n\n' +
    '• Primary Database: LocalStorage database. All CRUD operations (users, waste entry logs, wallets, redemptions) execute instantly locally.\n' +
    '• Offline Queue API (`offlineQueue.js`): Intercepts failures, serializes actions into an persistent operations list, and schedules automated background retry attempts.\n' +
    '• State Management: Context APIs (AuthContext, DataContext) providing global reactive bindings to React page hierarchies.'
  );
  doc.moveDown(2);

  doc.fillColor('#1a1c1e').fontSize(16).font('Helvetica-Bold').text('4. APIs Utilized');
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').fillColor('#42493e').text(
    '• Geolocation API (HTML5 Navigator Geolocation): Accessed via browser geolocation hook (`useGeolocation.js`) requesting GPS latitude/longitude.\n' +
    '• Camera Capture API: Standard browser file capture triggers (`input capture="environment"`) mapped to native Android camera subsystem for capturing image proofs.\n' +
    '• Navigation Routing API: React Router DOM (`useNavigate`, `useParams`, `useLocation`) for state-preserving transitions between screens.\n' +
    '• Web Storage API: Browser `localStorage` for offline persistence.'
  );

  // Draw some page borders or page numbers before closing
  const pages = doc.bufferedPageRange();
  for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);
    // Add border accent
    doc.save();
    doc.strokeColor('#154212').lineWidth(3).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    doc.fillColor('#154212').fontSize(8).text('Clean Connect Technical Documentation', 30, doc.page.height - 35);
    doc.text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 35, { align: 'right', width: 70 });
    doc.restore();
  }

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GENERATE SOURCE CODE DOCUMENTATION PDF
// ─────────────────────────────────────────────────────────────────────────────
async function generateSourceCodeDocumentation() {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  const writeStream = fs.createWriteStream('source_code_documentation.pdf');
  doc.pipe(writeStream);

  // Cover Page
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#2d5a27');
  doc.fillColor('#ffffff');
  doc.fontSize(32).font('Helvetica-Bold').text('Clean Connect', 50, 180, { align: 'center' });
  doc.fontSize(16).font('Helvetica').text('Complete Codebase & UI Component Inventory', 50, 230, { align: 'center' });
  doc.fontSize(20).font('Helvetica-Bold').text('Source Code Documentation', 50, 270, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Generated on: ' + new Date().toLocaleDateString(), 50, doc.page.height - 100, { align: 'center' });

  // List of files to document
  const filesToRead = [
    {
      filepath: 'index.html',
      name: 'index.html',
      description: 'Root page template. Loads fonts (Plus Jakarta Sans, Inter), sets up viewport, and points to the main React injection root.'
    },
    {
      filepath: 'tailwind.config.js',
      name: 'tailwind.config.js',
      description: 'Tailwind CSS compiler properties. Configures the custom MD3 tokens (primary #154212, fonts, spacing, shadows) for CSS injection.'
    },
    {
      filepath: 'src/components/navigation/VillagerBottomNav.jsx',
      name: 'VillagerBottomNav.jsx',
      description: 'Bottom navigation bar. Features 5-position layout with a central elevated Add button, active bar indicator, and support trigger modal.'
    },
    {
      filepath: 'src/pages/villager/VillagerDashboard.jsx',
      name: 'VillagerDashboard.jsx',
      description: 'Main home screen dashboard for villagers. Visualizes current level, waste contribution details, ranking leaderboard, and weekly Recharts analytics.'
    },
    {
      filepath: 'src/pages/villager/WasteSelection.jsx',
      name: 'WasteSelection.jsx',
      description: 'Log waste page category selection screen. Lists 8 waste types with rates and provides access to the simulated AI scanner component.'
    },
    {
      filepath: 'src/pages/villager/WasteDetails.jsx',
      name: 'WasteDetails.jsx',
      description: 'Details form page for saving waste weight, capturing photographic proof, and capturing GPS geo-coordinates before submission.'
    },
    {
      filepath: 'src/pages/villager/RedeemStore.jsx',
      name: 'RedeemStore.jsx',
      description: 'Rewards marketplace catalog interface. Lists categories of farming tools and offers, validates wallet credit balance, and executes point redeems.'
    },
    {
      filepath: 'src/pages/villager/EditProfile.jsx',
      name: 'EditProfile.jsx',
      description: 'Villager profile editor. Allows modifying user display name, profile photo capture, and application language (English, Marathi, Hindi).'
    },
    {
      filepath: 'src/contexts/AuthContext.jsx',
      name: 'AuthContext.jsx',
      description: 'Security Context. Manages user registration, session local storage logs, profiles updates, and user logouts.'
    },
    {
      filepath: 'src/contexts/DataContext.jsx',
      name: 'DataContext.jsx',
      description: 'Data Context. Coordinates household entries, waste logs creation, offline queue syncs, and points wallet balances.'
    }
  ];

  for (const f of filesToRead) {
    doc.addPage();
    
    // File section header
    doc.fillColor('#1a1c1e').fontSize(18).font('Helvetica-Bold').text(`File: ${f.name}`, 50, 50);
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#42493e').text(f.description);
    doc.moveDown();
    
    // Read the file code
    let code = '';
    try {
      code = fs.readFileSync(f.filepath, 'utf8');
    } catch (e) {
      code = `// Could not read file at ${f.filepath}: ${e.message}`;
    }
    
    // Render code block with auto-page wrap
    doc.font('Courier').fontSize(7.5).fillColor('#1a1c1e').text(code, {
      width: doc.page.width - 100,
      columns: 1,
      lineGap: 1
    });
  }

  // Draw some page borders or page numbers before closing
  const pages = doc.bufferedPageRange();
  for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.save();
    doc.strokeColor('#2d5a27').lineWidth(2).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    doc.fillColor('#2d5a27').font('Helvetica').fontSize(8).text('Clean Connect Codebase Index', 30, doc.page.height - 35);
    doc.text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 35, { align: 'right', width: 70 });
    doc.restore();
  }

  doc.end();
  return new Promise((resolve) => writeStream.on('finish', resolve));
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE GENERATION
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Generating Technical Overview PDF...');
  await generateTechnicalOverview();
  console.log('Technical Overview PDF generated successfully!');

  console.log('Generating Source Code Documentation PDF...');
  await generateSourceCodeDocumentation();
  console.log('Source Code Documentation PDF generated successfully!');
}

run().catch(console.error);
