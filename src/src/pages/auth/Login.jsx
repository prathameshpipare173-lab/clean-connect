import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Recycle, MapPin, Shield } from 'lucide-react';

const DEMO_ROLES = [
  { role: 'villager', label: 'Villager',   icon: '🏠', color: 'from-green-600 to-green-700',   desc: 'Log waste, earn points' },
  { role: 'agent',    label: 'Agent',      icon: '🚛', color: 'from-teal-600 to-teal-700',     desc: 'Pickup & collect waste' },
  { role: 'recycler', label: 'Recycler',   icon: '🏭', color: 'from-blue-600 to-blue-700',     desc: 'Bid on waste lots' },
  { role: 'admin',    label: 'Sarpanch',   icon: '🏛️', color: 'from-purple-700 to-purple-800', desc: 'Manage panchayat' },
];

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleHome = (role) => `/${role}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = login(form.email, form.password);
      navigate(roleHome(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      demoLogin(role);
      navigate(roleHome(role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Hero background */}
      <div className="login-hero">
        <div className="login-hero-overlay" />
        <div className="login-hero-content">
          <div className="login-brand">
            <div className="login-logo">
              <Recycle size={28} color="#fff" />
            </div>
            <span className="login-brand-name">Clean Connect</span>
          </div>
          <h1 className="login-hero-title">Village Waste-to-Wealth Platform</h1>
          <p className="login-hero-sub">Panhala Taluka, Kolhapur, Maharashtra</p>
          <div className="login-stats-row">
            <div className="login-stat"><span className="login-stat-num">10</span><span className="login-stat-lbl">Villages</span></div>
            <div className="login-stat"><span className="login-stat-num">4</span><span className="login-stat-lbl">Roles</span></div>
            <div className="login-stat"><span className="login-stat-num">GVP</span><span className="login-stat-lbl">Economy</span></div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-panel">
        <div className="login-card">
          <h2 className="login-card-title">Welcome Back</h2>
          <p className="login-card-sub">Sign in to your Clean Connect account</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email or Phone</label>
              <input
                type="text"
                placeholder="demo@villager.in"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider"><span>Or try a demo account</span></div>

          <div className="demo-grid">
            {DEMO_ROLES.map(r => (
              <button
                key={r.role}
                className={`demo-btn demo-btn-${r.role}`}
                onClick={() => handleDemo(r.role)}
                disabled={loading}
              >
                <span className="demo-icon">{r.icon}</span>
                <div>
                  <div className="demo-label">{r.label}</div>
                  <div className="demo-desc">{r.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <p className="login-register-link">
            New user? <Link to="/register">Register here</Link>
          </p>
        </div>

        <div className="login-features">
          <div className="feature-chip"><Leaf size={14} /> AI Waste Classifier</div>
          <div className="feature-chip"><MapPin size={14} /> Live GPS Tracking</div>
          <div className="feature-chip"><Shield size={14} /> Gram Vikas Points</div>
          <div className="feature-chip"><Recycle size={14} /> Circular Economy</div>
        </div>
      </div>
    </div>
  );
}
