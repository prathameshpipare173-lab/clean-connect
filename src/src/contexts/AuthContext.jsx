import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('cc_session');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('avengers_users') || '[]');
    const user = users.find(u =>
      (u.email === email || u.phone === email) && u.password === password
    );
    if (!user) throw new Error('Invalid credentials');
    const session = { ...user };
    delete session.password;
    localStorage.setItem('cc_session', JSON.stringify(session));
    setCurrentUser(session);
    return session;
  };

  const demoLogin = (role) => {
    const demoMap = {
      villager: { email: 'demo@villager.in', password: 'demo' },
      agent:    { email: 'demo@agent.in',    password: 'demo' },
      recycler: { email: 'demo@recycler.in', password: 'demo' },
      admin:    { email: 'demo@admin.in',    password: 'demo' },
    };
    return login(demoMap[role].email, demoMap[role].password);
  };

  const register = ({ name, email, phone, password, role = 'villager', village_id }) => {
    const users = JSON.parse(localStorage.getItem('avengers_users') || '[]');
    if (users.find(u => u.email === email || u.phone === phone)) {
      throw new Error('User already registered');
    }
    const id = 'u_' + Date.now();
    const ccId = 'CC-' + Math.random().toString(36).toUpperCase().substring(2, 9);
    const newUser = { id, ccId, name, email, phone, password, role, village_id, avatar: '👤' };
    users.push(newUser);
    localStorage.setItem('avengers_users', JSON.stringify(users));

    // Create wallet for villager
    if (role === 'villager') {
      const wallets = JSON.parse(localStorage.getItem('avengers_wallets') || '[]');
      wallets.push({ id: 'wal_' + id, household_id: id, cash_balance: 0, points_balance: 0, total_points_earned: 0 });
      localStorage.setItem('avengers_wallets', JSON.stringify(wallets));
    }

    const session = { ...newUser };
    delete session.password;
    localStorage.setItem('cc_session', JSON.stringify(session));
    setCurrentUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem('cc_session');
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    const users = JSON.parse(localStorage.getItem('avengers_users') || '[]');
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem('avengers_users', JSON.stringify(users));
    }
    const updated = { ...currentUser, ...updates };
    localStorage.setItem('cc_session', JSON.stringify(updated));
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, demoLogin, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
