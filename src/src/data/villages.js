// Master database of 10 Panhala Taluka service areas with canonical GPS coordinates
export const villages = [
  { id: 'v001', name: 'Panhala', marathi_name: 'पन्हाळा', taluka: 'Panhala', lat: 16.8065, lng: 74.1130, gvp_score: 4820, tier: 'gold', population: 8500, households: 1800 },
  { id: 'v002', name: 'Kolkewadi', marathi_name: 'कोळकेवाडी', taluka: 'Panhala', lat: 16.7900, lng: 74.1250, gvp_score: 3210, tier: 'silver', population: 3200, households: 680 },
  { id: 'v003', name: 'Padali', marathi_name: 'पाडळी', taluka: 'Panhala', lat: 16.8200, lng: 74.0950, gvp_score: 2890, tier: 'silver', population: 2900, households: 580 },
  { id: 'v004', name: 'Nandani', marathi_name: 'नांदणी', taluka: 'Panhala', lat: 16.8350, lng: 74.1400, gvp_score: 1750, tier: 'bronze', population: 1800, households: 360 },
  { id: 'v005', name: 'Kini', marathi_name: 'किणी', taluka: 'Panhala', lat: 16.7750, lng: 74.0800, gvp_score: 1420, tier: 'bronze', population: 1600, households: 320 },
  { id: 'v006', name: 'Masuti', marathi_name: 'मासुती', taluka: 'Panhala', lat: 16.8450, lng: 74.0700, gvp_score: 980, tier: 'bronze', population: 1100, households: 220 },
  { id: 'v007', name: 'Yelur', marathi_name: 'येळूर', taluka: 'Panhala', lat: 16.7600, lng: 74.1500, gvp_score: 780, tier: 'entry', population: 950, households: 190 },
  { id: 'v008', name: 'Bhuye', marathi_name: 'भुये', taluka: 'Panhala', lat: 16.8600, lng: 74.1200, gvp_score: 620, tier: 'entry', population: 850, households: 170 },
  { id: 'v009', name: 'Wadi', marathi_name: 'वाडी', taluka: 'Panhala', lat: 16.7450, lng: 74.0950, gvp_score: 490, tier: 'entry', population: 720, households: 144 },
  { id: 'v010', name: 'Shiroli', marathi_name: 'शिरोळी', taluka: 'Panhala', lat: 16.8750, lng: 74.1050, gvp_score: 310, tier: 'entry', population: 560, households: 112 },
];

export const getVillageById = (id) => villages.find(v => v.id === id);
export const getVillageByName = (name) => villages.find(v => v.name === name);

export const tierConfig = {
  gold:   { label: 'Gold',   color: '#D9A441', bg: '#FEF3C7', minGVP: 4000, icon: '🏆' },
  silver: { label: 'Silver', color: '#6B7280', bg: '#F3F4F6', minGVP: 2000, icon: '🥈' },
  bronze: { label: 'Bronze', color: '#92400E', bg: '#FEF3C7', minGVP: 1000, icon: '🥉' },
  entry:  { label: 'Entry',  color: '#176B28', bg: '#E7F4E6', minGVP: 0,    icon: '🌱' },
};
