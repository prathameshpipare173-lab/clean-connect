import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getCategoryConfig } from '../../utils/gvpConfig';
import { getVillageById } from '../../data/villages';
import { TrendingUp, Package, Award, Gavel } from 'lucide-react';

export default function RecyclerDashboard() {
  const { currentUser, logout } = useAuth();
  const { lots, bidOnLot, reload } = useData();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [bidModal, setBidModal] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openLots = lots.filter(l => l.status === 'open');
  const myBids = lots.filter(l => l.bids?.some(b => b.bidderId === currentUser?.id));

  const filteredLots = filter === 'all' ? openLots : openLots.filter(l => l.category === filter);

  const handleBid = () => {
    if (!bidPrice || parseFloat(bidPrice) <= 0) { showToast('Enter a valid bid price', 'error'); return; }
    try {
      bidOnLot(bidModal.id, currentUser.id, parseFloat(bidPrice));
      showToast(`✅ Bid of ₹${bidPrice}/kg placed on ${bidModal.category} lot!`);
      setBidModal(null);
      setBidPrice('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const totalVolume = openLots.reduce((s, l) => s + l.total_weight_kg, 0);
  const avgPrice = openLots.length > 0 ? (openLots.reduce((s, l) => s + l.price_per_kg, 0) / openLots.length).toFixed(2) : '0';

  return (
    <div className="app-shell">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <header className="topbar topbar-blue">
        <div className="topbar-inner">
          <div>
            <div className="topbar-greeting">🏭 {currentUser?.name?.split(' ')[0]}</div>
            <div className="topbar-sub">{currentUser?.designation || 'Industrial Recycler'}</div>
          </div>
          <button className="avatar-btn" onClick={logout}>{currentUser?.avatar}</button>
        </div>
      </header>

      {/* Market Summary */}
      <div className="recycler-summary">
        <div className="recycler-kpi">
          <Package size={18} color="#1D4ED8" />
          <div><div className="kpi-num-sm">{openLots.length}</div><div className="kpi-lbl-sm">Open Lots</div></div>
        </div>
        <div className="recycler-kpi">
          <TrendingUp size={18} color="#166534" />
          <div><div className="kpi-num-sm">{totalVolume.toLocaleString()}kg</div><div className="kpi-lbl-sm">Total Volume</div></div>
        </div>
        <div className="recycler-kpi">
          <Award size={18} color="#D9A441" />
          <div><div className="kpi-num-sm">₹{avgPrice}</div><div className="kpi-lbl-sm">Avg Price/kg</div></div>
        </div>
        <div className="recycler-kpi">
          <Gavel size={18} color="#7C3AED" />
          <div><div className="kpi-num-sm">{myBids.length}</div><div className="kpi-lbl-sm">My Bids</div></div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-chips">
        {['all','plastic','metal','paper','ewaste'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'chip-active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? '🔍 All' : getCategoryConfig(f).icon + ' ' + f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn ${activeTab === 'marketplace' ? 'tab-active' : ''}`} onClick={() => setActiveTab('marketplace')}>📦 Marketplace</button>
        <button className={`tab-btn ${activeTab === 'mybids' ? 'tab-active' : ''}`} onClick={() => setActiveTab('mybids')}>🏷️ My Bids</button>
      </div>

      <div className="tab-content">
        {activeTab === 'marketplace' && (
          <div>
            {filteredLots.length === 0 && <div className="empty-state">No lots available in this category.</div>}
            {filteredLots.map(lot => {
              const cat = getCategoryConfig(lot.category);
              const village = getVillageById(lot.village_id);
              const myBid = lot.bids?.find(b => b.bidderId === currentUser?.id);
              const topBid = lot.bids?.length > 0 ? Math.max(...lot.bids.map(b => b.bidPerKg)) : null;
              return (
                <div key={lot.id} className="lot-card">
                  <div className="lot-header">
                    <div className="lot-cat-badge" style={{ background: cat.bg, color: cat.color }}>
                      {cat.icon} {cat.label}
                    </div>
                    <div className="lot-status open">OPEN</div>
                  </div>
                  <div className="lot-body">
                    <div className="lot-weight">{lot.total_weight_kg.toLocaleString()} kg</div>
                    <div className="lot-village">📍 {village?.name || lot.village_name}</div>
                    <div className="lot-price-row">
                      <span className="lot-base">Base: ₹{lot.price_per_kg}/kg</span>
                      {topBid && <span className="lot-top-bid">Top bid: ₹{topBid}/kg</span>}
                      {myBid && <span className="lot-my-bid">My bid: ₹{myBid.bidPerKg}/kg</span>}
                    </div>
                    <div className="lot-total">Total value: ~₹{(lot.total_weight_kg * lot.price_per_kg).toLocaleString()}</div>
                  </div>
                  <button className="btn-primary lot-bid-btn" onClick={() => { setBidModal(lot); setBidPrice(''); }}>
                    <Gavel size={14} /> Place Bid
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'mybids' && (
          <div>
            {myBids.length === 0 && <div className="empty-state">No bids placed yet.</div>}
            {myBids.map(lot => {
              const cat = getCategoryConfig(lot.category);
              const myBid = lot.bids?.find(b => b.bidderId === currentUser?.id);
              return (
                <div key={lot.id} className="entry-card">
                  <div className="entry-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                  <div className="entry-info">
                    <div className="entry-label">{cat.label} • {lot.total_weight_kg}kg</div>
                    <div className="entry-meta">Your bid: ₹{myBid?.bidPerKg}/kg • {lot.status}</div>
                  </div>
                  <div className={`status-badge status-${lot.status}`}>{lot.status}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <button className="nav-item active"><span>🏠</span><span>Home</span></button>
        <button className="nav-item" onClick={() => setActiveTab('marketplace')}><span>📦</span><span>Lots</span></button>
        <button className="nav-item" onClick={() => setActiveTab('mybids')}><span>🏷️</span><span>My Bids</span></button>
        <button className="nav-item" onClick={logout}><span>👤</span><span>Logout</span></button>
      </nav>

      {/* Bid Modal */}
      {bidModal && (
        <div className="modal-overlay" onClick={() => setBidModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Place Bid — {bidModal.category} {bidModal.total_weight_kg}kg</h3>
              <button className="modal-close" onClick={() => setBidModal(null)}>✕</button>
            </div>
            <div className="login-field">
              <label>Your Bid (₹ per kg)</label>
              <input type="number" step="0.5" min={bidModal.price_per_kg} placeholder={`Min ₹${bidModal.price_per_kg}`} value={bidPrice} onChange={e => setBidPrice(e.target.value)} />
            </div>
            {bidPrice && <div className="earn-preview">Total offer: ₹{(bidModal.total_weight_kg * parseFloat(bidPrice || 0)).toLocaleString()}</div>}
            <button className="btn-primary" onClick={handleBid}>Submit Bid</button>
          </div>
        </div>
      )}
    </div>
  );
}
