import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { villages } from '../../data/villages';
import { sortVillagesByDistance, getCurrentPosition } from '../../utils/geocoding';
import { MapPin, Loader } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'villager', village_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [sortedVillages, setSortedVillages] = useState(villages);
  const [detectedNote, setDetectedNote] = useState('');

  const detectVillage = async () => {
    setDetecting(true);
    setDetectedNote('');
    try {
      const pos = await getCurrentPosition();
      const sorted = sortVillagesByDistance(villages, pos.lat, pos.lng);
      setSortedVillages(sorted);
      const nearest = sorted[0];
      setForm(f => ({ ...f, village_id: nearest.id }));
      setDetectedNote(`📍 Nearest: ${nearest.name} (${nearest.distanceKm.toFixed(1)} km away)`);
    } catch {
      setDetectedNote('⚠️ Could not detect location. Please select manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.village_id) { setError('Please select your village'); return; }
    setLoading(true);
    try {
      const user = register(form);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join Clean Connect — earn while keeping your village clean</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Full Name</label>
            <input type="text" placeholder="Sunita Patil" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          </div>
          <div className="form-row-2">
            <div className="login-field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div className="login-field">
              <label>Phone</label>
              <input type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} required />
            </div>
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" placeholder="Create a password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={4} />
          </div>
          <div className="login-field">
            <label>Account Type</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="villager">Villager / Household</option>
              <option value="agent">Collection Agent (Swachhata Sathi)</option>
              <option value="recycler">Industrial Recycler</option>
            </select>
          </div>
          <div className="login-field">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label>Your Village</label>
              <button type="button" className="detect-btn" onClick={detectVillage} disabled={detecting}>
                {detecting ? <Loader size={12} className="spin" /> : <MapPin size={12} />}
                {detecting ? 'Detecting…' : 'Auto-Detect'}
              </button>
            </div>
            {detectedNote && <div className="detect-note">{detectedNote}</div>}
            <select value={form.village_id} onChange={e => setForm(f => ({...f, village_id: e.target.value}))} required>
              <option value="">-- Select Village --</option>
              {sortedVillages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.marathi_name}){v.distanceKm != null ? ` — ${v.distanceKm.toFixed(1)}km` : ''}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
        <p className="login-register-link">Already have an account? <Link to="/">Sign In</Link></p>
      </div>
    </div>
  );
}
