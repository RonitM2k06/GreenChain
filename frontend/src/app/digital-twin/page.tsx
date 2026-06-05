"use client";
import { useState, useEffect } from "react";
import { Activity, Shield, TrendingDown, Layers, Rocket, Leaf, RefreshCcw, Loader2, Target, Network } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DigitalTwin() {
  const [suppliers, setSuppliers] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [benchLoading, setBenchLoading] = useState(false);
  const [simCount, setSimCount] = useState(100);

  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfData, setWhatIfData] = useState<any>(null);
  const [supplierId, setSupplierId] = useState("");
  const [type, setType] = useState("FACTORY_FIRE");
  const [severity, setSeverity] = useState(0.8);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/suppliers")
      .then(res => res.json())
      .then(data => {
        setSuppliers(data.slice(0, 10));
        if (data.length > 0) setSupplierId(data[0].supplier_id);
      });
      runBenchmark(100);
  }, []);

  const runBenchmark = async (count: number) => {
    setBenchLoading(true);
    setSimCount(count);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/digital-twin/benchmark?count=${count}`);
      const data = await res.json();
      setBenchmarkData(data.benchmarks);
    } catch (e) {
       console.error(e);
    }
    setBenchLoading(false);
  };

  const runWhatIf = async () => {
    setWhatIfLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/digital-twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierId, disruption_type: type, severity })
      });
      const data = await res.json();
      setWhatIfData(data);
    } catch (e) {
      console.error(e);
    }
    setWhatIfLoading(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="text-indigo-400" />
          Supply Chain Digital Twin
        </h2>
        <p className="text-slate-400 mt-2">Simulate theoretical disruptions and benchmark recovery strategies at scale before they occur.</p>
      </header>

      {/* Batch Benchmarking Section */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
         <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="text-indigo-400" /> Scenario Benchmarking Engine</h3>
               <p className="text-sm text-slate-400">Aggregated recovery performance across randomized synthetic disruptions.</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => runBenchmark(100)} disabled={benchLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${simCount === 100 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>100 Runs</button>
               <button onClick={() => runBenchmark(500)} disabled={benchLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${simCount === 500 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>500 Runs</button>
               <button onClick={() => runBenchmark(1000)} disabled={benchLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${simCount === 1000 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>1000 Runs</button>
               {benchLoading && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
            </div>
         </div>
         <div className="p-6 min-h-[400px]">
            {benchmarkData && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500">Average Strategy Performance</h4>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={benchmarkData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="strategy" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => v.split(" ")[0]} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px'}} />
                            <Legend />
                            <Bar dataKey="avg_green_score" name="Green Resilience" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avg_resilience_score" name="Ops Resilience" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="compliance_rate" name="Policy Compliance %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">Statistical Breakdown</h4>
                    <div className="space-y-3">
                       {benchmarkData.map((b: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                             <div className="font-bold text-white mb-2">{b.strategy}</div>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-slate-400">Avg Cost: <span className="text-slate-200 font-semibold">${b.avg_cost.toLocaleString()}</span></div>
                                <div className="text-slate-400">Avg Carbon: <span className="text-slate-200 font-semibold">{b.avg_carbon_kg.toLocaleString()}kg</span></div>
                                <div className="text-slate-400">Avg Delay: <span className="text-slate-200 font-semibold">{b.avg_delay_days} days</span></div>
                                <div className="text-slate-400">Compliance: <span className={`font-semibold ${b.compliance_rate > 80 ? 'text-emerald-400' : 'text-red-400'}`}>{b.compliance_rate}%</span></div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* What-If Custom Scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-fit">
          <h3 className="text-xl font-semibold mb-6 text-slate-200 flex items-center gap-2">
            <Target className="text-blue-400" /> What-If Sandbox
          </h3>
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Target Node</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-indigo-500" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                {suppliers.map((s: any) => <option key={s.supplier_id} value={s.supplier_id}>{s.name} ({s.location})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Simulated Event</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-indigo-500" value={type} onChange={e => setType(e.target.value)}>
                <option value="PORT_STRIKE">Port Strike</option>
                <option value="WEATHER">Extreme Weather</option>
                <option value="FACTORY_FIRE">Factory Fire</option>
                <option value="COMPONENT_SHORTAGE">Component Shortage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Severity ({(severity * 10).toFixed(0)}/10)</label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={severity} onChange={e => setSeverity(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>
          <button onClick={runWhatIf} disabled={whatIfLoading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
            {whatIfLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Rocket className="w-5 h-5" />}
            Execute Twin Simulation
          </button>
        </div>

        <div className="lg:col-span-2">
           {!whatIfData && !whatIfLoading && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500">
                <Network className="w-16 h-16 mb-4 opacity-50 text-indigo-400" />
                <p>Configure a custom What-If scenario to test the Digital Twin.</p>
              </div>
           )}
           {whatIfData && (
             <div className="space-y-4 animate-in fade-in">
                {whatIfData.alternatives.map((opt: any, i: number) => (
                  <div key={opt.id} className={`p-6 rounded-2xl border ${opt.recommended ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800 border-slate-700/50'}`}>
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          {opt.recommended && <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Best Resilience Path</span>}
                          <h4 className="text-xl font-bold text-white">{opt.action}</h4>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-right bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-500/20">
                             <div className="text-xl font-black text-emerald-400">{opt.green_resilience_score}</div>
                             <div className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Green Score</div>
                           </div>
                           <div className="text-right bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-500/20">
                             <div className="text-xl font-black text-indigo-400">{opt.resilience_score}</div>
                             <div className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold">Ops Resilience</div>
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                           <div className="text-xs text-slate-400 mb-1">Carbon Pred.</div>
                           <div className="font-bold text-slate-200">{(opt.carbon_impact / 1000).toFixed(1)}t</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                           <div className="text-xs text-slate-400 mb-1">Cost Pred.</div>
                           <div className="font-bold text-slate-200">${opt.cost_impact.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                           <div className="text-xs text-slate-400 mb-1">Delay Pred.</div>
                           <div className="font-bold text-slate-200">{opt.delay_impact}d</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                           <div className="text-xs text-slate-400 mb-1">Risk Exp.</div>
                           <div className="font-bold text-slate-200">{(opt.risk_impact*100).toFixed(0)}%</div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
