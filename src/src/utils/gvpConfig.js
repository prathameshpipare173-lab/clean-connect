// Gram Vikas Points (GVP) rules, point matrices, and thresholds
export const GVP_ACTIONS = {
  WASTE_PICKUP:        { points: 20,   label: 'Waste Pickup Completed',         category: 'collection' },
  PICKUP_BONUS:        { points: 10,   label: 'On-Time Pickup (< 4hrs)',         category: 'collection' },
  RECYCLER_TRANSFER:   { points: 2,    label: 'Recycler Bulk Transfer (per kg)', category: 'recycling',  perKg: true },
  ORGANIC_COMPOST:     { points: 1.5,  label: 'Organic Farm Composting (per kg)',category: 'organic',    perKg: true },
  SEGREGATION:         { points: 50,   label: 'Segregation Milestone >85%',      category: 'milestone' },
  PARTICIPATION:       { points: 30,   label: 'Participation Milestone',         category: 'milestone' },
  ENVIRONMENT_BONUS:   { points: 100,  label: 'Environment Bonus Drive',         category: 'bonus' },
  PENALTY_LATE:        { points: -10,  label: 'Delayed Pickup (>24h)',           category: 'penalty' },
  DUMP_REPORT:         { points: 15,   label: 'Illegal Dump Reported',           category: 'community' },
  DUMP_VERIFIED:       { points: 25,   label: 'Dump Report Verified',            category: 'community' },
};

export const GVP_PROJECTS = [
  { id: 'p001', name: 'Solar Street Lights',  cost: 5000,  category: 'infrastructure', icon: '💡' },
  { id: 'p002', name: 'Village Road Repair',   cost: 8000,  category: 'infrastructure', icon: '🛣️' },
  { id: 'p003', name: 'Community Garden',      cost: 3000,  category: 'environment',    icon: '🌿' },
  { id: 'p004', name: 'Water Tank Cleaning',   cost: 2000,  category: 'sanitation',     icon: '💧' },
  { id: 'p005', name: 'School Renovation',     cost: 10000, category: 'education',      icon: '🏫' },
  { id: 'p006', name: 'Waste Composting Unit', cost: 4500,  category: 'environment',    icon: '♻️' },
];

export const WASTE_CATEGORIES = [
  { id: 'wet',       label: 'Wet / Organic',  color: '#166534', bg: '#DCFCE7', icon: '🌿', pointsPerKg: 3,  cashPerKg: 2   },
  { id: 'dry',       label: 'Dry Waste',      color: '#92400E', bg: '#FEF9C3', icon: '📦', pointsPerKg: 5,  cashPerKg: 3   },
  { id: 'plastic',   label: 'Plastic',        color: '#1D4ED8', bg: '#DBEAFE', icon: '♻️', pointsPerKg: 8,  cashPerKg: 5   },
  { id: 'paper',     label: 'Paper',          color: '#7C3AED', bg: '#EDE9FE', icon: '📰', pointsPerKg: 4,  cashPerKg: 2.5 },
  { id: 'metal',     label: 'Metal/Scrap',    color: '#374151', bg: '#F3F4F6', icon: '🔩', pointsPerKg: 15, cashPerKg: 12  },
  { id: 'ewaste',    label: 'E-Waste',        color: '#DC2626', bg: '#FEE2E2', icon: '📱', pointsPerKg: 20, cashPerKg: 15  },
  { id: 'hazardous', label: 'Hazardous',      color: '#B45309', bg: '#FFEDD5', icon: '⚠️', pointsPerKg: 25, cashPerKg: 0   },
  { id: 'other',     label: 'Other',          color: '#6B7280', bg: '#F9FAFB', icon: '🗑️', pointsPerKg: 2,  cashPerKg: 1   },
];

export const getCategoryConfig = (catId) => WASTE_CATEGORIES.find(c => c.id === catId) || WASTE_CATEGORIES[7];
