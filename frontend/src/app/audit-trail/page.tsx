"use client";
import { useState, useEffect } from "react";
import { Search, FileText, CheckCircle2, XCircle, AlertTriangle, Printer, Clock } from "lucide-react";

export default function AuditTrail() {
  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch an initial trace for demo purposes
    fetch("http://localhost:8000/api/v1/suppliers")
      .then(res => res.json())
      .then(data => {
        if(data.length > 0) {
            return fetch(`http://localhost:8000/api/v1/audit/trace/${data[0].supplier_id}`);
        }
        throw new Error("No suppliers");
      })
      .then(res => res.json())
      .then(data => {
         setTrace(data.trace_data);
         setLoading(false);
      })
      .catch(e => {
         console.error(e);
         setLoading(false);
      });
  }, []);

  const handlePrint = () => {
      window.print();
  };

  if (loading) return <div className="p-8 text-white">Loading Trace Data...</div>;
  if (!trace) return <div className="p-8 text-white">No Trace Data Available</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 print:text-black print:bg-white print:max-w-full">
      <header className="flex justify-between items-end print:mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 print:text-black">
             <FileText className="text-indigo-400 print:text-black" />
             Decision Audit Trail
           </h2>
           <p className="text-slate-400 mt-2 print:text-gray-600">Traceability report detailing the exact mathematical and policy logic behind AI recommendations.</p>
        </div>
        <div className="print:hidden">
           <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20">
              <Printer className="w-4 h-4" /> Export Executive PDF
           </button>
        </div>
      </header>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1 print:text-gray-500">Trace ID</div>
            <div className="text-sm text-white font-mono truncate print:text-black">{trace.trace_id}</div>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1 print:text-gray-500">Timestamp</div>
            <div className="text-sm text-white font-mono print:text-black">{trace.timestamp}</div>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1 print:text-gray-500">Options Evaluated</div>
            <div className="text-xl text-white font-bold print:text-black">{trace.total_evaluated}</div>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 print:border-gray-300 print:bg-gray-50">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1 print:text-gray-500">Pareto Optimal</div>
            <div className="text-xl text-emerald-400 font-bold print:text-emerald-700">{trace.pareto_optimal_count}</div>
         </div>
      </div>

      <div className="space-y-6 print:space-y-4">
         <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2 print:text-black print:border-gray-300">Strategy Evaluation Matrix</h3>
         
         <div className="space-y-4">
            {trace.annotated_strategies.map((strat: any, i: number) => (
               <div key={i} className={`p-6 rounded-2xl border print:border-gray-300 print:shadow-none shadow-xl flex flex-col md:flex-row gap-6 ${strat.is_pareto ? 'bg-emerald-900/20 border-emerald-500/30 print:bg-green-50' : 'bg-slate-800 border-slate-700/50 print:bg-white'}`}>
                  
                  <div className="md:w-1/3 space-y-4 border-r border-slate-700/50 pr-6 print:border-gray-200">
                     <div className="flex items-center gap-3">
                        {strat.is_pareto ? <CheckCircle2 className="w-6 h-6 text-emerald-400 print:text-emerald-600" /> : <XCircle className="w-6 h-6 text-slate-500 print:text-gray-400" />}
                        <h4 className={`text-lg font-bold ${strat.is_pareto ? 'text-emerald-400 print:text-emerald-700' : 'text-slate-300 print:text-gray-700'}`}>{strat.action}</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="text-slate-400 print:text-gray-500">Carbon:</div><div className="text-white font-mono text-right print:text-black">{strat.carbon_impact} kg</div>
                        <div className="text-slate-400 print:text-gray-500">Cost:</div><div className="text-white font-mono text-right print:text-black">${strat.cost_impact}</div>
                        <div className="text-slate-400 print:text-gray-500">Delay:</div><div className="text-white font-mono text-right print:text-black">{strat.delay_impact} d</div>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 print:bg-gray-100 print:border-gray-200">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Decision Confidence</div>
                        <div className="flex items-center gap-3">
                           <div className="w-full bg-slate-800 rounded-full h-2 print:bg-gray-300">
                              <div className={`h-2 rounded-full ${strat.confidence_score >= 80 ? 'bg-emerald-500' : strat.confidence_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${strat.confidence_score}%` }}></div>
                           </div>
                           <span className="text-sm font-bold text-white print:text-black">{strat.confidence_score}/100</span>
                        </div>
                     </div>
                  </div>

                  <div className="md:w-2/3 flex flex-col justify-center space-y-3">
                     <div className="text-sm font-bold uppercase tracking-wider text-slate-500 print:text-gray-500">AI Reasoning Engine</div>
                     <p className={`text-lg leading-relaxed ${strat.is_pareto ? 'text-emerald-300 font-medium print:text-emerald-800' : 'text-slate-300 print:text-gray-800'}`}>
                        {strat.explanation}
                     </p>
                     
                     {(strat.policy_violations.carbon || strat.policy_violations.delay) && (
                        <div className="flex items-center gap-2 mt-2 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm font-medium border border-red-500/20 print:bg-red-50 print:border-red-200 print:text-red-700 w-fit">
                           <AlertTriangle className="w-4 h-4" />
                           Failed Sustainability Policy Conformance
                        </div>
                     )}

                     {strat.counterfactual && (
                        <div className="mt-4 bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl print:bg-indigo-50 print:border-indigo-200">
                           <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 print:text-indigo-600">Counterfactual Analysis</div>
                           <p className="text-sm text-indigo-200 print:text-indigo-800">{strat.counterfactual.statement}</p>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
