import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { WASTE_CATEGORIES, getCategoryConfig } from '../../utils/gvpConfig';
import { Leaf, Camera, MapPin, ShoppingCart, Flag, Wallet, Trophy, ChevronRight, Plus, Clock, CheckCircle, Loader, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with actual key

export default function VillagerDashboard() {
  const { currentUser, logout } = useAuth();
  const { wasteEntries, getWallet, logWaste, manureListings, dumpReports, reportDump, reload } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDumpModal, setShowDumpModal] = useState(false);
  const [logForm, setLogForm] = useState({ category: 'wet', weight_kg: '', description: '', imageBase64: null });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dumpForm, setDumpForm] = useState({ description: '' });

  const wallet = getWallet(currentUser?.id);
  const myEntries = wasteEntries.filter(e => e.household_id === currentUser?.id);
  const pendingCount = myEntries.filter(e => e.status === 'pending').length;
  const collectedCount = myEntries.filter(e => e.status === 'collected' || e.status === 'verified').length;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // AI Waste Classification
  const classifyWithAI = async (base64Image) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze this waste item for rural Indian waste management. Return strictly JSON with keys: detectedWaste, recommendedCategory (wet, dry, plastic, paper, ewaste, hazardous, metal, other), confidence (0-1), instructions.`;
      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]);
      const text = result.response.text().replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      setAiResult(parsed);
      setLogForm(f => ({ ...f, category: parsed.recommendedCategory || f.category }));
    } catch {
      setAiResult({ detectedWaste: 'Analysis failed', confidence: 0, instructions: 'Please select category manually.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setLogForm(f => ({ ...f, imageBase64: base64 }));
      classifyWithAI(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.weight_kg) return;
    setLogLoading(true);
    try {
      const entry = logWaste(currentUser.id, currentUser.village_id, {
        category: logForm.category,
        weight_kg: parseFloat(logForm.weight_kg),
        lat: 16.8065 + (Math.random() - 0.5) * 0.01,
        lng: 74.1130 + (Math.random() - 0.5) * 0.01,
        description: logForm.description,
        imageProof: logForm.imageBase64,
        aiClassification: aiResult,
      });
      const cat = getCategoryConfig(logForm.category);
      showToast(`✅ +${cat.pointsPerKg * logForm.weight_kg} pts & ₹${cat.cashPerKg * logForm.weight_kg} earned!`);
      setShowLogModal(false);
      setLogForm({ category: 'wet', weight_kg: '', description: '', imageBase64: null });
      setAiResult(null);
    } finally {
      setLogLoading(false);
    }
  };

  const handleDumpReport = async (e) => {
    e.preventDefault();
    try {
      navigator.geolocation.getCurrentPosition(pos => {
        reportDump(currentUser.id, { lat: pos.coords.latitude, lng: pos.coords.longitude, description: dumpForm.description });
        showToast('🚨 Dump reported! +15 pts pending verification');
        setShowDumpModal(false);
        setDumpForm({ description: '' });
      }, () => {
        reportDump(currentUser.id, { lat: 16.8065, lng: 74.1130, description: dumpForm.description });
        showToast('🚨 Dump reported!');
        setShowDumpModal(false);
      });
    } catch {}
  };

  const quickActions = [
    { icon: <Plus size={20} />, label: 'Log Waste', color: '#176B28', bg: '#E7F4E6', action: () => setShowLogModal(true) },
    { icon: <MapPin size={20} />, label: 'Track Agent', color: '#1B7A78', bg: '#CCFBF1', action: () => navigate('/villager/map') },
    { icon: <ShoppingCart size={20} />, label: 'Buy Manure', color: '#D9A441', bg: '#FEF9C3', action: () => setActiveTab('manure') },
    { icon: <Flag size={20} />, label: 'Report Dump', color: '#DC2626', bg: '#FEE2E2', action: () => setShowDumpModal(true) },
  ];

  return (
    <div className="app-shell">
      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Top Bar */}
      <header className="topbar topbar-green">
        <div className="topbar-inner">
          <div>
            <div className="topbar-greeting">Namaskar, {currentUser?.name?.split(' ')[0]} 🙏</div>
            <div className="topbar-sub">{currentUser?.ccId} • Villager</div>
          </div>
          <button className="avatar-btn" onClick={logout}>{currentUser?.avatar}</button>
        </div>
      </header>

      {/* Wallet Card */}
      <div className="wallet-card-hero">
        <div className="wallet-card-bg wallet-green" />
        <div className="wallet-card-content">
          <div className="wallet-label">Green Points Balance</div>
          <div className="wallet-pts">{wallet.points_balance?.toLocaleString() || 0} <span className="wallet-pts-unit">pts</span></div>
          <div className="wallet-cash">₹{wallet.cash_balance?.toFixed(2) || '0.00'} cash</div>
          <div className="wallet-badges">
            <div className="wallet-badge"><CheckCircle size={12} /> {collectedCount} Collected</div>
            <div className="wallet-badge"><Clock size={12} /> {pendingCount} Pending</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-wrap">
        <div className="section-title">Quick Actions</div>
        <div className="quick-actions-grid">
          {quickActions.map((a, i) => (
            <button key={i} className="quick-action-btn" onClick={a.action} style={{ background: a.bg }}>
              <div className="qa-icon" style={{ color: a.color }}>{a.icon}</div>
              <div className="qa-label" style={{ color: a.color }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {['home','history','manure'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'tab-active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'home' ? '🏠 Home' : t === 'history' ? '📋 History' : '🌿 Manure'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'home' && (
          <div>
            <div className="section-title">Recent Waste Logs</div>
            {myEntries.slice(-5).reverse().map(entry => {
              const cat = getCategoryConfig(entry.category);
              return (
                <div key={entry.id} className="entry-card">
                  <div className="entry-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                  <div className="entry-info">
                    <div className="entry-label">{cat.label} — {entry.weight_kg}kg</div>
                    <div className="entry-meta">{new Date(entry.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className={`status-badge status-${entry.status}`}>{entry.status}</div>
                </div>
              );
            })}
            {myEntries.length === 0 && <div className="empty-state">No waste logged yet. Tap "Log Waste" to start!</div>}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="section-title">All Waste Logs</div>
            {myEntries.slice().reverse().map(entry => {
              const cat = getCategoryConfig(entry.category);
              return (
                <div key={entry.id} className="entry-card">
                  <div className="entry-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                  <div className="entry-info">
                    <div className="entry-label">{cat.label} — {entry.weight_kg}kg</div>
                    <div className="entry-meta">{new Date(entry.createdAt).toLocaleString('en-IN')}</div>
                    {entry.aiClassification && <div className="ai-note">🤖 AI: {entry.aiClassification.detectedWaste}</div>}
                  </div>
                  <div className={`status-badge status-${entry.status}`}>{entry.status}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'manure' && (
          <div>
            <div className="section-title">Organic Manure Marketplace</div>
            {manureListings.filter(l => l.status === 'available').map(listing => (
              <div key={listing.id} className="manure-card">
                <div className="manure-header">
                  <span className="manure-type">🌿 {listing.manure_type}</span>
                  <span className="manure-price">₹{listing.price_per_kg}/kg</span>
                </div>
                <div className="manure-meta">{listing.quantity_kg}kg available • {listing.points_per_kg} pts/kg</div>
                <div className="manure-desc">{listing.description}</div>
                <div className="manure-actions">
                  <button className="btn-sm btn-green">Buy with Cash</button>
                  <button className="btn-sm btn-outline">Use Points</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => setActiveTab('home')}><span>🏠</span><span>Home</span></button>
        <button className="nav-item" onClick={() => navigate('/villager/map')}><span>🗺️</span><span>Map</span></button>
        <button className="nav-item" onClick={() => setShowLogModal(true)}><span className="nav-add">+</span></button>
        <button className="nav-item" onClick={() => setActiveTab('manure')}><span>🌿</span><span>Manure</span></button>
        <button className="nav-item" onClick={logout}><span>👤</span><span>Logout</span></button>
      </nav>

      {/* Log Waste Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Waste</h3>
              <button className="modal-close" onClick={() => setShowLogModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLogSubmit}>
              {/* Camera capture */}
              <div className="modal-camera-area">
                <label htmlFor="waste-camera" className="camera-label">
                  {logForm.imageBase64
                    ? <img src={`data:image/jpeg;base64,${logForm.imageBase64}`} className="camera-preview" alt="Waste" />
                    : <div className="camera-placeholder"><Camera size={32} color="#176B28" /><span>Tap to capture waste photo</span></div>
                  }
                </label>
                <input id="waste-camera" type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{display:'none'}} />
              </div>

              {/* AI Result */}
              {aiLoading && <div className="ai-loading"><Loader size={16} className="spin" /> Classifying with Gemini AI…</div>}
              {aiResult && (
                <div className="ai-result-card">
                  <div className="ai-result-header"><Sparkles size={14} color="#D9A441" /> AI Analysis</div>
                  <div className="ai-result-item"><b>Detected:</b> {aiResult.detectedWaste}</div>
                  <div className="ai-result-item"><b>Category:</b> {aiResult.recommendedCategory}</div>
                  <div className="ai-result-item"><b>Confidence:</b> {Math.round((aiResult.confidence || 0) * 100)}%</div>
                  <div className="ai-result-item"><b>Tip:</b> {aiResult.instructions}</div>
                </div>
              )}

              <div className="login-field">
                <label>Category</label>
                <select value={logForm.category} onChange={e => setLogForm(f => ({...f, category: e.target.value}))}>
                  {WASTE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="login-field">
                <label>Weight (kg)</label>
                <input type="number" step="0.1" min="0.1" max="100" placeholder="e.g. 2.5" value={logForm.weight_kg} onChange={e => setLogForm(f => ({...f, weight_kg: e.target.value}))} required />
              </div>
              <div className="login-field">
                <label>Description (optional)</label>
                <input type="text" placeholder="e.g. Kitchen organic waste" value={logForm.description} onChange={e => setLogForm(f => ({...f, description: e.target.value}))} />
              </div>

              {logForm.weight_kg && (
                <div className="earn-preview">
                  💰 You'll earn: <b>{getCategoryConfig(logForm.category).pointsPerKg * logForm.weight_kg} pts</b> + <b>₹{getCategoryConfig(logForm.category).cashPerKg * logForm.weight_kg}</b>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={logLoading}>
                {logLoading ? 'Logging…' : 'Submit Waste Log'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Dump Modal */}
      {showDumpModal && (
        <div className="modal-overlay" onClick={() => setShowDumpModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚨 Report Illegal Dump</h3>
              <button className="modal-close" onClick={() => setShowDumpModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDumpReport}>
              <div className="login-field">
                <label>Description</label>
                <textarea rows={4} placeholder="Describe the dump location and waste type…" value={dumpForm.description} onChange={e => setDumpForm({description: e.target.value})} required style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid #E5E7EB'}} />
              </div>
              <div className="earn-preview">📍 Your GPS location will be captured. Earn +15 pts on verification.</div>
              <button type="submit" className="btn-danger">Submit Report</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
