"use client";
import dynamic from 'next/dynamic';
import { Globe, MapPin } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Network() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Globe className="text-emerald-500" />
          Supply Chain Risk Network
        </h2>
        <p className="text-slate-400 mt-2">Geographical visualization of healthy, at-risk, and disrupted nodes mapped against our global warehouses.</p>
      </header>

      <div className="bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-700/50">
        <MapComponent />
      </div>
      
      <div className="flex items-center flex-wrap gap-6 text-sm text-slate-300">
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Healthy</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> At Risk (&gt;0.7)</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Critical (&gt;0.85)</div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Warehouse</div>
      </div>
    </div>
  );
}
