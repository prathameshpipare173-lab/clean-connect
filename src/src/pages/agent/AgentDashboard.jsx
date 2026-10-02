import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getCategoryConfig } from '../../utils/gvpConfig';
import { villages, getVillageById } from '../../data/villages';
import { Navigation, CheckCircle, Camera, Clock, MapPin, Loader } from 'lucide-react';

export default function AgentDashboard() {
  const { currentUser, logout } = useAuth();
  const { wasteEntries, collectWaste, reload } = useData();
  const [activeTab, setActiveTab] = useState('queue');
  const [toast, setToast] = useState(null);
  const [collectingId, setCollectingId] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Queue: pending/assigned entries in agent's village
  const agentVillage = currentUser?.village_id;
  const queue = wasteEntries
    .filter(e => ['pending', 'assigned'].includes(e.status) && e.village_id === agentVillage)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const myCollected = wasteEntries.filter(e => e.agent_id === currentUser?.id && e.status === 'collected');

  const hoursAgo = (ts) => ((Date.now() - new Date(ts)) / 3600000).toFixed(1);

  const handleNavigate = (entry) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const url = `https://www.google.com/maps/dir/${lat},${lng}/${entry.lat},${entry.lng}`;
        window.open(url, '_blank');
      }, () => {
        const url = `https://www.google.com/maps/dir//${entry.lat},${entry.lng}`;
        window.open(url, '_blank');
      });
    }
  };

  const handleCollect = async (entry) => {
    setCollectingId(entry.id);
    try {
      collectWaste(entry.id, currentUser.id);
      showToast(`✅ Pickup confirmed! GVP awarded to ${getVillageById(entry.village_id)?.name}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCollectingId(null);
      setSelectedEntry(null);
    }
  };

  const getUrgency = (ts) => {
    const h = parseFloat(hoursAgo(ts));
    if (h < 4) return { label: 'Fresh', color: '#166534', bg: '#DCFCE7' };
    if (h < 24) return { label: 'Normal', color: '#92400E', bg: '#FEF9C3' };
    return { label: 'URGENT', color: '#991B1B', bg: '#FEE2E2' };
  };

  return (
    <div className="app-shell">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <header className="topbar topbar-teal">
        <div className="topbar-inner">
          <div>
            <div className="topbar-greeting">🧹 {currentUser?.name?.split(' ')[0]}</div>
            <div className="topbar-sub">{currentUser?.designation || 'Swachhata Sathi'}</div>
          </div>
          <div className="agent-stat-badges">
            <div className="agent-stat"><span className="agent-num">{queue.length}</span><span className="agent-lbl">Queue</span></div>
            <div className="agent-stat"><span className="agent-num">{myCollected.length}</span><span className="agent-lbl">Done</span></div>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="agent-stats-row">
        <div className="agent-kpi-card kpi-blue">
          <div className="kpi-num">{queue.length}</div>
          <div className="kpi-label">Pending Pickups</div>
        </div>
        <div className="agent-kpi-card kpi-green">
          <div className="kpi-num">{myCollected.length}</div>
          <div className="kpi-label">Collected Today</div>
        </div>
        <div className="agent-kpi-card kpi-red">
          <div className="kpi-num">{queue.filter(e => parseFloat(hoursAgo(e.createdAt)) > 24).length}</div>
          <div className="kpi-label">Overdue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        <button className={`tab-btn ${activeTab === 'queue' ? 'tab-active' : ''}`} onClick={() => setActiveTab('queue')}>📋 Pickup Queue</button>
        <button className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>✅ Completed</button>
      </div>

      <div className="tab-content">
        {activeTab === 'queue' && (
          <div>
            {queue.length === 0 && <div className="empty-state">🎉 All pickups complete! Great work.</div>}
            {queue.map(entry => {
              const cat = getCategoryConfig(entry.category);
              const urgency = getUrgency(entry.createdAt);
              return (
                <div key={entry.id} className="pickup-card" onClick={() => setSelectedEntry(entry)}>
                  <div className="pickup-card-header">
                    <div className="pickup-cat-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                    <div className="pickup-info">
                      <div className="pickup-title">{cat.label} • {entry.weight_kg}kg</div>
                      <div className="pickup-meta">{hoursAgo(entry.createdAt)}h ago • {entry.lat?.toFixed(4)}, {entry.lng?.toFixed(4)}</div>
                      <div className="pickup-desc">{entry.description || 'No description'}</div>
                    </div>
                    <div className="urgency-badge" style={{ background: urgency.bg, color: urgency.color }}>{urgency.label}</div>
                  </div>
                  <div className="pickup-actions">
                    <button className="pickup-nav-btn" onClick={(e) => { e.stopPropagation(); handleNavigate(entry); }}>
                      <Navigation size={14} /> Navigate
                    </button>
                    <button className="pickup-collect-btn" onClick={(e) => { e.stopPropagation(); handleCollect(entry); }} disabled={collectingId === entry.id}>
                      {collectingId === entry.id ? <Loader size={14} className="spin" /> : <CheckCircle size={14} />} Mark Collected
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="section-title">My Collections</div>
            {myCollected.length === 0 && <div className="empty-state">No completed pickups yet.</div>}
            {myCollected.slice().reverse().map(entry => {
              const cat = getCategoryConfig(entry.category);
              return (
                <div key={entry.id} className="entry-card">
                  <div className="entry-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                  <div className="entry-info">
                    <div className="entry-label">{cat.label} • {entry.weight_kg}kg</div>
                    <div className="entry-meta">{entry.collectedAt ? new Date(entry.collectedAt).toLocaleString('en-IN') : 'N/A'}</div>
                  </div>
                  <CheckCircle size={18} color="#176B28" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <button className="nav-item active"><span>🏠</span><span>Home</span></button>
        <button className="nav-item" onClick={() => setActiveTab('queue')}><span>📋</span><span>Queue</span></button>
        <button className="nav-item" onClick={() => setActiveTab('history')}><span>✅</span><span>Done</span></button>
        <button className="nav-item" onClick={logout}><span>👤</span><span>Logout</span></button>
      </nav>
    </div>
  );
}
