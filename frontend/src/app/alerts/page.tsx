"use client";
import { useState, useEffect } from "react";
import { BellRing, AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2, TrendingUp, Target } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/v1/alerts").then(r => r.json()),
      fetch("http://localhost:8000/api/v1/alerts/history").then(r => r.json())
    ]).then(([active, hist]) => {
      setAlerts(active);
      setHistory(hist);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "HIGH": return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "MEDIUM": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "LOW": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      default: return "text-slate-400 bg-slate-500/20";
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return <ShieldAlert className="w-5 h-5" />;
      case "HIGH": return <AlertTriangle className="w-5 h-5" />;
      default: return <BellRing className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="p-8 text-white">Detecting Network Anomalies...</div>;

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const processDeviations = alerts.filter(a => a.type === "PROCESS_DEVIATION").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BellRing className="text-rose-400" />
          Continuous Intelligence Center
        </h2>
        <p className="text-slate-400 mt-2">Proactive anomaly detection, sustainability policy monitoring, and automated risk alerts.</p>
      </header>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-rose-900/40 to-slate-900 border border-rose-500/20 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-6">
         <div className="bg-rose-500/20 p-4 rounded-xl shrink-0">
            <TrendingUp className="w-8 h-8 text-rose-400" />
         </div>
         <div>
            <h3 className="text-lg font-bold text-white mb-2">Executive AI Summary</h3>
            <ul className="space-y-1 text-slate-300">
               <li><strong className="text-rose-400">{criticalCount} suppliers</strong> show rising disruption risk crossing the critical threshold.</li>
               <li><strong className="text-orange-400">{processDeviations} new process hotspots</strong> emerged this week with dangerous carbon intensity.</li>
               <li>Total network emissions are tracking dangerously close to the Net-Zero limit.</li>
            </ul>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Active Alerts */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white flex justify-between border-b border-slate-700 pb-2">
               Active Intelligence Alerts <span className="bg-slate-700 text-sm px-3 rounded-full flex items-center">{alerts.length}</span>
            </h3>
            
            {alerts.length === 0 ? (
               <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-500">No active anomalies detected.</div>
            ) : (
               <div className="space-y-4">
                  {alerts.map((alert) => (
                     <div key={alert.alert_id} className={`p-6 rounded-2xl border shadow-lg ${getSeverityColor(alert.severity)}`}>
                        <div className="flex justify-between items-start mb-4 border-b border-current pb-4 opacity-80">
                           <div className="flex items-center gap-3">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="text-lg font-bold">{alert.title}</h4>
                           </div>
                           <span className="text-xs font-mono font-bold px-2 py-1 bg-black/20 rounded-lg">{alert.severity}</span>
                        </div>
                        
                        <div className="space-y-4">
                           <div>
                              <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Anomaly Detected</div>
                              <p className="font-medium text-sm leading-relaxed">{alert.description}</p>
                           </div>
                           <div className="bg-black/10 p-3 rounded-xl border border-current">
                              <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60 flex items-center gap-2"><Target className="w-4 h-4"/> AI Recommended Action</div>
                              <p className="font-bold text-sm">{alert.recommended_action}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* History / Trends */}
         <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Resolved Threats</h3>
            <div className="space-y-4">
               {history.map(h => (
                  <div key={h.alert_id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50">
                     <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-bold text-sm">{h.title}</span>
                     </div>
                     <p className="text-xs text-slate-400 mb-3">{h.description}</p>
                     <div className="bg-slate-900/50 p-2 rounded-lg text-xs text-emerald-400/70 italic border border-slate-700/50">
                        Resolution: {h.resolution}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
