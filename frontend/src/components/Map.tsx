"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';

export default function MapComponent() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/network")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="p-8 text-emerald-500 animate-pulse">Loading Global Network...</div>;

  return (
    <MapContainer center={[30, 60]} zoom={3} style={{ height: '600px', width: '100%', borderRadius: '1rem', background: '#1e293b' }} className="z-0 border border-slate-700/50">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      {data.warehouses?.map((w: any) => (
         <CircleMarker key={w.warehouse_id} center={[w.lat, w.lon]} radius={10} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.6}>
           <Popup>
             <div className="font-bold text-blue-600">{w.warehouse_id} (Warehouse)</div>
             <div className="text-sm text-slate-800">Location: {w.location}</div>
           </Popup>
         </CircleMarker>
      ))}
      {data.suppliers?.map((s: any) => {
         const isRisk = s.risk_score > 0.7;
         const color = s.risk_score >= 0.85 ? "#ef4444" : (isRisk ? "#eab308" : "#10b981");
         return (
           <CircleMarker key={s.supplier_id} center={[s.lat, s.lon]} radius={7} color={color} fillColor={color} fillOpacity={0.8}>
             <Popup>
               <div className="p-1 min-w-[200px]">
                 <div className="font-bold mb-2 text-lg border-b pb-1" style={{color: color}}>{s.name}</div>
                 <div className="text-sm mb-1 text-slate-800"><strong>Location:</strong> {s.location}</div>
                 <div className="text-sm mb-1 text-slate-800"><strong>Risk Score:</strong> {s.risk_score}</div>
                 <div className="text-sm mb-1 text-slate-800"><strong>ESG Score:</strong> {s.esg_score}</div>
                 <div className="text-sm text-slate-800"><strong>Carbon Rating:</strong> {s.base_carbon_rating}</div>
               </div>
             </Popup>
           </CircleMarker>
         )
      })}
    </MapContainer>
  )
}
