"use client";
import { useState, useEffect } from "react";
import { Target, AlertTriangle, Loader2, Leaf, Clock, DollarSign, Shield } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function Optimization() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optData, setOptData] = useState<any>(null);

  const [supplierId, setSupplierId] = useState("");
  const [type, setType] = useState("PORT_STRIKE");
  const [severity, setSeverity] = useState(0.8);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/suppliers")
      .then(res => res.json())
      .then(data => {
        setSuppliers(data.slice(0, 10));
        if (data.length > 0) {
            setSupplierId(data[0].supplier_id);
            // Auto-run optimize so the page isn't empty on demo
            handleOptimizeWithId(data[0].supplier_id);
        }
      });
  }, []);

  const handleOptimizeWithId = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/optimization/pareto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: id, disruption_type: type, severity })
      });
      const data = await res.json();
      
      const allStrats = [
        ...data.pareto_front.map((s:any) => ({...s, is_pareto: true})),
        ...data.dominated_strategies.map((s:any) => ({...s, is_pareto: false}))
      ];
      data.chart_data = allStrats;
      setOptData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOptimize = () => handleOptimizeWithId(supplierId);


  const getRiskColor = (risk: number) => {
    if (risk > 0.8) return "#ef4444"; // Red
    if (risk > 0.5) return "#eab308"; // Yellow
    return "#10b981"; // Green
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-4 border border-slate-600 rounded-xl shadow-xl max-w-xs">
          <div className="font-bold text-white mb-2 pb-2 border-b border-slate-700 flex justify-between">
            {data.action}
            {data.is_pareto && <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 px-2 py-1 rounded-full uppercase">Optimal</span>}
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">Carbon:</span> <span className="text-slate-200">{Math.round(data.carbon_impact).toLocaleString()} kg</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Cost:</span> <span className="text-slate-200">${data.cost_impact.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Delay:</span> <span className="text-slate-200">{data.delay_impact.toFixed(1)}d</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Risk:</span> <span className="text-slate-200" style={{color: getRiskColor(data.risk_impact)}}>{(data.risk_impact*100).toFixed(0)}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Target className="text-fuchsia-400" /> Multi-Objective Pareto Optimization
        </h2>
        <p className="text-slate-400 mt-2">Discover mathematically optimal trade-offs between Cost, Carbon, Delay, and Risk.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-fit">
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Affected Node</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-fuchsia-500" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                {suppliers.map((s: any) => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Disruption Event</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-fuchsia-500" value={type} onChange={e => setType(e.target.value)}>
                <option value="PORT_STRIKE">Port Strike</option>
                <option value="WEATHER">Extreme Weather</option>
                <option value="FACTORY_FIRE">Factory Fire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Severity Impact ({(severity * 10).toFixed(0)}/10)</label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={severity} onChange={e => setSeverity(parseFloat(e.target.value))} className="w-full accent-fuchsia-500" />
            </div>
          </div>
          <button onClick={handleOptimize} disabled={loading} className="w-full mt-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-fuchsia-900/20 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Target className="w-5 h-5" />}
            Generate Pareto Front
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {!optData && !loading && (
             <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500">
               <Target className="w-16 h-16 mb-4 opacity-50" />
               <p>Run the optimizer to explore non-dominated recovery strategies.</p>
             </div>
          )}
          
          {optData && (
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Executive Insights */}
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-fuchsia-400" /> Executive Insights</h3>
                     <ul className="space-y-4 text-sm text-slate-300">
                        {optData.insights.map((ins: string, idx: number) => (
                           <li key={idx} className="flex gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0"></span>
                              <span>{ins}</span>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Best Balanced Card */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40 p-6 rounded-2xl border border-fuchsia-500/30 shadow-xl flex flex-col justify-center">
                     <div className="text-fuchsia-400 font-bold uppercase tracking-wider text-xs mb-2">Mathematical Sweet Spot</div>
                     <h4 className="text-2xl font-bold text-white mb-2">{optData.categories.best_balanced.action}</h4>
                     <p className="text-sm text-indigo-200">
                        This strategy sits closest to the theoretical "Ideal Point" across all 4 axes.
                     </p>
                     <div className="flex gap-4 mt-4">
                        <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs">
                           <span className="text-slate-400 block">Carbon</span>
                           <span className="text-white font-bold">{Math.round(optData.categories.best_balanced.carbon_impact).toLocaleString()} kg</span>
                        </div>
                        <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs">
                           <span className="text-slate-400 block">Cost</span>
                           <span className="text-white font-bold">${optData.categories.best_balanced.cost_impact.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Scatter Plot */}
               <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl h-[500px]">
                  <h3 className="text-lg font-bold text-white mb-1 flex justify-between">
                     <span>Pareto Optimization Trade-off Space</span>
                     <span className="text-sm font-normal text-slate-400">Total Solutions Explored: {optData.total_strategies}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">X: Cost ($) | Y: Carbon (kg) | Bubble Size: Delay (Days) | Color: Risk</p>
                  
                  <ResponsiveContainer width="100%" height="85%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" dataKey="cost_impact" name="Cost" stroke="#94a3b8" tickFormatter={(v) => `$${v}`} domain={['dataMin', 'dataMax']} />
                      <YAxis type="number" dataKey="carbon_impact" name="Carbon" stroke="#94a3b8" tickFormatter={(v) => `${(v/1000).toFixed(1)}t`} domain={['dataMin', 'dataMax']} />
                      <ZAxis type="number" dataKey="delay_impact" range={[100, 800]} name="Delay" />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                      
                      {/* Dominated points */}
                      <Scatter name="Dominated" data={optData.chart_data.filter((d:any)=>!d.is_pareto)} opacity={0.3}>
                        {optData.chart_data.filter((d:any)=>!d.is_pareto).map((entry: any, index: number) => (
                          <Cell key={`cell-dom-${index}`} fill={getRiskColor(entry.risk_impact)} />
                        ))}
                      </Scatter>

                      {/* Pareto optimal points */}
                      <Scatter name="Pareto Front" data={optData.chart_data.filter((d:any)=>d.is_pareto)} opacity={1.0}>
                        {optData.chart_data.filter((d:any)=>d.is_pareto).map((entry: any, index: number) => (
                          <Cell key={`cell-par-${index}`} fill={getRiskColor(entry.risk_impact)} stroke="#d946ef" strokeWidth={2} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
               </div>

               {/* Strategy Cards */}
               <div className="mt-8 space-y-4 animate-in fade-in">
                  <div className="p-4 border-b border-slate-700/50 flex items-center gap-2 mb-4 bg-slate-800/80 rounded-2xl">
                    <Target className="w-5 h-5 text-fuchsia-400" />
                    <h3 className="font-bold text-white">Strategy Details</h3>
                  </div>
                  {optData.chart_data.map((opt: any, i: number) => (
                    <div key={opt.id} className={`p-6 rounded-2xl border backdrop-blur-sm transition-all transform animate-in slide-in-from-right fade-in duration-500 ${opt.is_pareto ? 'bg-slate-800 border-fuchsia-500/50 shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)]' : 'bg-slate-800/80 border-slate-700/50 opacity-90'}`} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {opt.is_pareto ? (
                             <span className="bg-fuchsia-500 text-fuchsia-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Pareto Optimal</span>
                          ) : (
                             <span className="bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Dominated</span>
                          )}
                          <h4 className="text-xl font-bold text-white">{opt.action}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-200">{opt.green_resilience_score}</div>
                          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Score</div>
                        </div>
                      </div>

                      {opt.sustainability_violations && opt.sustainability_violations.length > 0 && (
                         <div className="mb-4 bg-red-900/20 border border-red-500/30 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2"><AlertTriangle className="w-4 h-4" /> Sustainability Policy Violations</div>
                            <ul className="text-sm text-red-300 space-y-1 list-disc pl-5">
                               {opt.sustainability_violations.map((v: string, vidx: number) => <li key={vidx}>{v}</li>)}
                            </ul>
                         </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-slate-900/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                          <div className="p-2 bg-slate-800 rounded-lg"><Leaf className="w-4 h-4 text-emerald-400" /></div>
                          <div>
                            <div className="text-xs text-slate-400">Carbon</div>
                            <div className="font-semibold text-slate-200">{Math.round(opt.carbon_impact).toLocaleString()} kg</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                          <div className="p-2 bg-slate-800 rounded-lg"><Clock className="w-4 h-4 text-yellow-400" /></div>
                          <div>
                            <div className="text-xs text-slate-400">Delay</div>
                            <div className="font-semibold text-slate-200">{opt.delay_impact} days</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                          <div className="p-2 bg-slate-800 rounded-lg"><DollarSign className="w-4 h-4 text-blue-400" /></div>
                          <div>
                            <div className="text-xs text-slate-400">Cost</div>
                            <div className="font-semibold text-slate-200">${opt.cost_impact.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700/50">
                          <div className="p-2 bg-slate-800 rounded-lg"><Shield className="w-4 h-4 text-purple-400" /></div>
                          <div>
                            <div className="text-xs text-slate-400">Risk</div>
                            <div className="font-semibold text-slate-200">{(opt.risk_impact * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
