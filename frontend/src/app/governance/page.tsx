"use client";
import { useState, useEffect } from "react";
import { Users, CheckSquare, XSquare, MessageSquare, Shield, Clock, Search } from "lucide-react";

export default function Governance() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/governance/ledger")
      .then(res => res.json())
      .then(data => {
        setLedger(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (id: string) => {
     try {
       await fetch(`http://localhost:8000/api/v1/governance/${id}/approve`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({user: "Reviewer A", role: "Executive", reason: "Approved via Governance Portal"})
       });
       // refresh
       const res = await fetch("http://localhost:8000/api/v1/governance/ledger");
       const d = await res.json();
       setLedger(d);
     } catch (err) {
       console.error(err);
     }
  }

  if (loading) return <div className="p-8 text-white">Loading Governance Data...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield className="text-amber-500" />
          Enterprise Governance & Approvals
        </h2>
        <p className="text-slate-400 mt-2">Collaborative decision tracking, compliance reviews, and executive strategy sign-offs.</p>
      </header>

      {ledger.length === 0 ? (
         <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500">
            <Search className="w-16 h-16 mb-4 opacity-50 text-amber-500" />
            <p>No decision reviews pending. Run a Pareto simulation to generate a draft.</p>
         </div>
      ) : (
         <div className="space-y-6">
            {ledger.map((item, idx) => (
               <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {item.status}
                           </span>
                           <span className="text-slate-400 text-sm font-mono">{item.review_id}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Disruption Recovery Plan</h3>
                        <p className="text-sm text-slate-400 mt-1">Requested by: {item.requested_by}</p>
                     </div>
                     {item.status !== "APPROVED" && (
                        <div className="flex gap-2">
                           <button onClick={() => handleApprove(item.review_id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                              <CheckSquare className="w-4 h-4" /> Approve Plan
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Trace Summary</h4>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                           <ul className="space-y-2 text-sm text-slate-300">
                              <li className="flex justify-between"><span>Options Evaluated:</span> <span className="font-bold text-white">{item.trace_data.total_evaluated}</span></li>
                              <li className="flex justify-between"><span>Pareto Optimal Candidates:</span> <span className="font-bold text-emerald-400">{item.trace_data.pareto_optimal_count}</span></li>
                              <li className="flex justify-between"><span>Policy Violations Found:</span> <span className="font-bold text-red-400">
                                 {item.trace_data.annotated_strategies.filter((s:any)=>s.policy_violations.carbon || s.policy_violations.delay).length}
                              </span></li>
                           </ul>
                        </div>
                     </div>
                     
                     <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Stakeholder Approvals</h4>
                        {item.approvals.length === 0 ? (
                           <div className="text-sm text-slate-500 italic">No approvals yet. Pending executive review.</div>
                        ) : (
                           <div className="space-y-3">
                              {item.approvals.map((app:any, i:number) => (
                                 <div key={i} className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-3">
                                    <div className="bg-emerald-500/20 p-2 rounded-lg"><CheckSquare className="w-4 h-4 text-emerald-400" /></div>
                                    <div>
                                       <div className="text-sm font-bold text-emerald-300">{app.user} <span className="text-xs text-slate-400 font-normal ml-2">({app.role})</span></div>
                                       <div className="text-xs text-emerald-400/80 mt-1">{app.reason}</div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
