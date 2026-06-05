"use client";
import { useState, useEffect } from "react";
import { Activity, Clock, AlertTriangle, Leaf, GitPullRequest, ArrowRight, TrendingUp } from "lucide-react";

export default function ProcessMiningDashboard() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-emerald-500">
        <Activity className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <GitPullRequest className="text-emerald-500" />
          Carbon-Aware Process Mining
        </h2>
        <p className="text-slate-400 mt-2">Discovering process variants, bottlenecks, and carbon hotspots directly from historical event logs using PM4Py.</p>
      </header>

      {/* Executive Storytelling */}
      <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl shadow-lg shadow-emerald-900/10">
        <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-4">What the AI Discovered</h3>
        <ul className="space-y-3">
          {data.storytelling.map((story: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-emerald-50">
              <ArrowRight className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-lg leading-relaxed font-medium">{story}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Total Traces</div>
          <div className="text-3xl font-bold text-white">{data.total_cases.toLocaleString()}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2"><GitPullRequest className="w-4 h-4 text-purple-400" /> Process Variants</div>
          <div className="text-3xl font-bold text-white">{data.variants.length}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Avg Cycle Time</div>
          <div className="text-3xl font-bold text-white">{data.avg_cycle_time_days} <span className="text-lg text-slate-500 font-normal">days</span></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-400" /> Max Carbon Path</div>
          <div className="text-3xl font-bold text-white">{(data.carbon_hotspots[0]?.avg_carbon_kg / 1000).toFixed(1)} <span className="text-lg text-slate-500 font-normal">t</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Discovered Variants */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
            <GitPullRequest className="text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Top Discovered Variants</h3>
          </div>
          <div className="p-6 space-y-6">
            {data.variants.slice(0, 3).map((v: any, i: number) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-indigo-400">Variant {i + 1}</span>
                  <span className="text-slate-400">{v.frequency} executions ({(v.frequency / data.total_cases * 100).toFixed(1)}%)</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center flex-wrap gap-2 text-sm text-slate-300">
                    {v.variant.split(" -> ").map((step: string, idx: number, arr: any[]) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700 font-medium whitespace-nowrap">{step}</span>
                        {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500" />}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-900/30 px-4 py-2 rounded-lg text-sm border border-slate-800">
                   <div className="flex items-center gap-2 text-emerald-400"><Leaf className="w-4 h-4" /> {v.avg_carbon_kg.toLocaleString()} kg CO₂</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottlenecks and Hotspots */}
        <div className="space-y-8">
          {/* Carbon Hotspots */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 bg-red-900/10">
              <TrendingUp className="text-red-400" />
              <h3 className="text-xl font-bold text-white">Carbon Hotspot Analysis</h3>
            </div>
            <div className="p-6">
              {data.carbon_hotspots.slice(0,2).map((hotspot: any, i: number) => {
                const isWorst = i === 0;
                return (
                  <div key={i} className={`mb-4 last:mb-0 p-4 rounded-xl border ${isWorst ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className={`font-semibold ${isWorst ? 'text-red-400' : 'text-slate-200'}`}>{isWorst ? 'Highest Carbon Path' : 'Secondary Hotspot'}</h4>
                       <span className="text-lg font-bold text-white">{hotspot.avg_carbon_kg.toLocaleString()} kg</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1" title={hotspot.variant}>{hotspot.variant}</p>
                    {isWorst && data.variants[0] && hotspot.variant !== data.variants[0].variant && (
                      <div className="mt-3 text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 inline-block px-2 py-1 rounded">
                        +{(((hotspot.avg_carbon_kg - data.variants[0].avg_carbon_kg) / data.variants[0].avg_carbon_kg) * 100).toFixed(1)}% Deviation from Baseline
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottlenecks */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 bg-yellow-900/10">
              <AlertTriangle className="text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Process Bottlenecks</h3>
            </div>
            <div className="p-6">
              {data.bottlenecks.length > 0 ? (
                <div className="space-y-4">
                  {data.bottlenecks.map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{b.activity}</div>
                          <div className="text-xs text-slate-400">{b.frequency} occurrences</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-500">+{b.avg_delay_days}</div>
                        <div className="text-xs text-slate-400 uppercase">Avg Days Delay</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6">No significant bottlenecks detected in log.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
