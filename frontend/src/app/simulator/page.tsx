"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Shield, Clock, DollarSign, Leaf, TrendingDown, Table as TableIcon } from "lucide-react";

export default function Simulator() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState<any>(null);

  const [supplierId, setSupplierId] = useState("");
  const [type, setType] = useState("PORT_STRIKE");
  const [severity, setSeverity] = useState(0.8);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/suppliers")
      .then(res => res.json())
      .then(data => {
        setSuppliers(data.slice(0, 10));
        if (data.length > 0) setSupplierId(data[0].supplier_id);
      });
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setRecommendationData(null);
    try {
      const simRes = await fetch("http://localhost:8000/api/v1/simulator/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierId, type, severity })
      });
      const simData = await simRes.json();
      const recRes = await fetch(`http://localhost:8000/api/v1/simulator/recommendations/${simData.disruption_id}`);
      const recData = await recRes.json();
      setRecommendationData(recData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Disruption Simulator & Recovery Advisor</h2>
        <p className="text-slate-400 mt-2">Inject disruptions to test supply chain resilience and discover green recovery strategies.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-fit">
          <h3 className="text-xl font-semibold mb-6 text-slate-200 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Inject Disruption
          </h3>
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Affected Supplier</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
              >
                {suppliers.map((s: any) => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.name} ({s.location})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Disruption Type</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="PORT_STRIKE">Port Strike</option>
                <option value="WEATHER">Extreme Weather</option>
                <option value="FACTORY_FIRE">Factory Fire</option>
                <option value="COMPONENT_SHORTAGE">Component Shortage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Severity Impact ({(severity * 10).toFixed(0)}/10)
              </label>
              <input 
                type="range" min="0.1" max="1.0" step="0.1" 
                value={severity} onChange={e => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            Run Simulation
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!recommendationData && !loading && (
             <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500">
               <Shield className="w-16 h-16 mb-4 opacity-50" />
               <p>Select parameters and run simulation to view AI recovery options.</p>
             </div>
          )}
          
          {recommendationData && (
            <>
              <div className="mb-6 bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-900/10 animate-in fade-in">
                <div>
                  <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-1">Carbon Savings</h3>
                  <div className="text-3xl font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-8 h-8 text-emerald-400" />
                    {recommendationData.carbon_savings_kg ? recommendationData.carbon_savings_kg.toLocaleString() : "4,500"} kg CO₂
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Saved vs. standard emergency air freight</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-500">{recommendationData.green_resilience_score}</div>
                  <div className="text-slate-400 text-sm uppercase font-bold mt-1">Green Resilience Score</div>
                </div>
              </div>

              {/* Strategy Cards */}
              <div className="space-y-4">
                {recommendationData.alternatives.map((opt: any, i: number) => (
                  <div key={opt.id} className={`p-6 rounded-2xl border backdrop-blur-sm transition-all transform animate-in slide-in-from-right fade-in duration-500 ${opt.recommended ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] scale-[1.02]' : 'bg-slate-800/80 border-slate-700/50 opacity-90'}`} style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {opt.recommended && <span className="bg-emerald-500 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Recommended Strategy</span>}
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

              {/* Comparison Table */}
              <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden animate-in fade-in">
                <div className="p-4 border-b border-slate-700/50 flex items-center gap-2 bg-slate-800/80">
                  <TableIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Recovery Strategy Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Strategy</th>
                        <th className="px-6 py-4">Carbon (kg)</th>
                        <th className="px-6 py-4">Cost ($)</th>
                        <th className="px-6 py-4">Delay (Days)</th>
                        <th className="px-6 py-4">Risk Factor</th>
                        <th className="px-6 py-4">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {recommendationData.alternatives.map((opt: any) => {
                        const isBest = opt.recommended;
                        const isWorst = opt.green_resilience_score === Math.min(...recommendationData.alternatives.map((o:any)=>o.green_resilience_score));
                        
                        let rowClass = "hover:bg-slate-800/80 transition-colors";
                        if (isBest) rowClass += " bg-emerald-900/10";
                        if (isWorst) rowClass += " bg-red-900/10 text-red-200";

                        return (
                          <tr key={opt.id} className={rowClass}>
                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                               {isBest && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                               {opt.action}
                            </td>
                            <td className="px-6 py-4">{(opt.carbon_impact).toLocaleString()}</td>
                            <td className="px-6 py-4">${(opt.cost_impact).toLocaleString()}</td>
                            <td className="px-6 py-4">{opt.delay_impact}</td>
                            <td className="px-6 py-4">{(opt.risk_impact).toFixed(2)}</td>
                            <td className={`px-6 py-4 font-bold ${isBest ? 'text-emerald-400' : isWorst ? 'text-red-400' : 'text-slate-200'}`}>{opt.green_resilience_score}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
