import { v4 as uuidv4 } from 'uuid';
import { villages } from './villages';
import { WASTE_CATEGORIES } from '../utils/gvpConfig';

const SEED_VERSION = 'PANHALA_2026_V2';

function ccId() {
  return 'CC-' + Math.random().toString(36).toUpperCase().substring(2, 9);
}

function rndBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function rndInt(min, max) {
  return Math.floor(rndBetween(min, max));
}

function pastDate(daysAgo, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export function seedDemoData() {
  const seeded = localStorage.getItem('avengers_seeded');
  if (seeded === SEED_VERSION) return;

  // ─── USERS ───────────────────────────────────────────────────────────────────
  const users = [
    // Villagers
    { id: 'u_pnh_001', ccId: ccId(), name: 'Sunita Patil', email: 'sunita@panhala.in', phone: '9876543210', role: 'villager', village_id: 'v001', password: 'pass123', avatar: '👩' },
    { id: 'u_pnh_002', ccId: ccId(), name: 'Ramesh Jadhav', email: 'ramesh@panhala.in', phone: '9876543211', role: 'villager', village_id: 'v001', password: 'pass123', avatar: '👨' },
    { id: 'u_pnh_003', ccId: ccId(), name: 'Savita More', email: 'savita@kini.in', phone: '9876543212', role: 'villager', village_id: 'v005', password: 'pass123', avatar: '👩' },
    { id: 'u_pnh_demo_001', ccId: ccId(), name: 'Demo Villager', email: 'demo@villager.in', phone: '9999999001', role: 'villager', village_id: 'v001', password: 'demo', avatar: '🏠' },

    // Agents (Swachhata Sathis)
    { id: 'u_pnh_004', ccId: ccId(), name: 'Vijay Shinde', email: 'vijay@agent.in', phone: '9876543213', role: 'agent', village_id: 'v001', designation: 'Swachhata Sathi', password: 'pass123', avatar: '🧹' },
    { id: 'u_pnh_005', ccId: ccId(), name: 'Priya Kamble', email: 'priya@agent.in', phone: '9876543214', role: 'agent', village_id: 'v002', designation: 'Swachhata Sathi', password: 'pass123', avatar: '🧹' },
    { id: 'u_pnh_demo_002', ccId: ccId(), name: 'Demo Agent', email: 'demo@agent.in', phone: '9999999002', role: 'agent', village_id: 'v001', designation: 'Collection Agent', password: 'demo', avatar: '🚛' },

    // Recyclers
    { id: 'u_pnh_006', ccId: ccId(), name: 'Kolhapur Recyclers Pvt Ltd', email: 'kolhapur@recycler.in', phone: '9876543215', role: 'recycler', village_id: 'v001', designation: 'Industrial Recycler', password: 'pass123', avatar: '🏭' },
    { id: 'u_pnh_demo_003', ccId: ccId(), name: 'Demo Recycler', email: 'demo@recycler.in', phone: '9999999003', role: 'recycler', village_id: 'v001', designation: 'Recycler', password: 'demo', avatar: '♻️' },

    // Admins
    { id: 'u_pnh_007', ccId: ccId(), name: 'Sarpanch Anil Desai', email: 'admin@panhala.gov.in', phone: '9876543216', role: 'admin', village_id: 'v001', designation: 'Gram Panchayat Sarpanch', password: 'pass123', avatar: '🏛️' },
    { id: 'u_pnh_demo_004', ccId: ccId(), name: 'Demo Admin', email: 'demo@admin.in', phone: '9999999004', role: 'admin', village_id: 'v001', designation: 'Administrator', password: 'demo', avatar: '👨‍💼' },
  ];

  // ─── WASTE ENTRIES ──────────────────────────────────────────────────────────
  const entries = [];
  const statuses = ['pending', 'assigned', 'collected', 'verified'];
  const cats = WASTE_CATEGORIES.map(c => c.id);

  for (let i = 0; i < 60; i++) {
    const village = villages[rndInt(0, villages.length)];
    const cat = cats[rndInt(0, cats.length)];
    const weight = parseFloat(rndBetween(0.5, 15).toFixed(1));
    const status = statuses[rndInt(0, statuses.length)];
    const ts = pastDate(rndInt(0, 30), rndInt(0, 23));
    entries.push({
      id: 'we_' + uuidv4().substring(0, 8),
      household_id: ['u_pnh_001', 'u_pnh_002', 'u_pnh_003', 'u_pnh_demo_001'][rndInt(0, 4)],
      agent_id: status !== 'pending' ? 'u_pnh_004' : null,
      category: cat,
      weight_kg: weight,
      status,
      lat: village.lat + rndBetween(-0.005, 0.005),
      lng: village.lng + rndBetween(-0.005, 0.005),
      village_id: village.id,
      timestamp: ts,
      createdAt: ts,
      description: `${weight}kg of ${cat} waste`,
      imageProof: null,
      aiClassification: null,
    });
  }

  // ─── WALLETS ─────────────────────────────────────────────────────────────────
  const wallets = users
    .filter(u => u.role === 'villager')
    .map(u => ({
      id: 'wal_' + u.id,
      household_id: u.id,
      cash_balance: parseFloat(rndBetween(20, 500).toFixed(2)),
      points_balance: rndInt(50, 2000),
      total_points_earned: rndInt(500, 5000),
    }));

  // ─── GVP TRANSACTIONS ─────────────────────────────────────────────────────
  const gvpTransactions = [];
  const gvpCategories = ['collection', 'recycling', 'organic', 'milestone', 'bonus'];
  for (let i = 0; i < 40; i++) {
    const village = villages[rndInt(0, villages.length)];
    gvpTransactions.push({
      id: 'gvp_' + uuidv4().substring(0, 8),
      panchayatId: village.id,
      category: gvpCategories[rndInt(0, gvpCategories.length)],
      points: rndInt(5, 100),
      sourceType: 'waste_entry',
      sourceId: 'we_demo',
      timestamp: pastDate(rndInt(0, 60)),
      createdAt: pastDate(rndInt(0, 60)),
      description: 'GVP awarded for waste collection',
    });
  }

  // ─── MANURE LISTINGS ─────────────────────────────────────────────────────
  const manureListings = [
    {
      id: 'mn_pnh_001', seller_id: 'u_pnh_002',
      manure_type: 'Vermicompost (Gandul Khat)', quantity_kg: 100,
      price_per_kg: 12, points_per_kg: 4,
      description: 'Fresh vermicompost, ready for pickup near Panhala fort area.',
      village_id: 'v001', status: 'available', createdAt: pastDate(3),
    },
    {
      id: 'mn_pnh_002', seller_id: 'u_pnh_003',
      manure_type: 'Cow Dung Compost (Shena Khat)', quantity_kg: 200,
      price_per_kg: 8, points_per_kg: 3,
      description: 'Aged cow dung compost, excellent for sugarcane fields.',
      village_id: 'v005', status: 'available', createdAt: pastDate(1),
    },
    {
      id: 'mn_pnh_003', seller_id: 'u_pnh_001',
      manure_type: 'Kitchen Compost', quantity_kg: 50,
      price_per_kg: 6, points_per_kg: 2,
      description: 'Kitchen compost from household bio-degradable waste.',
      village_id: 'v001', status: 'available', createdAt: pastDate(7),
    },
  ];

  // ─── WASTE LOTS (Recycler Marketplace) ─────────────────────────────────────
  const lots = [];
  const lotCats = ['plastic', 'metal', 'paper', 'ewaste'];
  for (let i = 0; i < 8; i++) {
    const village = villages[rndInt(0, villages.length)];
    const cat = lotCats[rndInt(0, lotCats.length)];
    lots.push({
      id: 'lot_' + uuidv4().substring(0, 8),
      village_id: village.id,
      village_name: village.name,
      category: cat,
      total_weight_kg: rndInt(50, 500),
      price_per_kg: parseFloat(rndBetween(5, 25).toFixed(2)),
      status: ['open', 'open', 'open', 'claimed'][rndInt(0, 4)],
      createdAt: pastDate(rndInt(1, 20)),
      bids: [],
    });
  }

  // ─── DUMP REPORTS ─────────────────────────────────────────────────────────
  const dumpReports = [
    {
      id: 'dr_001', reporter_user_id: 'u_pnh_001',
      lat: 16.8080, lng: 74.1145,
      description: 'Illegal plastic dumping near the fort entrance road.',
      reward_points: 15, status: 'pending',
      createdAt: pastDate(2), timestamp: pastDate(2),
    },
    {
      id: 'dr_002', reporter_user_id: 'u_pnh_002',
      lat: 16.7920, lng: 74.1280,
      description: 'Construction debris dumped on agricultural land.',
      reward_points: 15, status: 'verified',
      createdAt: pastDate(5), timestamp: pastDate(5),
    },
  ];

  // ─── SAVE TO LOCALSTORAGE ─────────────────────────────────────────────────
  localStorage.setItem('avengers_users', JSON.stringify(users));
  localStorage.setItem('avengers_villages', JSON.stringify(villages));
  localStorage.setItem('avengers_waste_entries', JSON.stringify(entries));
  localStorage.setItem('avengers_wallets', JSON.stringify(wallets));
  localStorage.setItem('avengers_wallet_ledger', JSON.stringify([]));
  localStorage.setItem('avengers_gvp_transactions', JSON.stringify(gvpTransactions));
  localStorage.setItem('avengers_manure_listings', JSON.stringify(manureListings));
  localStorage.setItem('avengers_lots', JSON.stringify(lots));
  localStorage.setItem('avengers_dump_reports', JSON.stringify(dumpReports));
  localStorage.setItem('avengers_seeded', SEED_VERSION);

  console.log('[CleanConnect] Demo data seeded successfully:', SEED_VERSION);
}

export function resetDemoData() {
  localStorage.removeItem('avengers_seeded');
  seedDemoData();
}
