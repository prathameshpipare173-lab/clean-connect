import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { villages, tierConfig } from '../../data/villages';
import { GVP_PROJECTS, WASTE_CATEGORIES, getCategoryConfig } from '../../utils/gvpConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, Users, Recycle, TrendingUp, Award, MapPin } from 'lucide-react';

export default function PanchayatDashboard() {
  const { currentUser, logout } = useAuth();
  const { wasteEntries, gvpTransactions, dumpReports } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics
  const totalEntries = wasteEntries.length;
  const totalWeight = wasteEntries.reduce((s, e) => s + (e.weight_kg || 0), 0);
  const totalGVP = gvpTransactions.reduce((s, t) => s + (t.points || 0), 0);
  const collectedCount = wasteEntries.filter(e => e.status === 'collected' || e.status === 'verified').length;
  const compliance = totalEntries > 0 ? ((collectedCount / totalEntries) * 100).toFixed(0) : 0;

  // Village GVP scores from live state
  const villageData = villages.map(v => {
    const vGVP = gvpTransactions.filter(t => t.panchayatId === v.id).reduce((s, t) => s + t.points, 0);
    return { ...v, liveGVP: v.gvp_score + vGVP };
  }).sort((a, b) => b.liveGVP - a.liveGVP);

  // Category breakdown for Pie
  const catData = WASTE_CATEGORIES.map(cat => ({
    name: cat.label,
    value: wasteEntries.filter(e => e.category === cat.id).reduce((s, e) => s + e.weight_kg, 0),
    color: cat.color,
    fill: cat.color,
  })).filter(c => c.value > 0);

  // Weekly trend (last 7 days)
  const trendData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const count = wasteEntries.filter(e => {
      const ed = new Date(e.createdAt);
      return ed.toDateString() === d.toDateString();
    }).length;
    return { day: dayStr, entries: count };
  });

  // GVP category breakdown
  const gvpByCategory = {};
  gvpTransactions.forEach(t => {
    gvpByCategory[t.category] = (gvpByCategory[t.category] || 0) + t.points;
  });
  const gvpCatData = Object.entries(gvpByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="app-shell">
      <header className="topbar topbar-purple">
        <div className="topbar-inner">
          <div>
            <div className="topbar-greeting">🏛️ {currentUser?.name?.split(' ')[0]}</div>
            <div className="topbar-sub">{currentUser?.designation || 'Gram Panchayat Admin'}</div>
          </div>
          <button className="avatar-btn" onClick={logout}>{currentUser?.avatar}</button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card admin-kpi-purple">
          <Activity size={20} color="#7C3AED" />
          <div className="kpi-val">{totalEntries}</div>
          <div className="kpi-lbl">Total Waste Logs</div>
        </div>
        <div className="admin-kpi-card admin-kpi-green">
          <Recycle size={20} color="#166534" />
          <div className="kpi-val">{totalWeight.toFixed(1)}kg</div>
          <div className="kpi-lbl">Waste Collected</div>
        </div>
        <div className="admin-kpi-card admin-kpi-gold">
          <Award size={20} color="#D9A441" />
          <div className="kpi-val">{totalGVP.toLocaleString()}</div>
          <div className="kpi-lbl">GVP Points</div>
        </div>
        <div className="admin-kpi-card admin-kpi-blue">
          <TrendingUp size={20} color="#1D4ED8" />
          <div className="kpi-val">{compliance}%</div>
          <div className="kpi-lbl">Compliance Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar tabs-scroll">
        {['overview','villages','gvp','reports'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'tab-active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'villages' ? '🏘️ Villages' : t === 'gvp' ? '🏆 GVP' : '🚨 Reports'}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {/* Weekly Trend */}
            <div className="chart-card">
              <div className="chart-title">Daily Waste Logs (Last 7 Days)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="entries" fill="#176B28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="chart-card">
              <div className="chart-title">Waste by Category (kg)</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(1)}`} labelLine={false}>
                    {catData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(1)}kg`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent activity */}
            <div className="chart-card">
              <div className="chart-title">Recent Waste Entries</div>
              {wasteEntries.slice(-5).reverse().map(entry => {
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
            </div>
          </div>
        )}

        {activeTab === 'villages' && (
          <div>
            <div className="section-title">Village Rankings</div>
            {villageData.map((v, idx) => {
              const tier = tierConfig[v.tier];
              return (
                <div key={v.id} className="village-rank-card">
                  <div className="rank-num">#{idx + 1}</div>
                  <div className="village-rank-info">
                    <div className="village-rank-name">{v.name} <span className="marathi-name">{v.marathi_name}</span></div>
                    <div className="village-rank-meta">{v.households} households • {tier.label} tier</div>
                    <div className="gvp-bar-wrap">
                      <div className="gvp-bar" style={{ width: `${Math.min(100, (v.liveGVP / 6000) * 100)}%`, background: tier.color }} />
                    </div>
                  </div>
                  <div className="village-gvp-score">
                    <div className="gvp-pts">{v.liveGVP.toLocaleString()}</div>
                    <div className="gvp-lbl">GVP</div>
                    <div className="tier-icon">{tier.icon}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'gvp' && (
          <div>
            <div className="section-title">GVP Distribution by Category</div>
            <div className="chart-card">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={gvpCatData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#D9A441" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="section-title">Gram Vikas Projects</div>
            {GVP_PROJECTS.map(proj => (
              <div key={proj.id} className="project-card">
                <div className="project-icon">{proj.icon}</div>
                <div className="project-info">
                  <div className="project-name">{proj.name}</div>
                  <div className="project-meta">{proj.category} • {proj.cost.toLocaleString()} GVP required</div>
                  <div className="project-progress-wrap">
                    <div className="project-progress" style={{ width: `${Math.min(100, (totalGVP / proj.cost) * 100)}%` }} />
                  </div>
                  <div className="project-progress-label">{Math.min(100, ((totalGVP / proj.cost) * 100).toFixed(0))}% funded</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="section-title">Illegal Dump Reports</div>
            {dumpReports.length === 0 && <div className="empty-state">No reports filed.</div>}
            {dumpReports.map(report => (
              <div key={report.id} className="dump-report-card">
                <div className="dump-icon">🚨</div>
                <div className="dump-info">
                  <div className="dump-desc">{report.description}</div>
                  <div className="dump-meta">📍 {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)} • {new Date(report.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className={`status-badge status-${report.status}`}>{report.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <button className="nav-item active"><span>📊</span><span>Overview</span></button>
        <button className="nav-item" onClick={() => setActiveTab('villages')}><span>🏘️</span><span>Villages</span></button>
        <button className="nav-item" onClick={() => setActiveTab('gvp')}><span>🏆</span><span>GVP</span></button>
        <button className="nav-item" onClick={() => setActiveTab('reports')}><span>🚨</span><span>Reports</span></button>
        <button className="nav-item" onClick={logout}><span>👤</span><span>Logout</span></button>
      </nav>
    </div>
  );
}
