import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getCategoryConfig } from '../../utils/gvpConfig';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';

export default function VillagerMap() {
  const { currentUser } = useAuth();
  const { wasteEntries, dumpReports } = useData();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Use Leaflet for map (loaded via CDN in index.html)
    if (typeof window === 'undefined' || !window.L) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [16.8065, 74.1130],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Get user position
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserPos({ lat, lng });
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#176B28;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(23,107,40,0.25)"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      });
      L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('📍 You are here');
      map.setView([lat, lng], 15);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Add waste entry markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const myEntries = wasteEntries.filter(e => e.household_id === currentUser?.id);

    myEntries.forEach(entry => {
      if (!entry.lat || !entry.lng) return;
      const cat = getCategoryConfig(entry.category);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:${cat.bg};border:2px solid ${cat.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${cat.icon}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      L.marker([entry.lat, entry.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${cat.label}</b><br>${entry.weight_kg}kg<br>Status: ${entry.status}`);
    });

    // Dump report markers
    dumpReports.forEach(dr => {
      if (!dr.lat || !dr.lng) return;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:#FEE2E2;border:2px solid #DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px">🚨</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      L.marker([dr.lat, dr.lng], { icon }).addTo(map).bindPopup(`<b>Illegal Dump</b><br>${dr.description}`);
    });
  }, [mapReady, wasteEntries, dumpReports, currentUser]);

  return (
    <div className="fullscreen-map-root">
      <div className="map-topbar">
        <button className="map-back-btn" onClick={() => navigate('/villager')}><ArrowLeft size={20} /> Back</button>
        <div className="map-title">🗺️ Waste Map — Panhala</div>
        <button className="map-locate-btn" onClick={() => {
          navigator.geolocation?.getCurrentPosition(pos => {
            mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 16);
          });
        }}><Navigation size={16} /></button>
      </div>
      <div ref={mapRef} className="map-container" />
      <div className="map-legend">
        <div className="map-legend-title">Legend</div>
        {[{icon:'🌿',label:'Wet'},{icon:'♻️',label:'Plastic'},{icon:'📦',label:'Dry'},{icon:'🔩',label:'Metal'},{icon:'🚨',label:'Dump'}].map(l => (
          <div key={l.label} className="map-legend-item"><span>{l.icon}</span><span>{l.label}</span></div>
        ))}
      </div>
    </div>
  );
}
