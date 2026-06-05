"use client";
import { useState, useEffect } from "react";
import { Activity, Leaf, ArrowRight, TrendingDown, AlertTriangle } from "lucide-react";

export default function CarbonHotspots() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/process-mining/summary")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-emerald-500 flex justify-center mt-20"><Activity className="w-12 h-12" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <TrendingDown className="text-emerald-500" />
          Carbon Hotspot Explorer
        </h2>
        <p className="text-slate-400 mt-2">Isolating carbon-intensive process paths discovered directly from historical execution data via PM4Py.</p>
      </header>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Worst Case Baseline</div>
            <div className="text-3xl font-black text-red-400">{(data.carbon_hotspots[0].avg_carbon_kg / 1000).toFixed(1)}t</div>
            <div className="text-xs text-slate-500 mt-2">Highest Carbon Historical Execution Path</div>
         </div>
         <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Best Case Baseline</div>
            <div className="text-3xl font-black text-emerald-400">{(data.variants[data.variants.length-1].avg_carbon_kg / 1000).toFixed(1)}t</div>
            <div className="text-xs text-slate-500 mt-2">Lowest Carbon Historical Execution Path</div>
         </div>
         <div className="bg-indigo-900/40 border border-indigo-500/30 p-6 rounded-2xl shadow-xl">
            <div className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-2">Process Discovery</div>
            <div className="text-3xl font-black text-white">{data.variants.length}</div>
            <div className="text-xs text-indigo-200 mt-2">Unique Topologies Discovered by PM4Py</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Leaf className="text-red-400" /> Highest Carbon Variants</h3>
          </div>
          <div className="p-6 space-y-4">
             {data.carbon_hotspots.map((v: any, i: number) => {
                const baseline = data.variants[0]?.avg_carbon_kg;
                const deviation = baseline ? ((v.avg_carbon_kg - baseline) / baseline * 100).toFixed(1) : "0";
                return (
                  <div key={i} className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden">
                     {i === 0 && <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-bl-lg">CRITICAL HOTSPOT</div>}
                     <div className="flex justify-between items-start mb-4 mt-2">
                        <div>
                          <div className="text-lg font-bold text-slate-200 mb-2">Variant Path</div>
                          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-400">
                            {v.variant.split(" -> ").map((step: string, idx: number, arr: any[]) => (
                              <span key={idx} className="flex items-center gap-2">
                                <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium whitespace-nowrap">{step}</span>
                                {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500" />}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-2xl font-black text-red-400">{(v.avg_carbon_kg / 1000).toFixed(1)} t</div>
                           <div className="text-xs text-slate-500">Frequency: {v.frequency}</div>
                        </div>
                     </div>
                     {i === 0 && baseline && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 shrink-0" /> 
                          This path deviates by <strong>+{deviation}%</strong> carbon emissions compared to the baseline historical execution.
                        </div>
                     )}
                  </div>
                )
             })}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Leaf className="text-emerald-400" /> Lowest Carbon Variants</h3>
          </div>
          <div className="p-6 space-y-4">
             {data.variants.slice(-3).reverse().map((v: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 p-5 rounded-xl border border-emerald-500/20">
                     <div className="flex justify-between items-start mb-4 mt-2">
                        <div>
                          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-400">
                            {v.variant.split(" -> ").map((step: string, idx: number, arr: any[]) => (
                              <span key={idx} className="flex items-center gap-2">
                                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 whitespace-nowrap">{step}</span>
                                {idx < arr.length - 1 && <ArrowRight className="w-3 h-3" />}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xl font-bold text-emerald-400">{(v.avg_carbon_kg / 1000).toFixed(1)} t</div>
                           <div className="text-xs text-slate-500">Frequency: {v.frequency}</div>
                        </div>
                     </div>
                  </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
