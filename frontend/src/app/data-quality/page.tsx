"use client";
import { useState, useRef } from "react";
import { Upload, Database, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet, Server, RefreshCcw, Loader2 } from "lucide-react";

export default function DataQuality() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [source, setSource] = useState("DEFAULT");
  const [datasetType, setDatasetType] = useState("suppliers");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("demo"); // demo or custom

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("source_system", source);
    formData.append("dataset_type", datasetType);

    try {
      const res = await fetch("http://localhost:8000/api/v1/integrations/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!data.error && !data.detail) {
        setMetrics(data.quality_metrics);
        setMode("custom");
      } else {
        alert("Upload failed: " + (data.error || data.detail));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSwitch = async (targetMode: string) => {
     setLoading(true);
     try {
       await fetch("http://localhost:8000/api/v1/integrations/switch-dataset", {
         method: "POST",
         headers: {"Content-Type": "application/json"},
         body: JSON.stringify({mode: targetMode})
       });
       setMode(targetMode);
       if (targetMode === "demo") setMetrics(null);
     } catch (err) {
       console.error(err);
     }
     setLoading(false);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Database className="text-blue-400" />
             Industrial Integrations
           </h2>
           <p className="text-slate-400 mt-2">Connect to ERP systems, ingest event logs, and validate data quality.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700/50 shadow-xl">
           <span className="text-sm font-bold text-slate-400 px-2 uppercase tracking-wider">Active Engine</span>
           <button onClick={() => handleSwitch("demo")} disabled={loading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${mode === 'demo' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <Server className="w-4 h-4" /> Demo
           </button>
           <button onClick={() => handleSwitch("custom")} disabled={loading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${mode === 'custom' ? 'bg-fuchsia-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <Database className="w-4 h-4" /> Custom
           </button>
           {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin ml-2" />}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Upload Panel */}
         <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Data Ingestion</h3>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-400 mb-2">Source System</label>
                 <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                    <option value="DEFAULT">Standard CSV</option>
                    <option value="SAP">SAP ERP (LFA1/EKKO)</option>
                    <option value="CELONIS">Celonis EMS (OCEL)</option>
                    <option value="ORACLE">Oracle SCM</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-400 mb-2">Dataset Type</label>
                 <select value={datasetType} onChange={(e) => setDatasetType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                    <option value="suppliers">Supplier Master Data</option>
                    <option value="event_log">Process Mining Event Log</option>
                    <option value="shipments">Shipment Records</option>
                 </select>
               </div>

               <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} accept=".csv,.xlsx" />
               
               <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-colors shadow-lg shadow-blue-900/20">
                  <Upload className="w-5 h-5" />
                  {loading ? "Processing..." : "Upload & Validate"}
               </button>
               
               <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl mt-4">
                  <div className="flex gap-3">
                     <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
                     <p className="text-xs text-blue-200 leading-relaxed">Uploading an event log will automatically trigger PM4Py topology discovery and update the Carbon Hotspot maps.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Quality Dashboard */}
         <div className="lg:col-span-2 space-y-6">
            {!metrics ? (
               <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500">
                  <ShieldCheck className="w-16 h-16 mb-4 opacity-50 text-blue-400" />
                  <p>Upload a dataset to generate a Quality Validation Score.</p>
               </div>
            ) : (
               <div className="space-y-6">
                  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700/50 shadow-xl flex items-center justify-between">
                     <div>
                        <h3 className="text-xl font-bold text-white mb-2">Data Quality Score</h3>
                        <p className="text-sm text-slate-400 max-w-md">The integration engine has audited the uploaded payload for schema conformance, structural integrity, and missing vectors.</p>
                     </div>
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke={metrics.data_quality_score >= 80 ? "#10b981" : metrics.data_quality_score >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * metrics.data_quality_score / 100)} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute text-3xl font-black text-white">{metrics.data_quality_score}</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Integrity Metrics</div>
                        <ul className="space-y-4">
                           <li className="flex justify-between items-center">
                              <span className="text-slate-300">Total Records</span>
                              <span className="font-bold text-white bg-slate-700 px-3 py-1 rounded-lg">{metrics.total_rows}</span>
                           </li>
                           <li className="flex justify-between items-center">
                              <span className="text-slate-300">Duplicate Rows</span>
                              <span className={`font-bold px-3 py-1 rounded-lg ${metrics.duplicate_rows === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{metrics.duplicate_rows}</span>
                           </li>
                           <li className="flex justify-between items-center">
                              <span className="text-slate-300">Null Value Count</span>
                              <span className={`font-bold px-3 py-1 rounded-lg ${metrics.null_values === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{metrics.null_values}</span>
                           </li>
                           <li className="flex justify-between items-center">
                              <span className="text-slate-300">Negative Violations</span>
                              <span className={`font-bold px-3 py-1 rounded-lg ${metrics.negative_values === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>{metrics.negative_values}</span>
                           </li>
                        </ul>
                     </div>

                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Schema Compliance</div>
                        {metrics.missing_columns.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-40 text-center">
                              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                              <p className="text-slate-300 font-bold">Schema Perfect</p>
                              <p className="text-sm text-slate-500 mt-1">All required system columns are present.</p>
                           </div>
                        ) : (
                           <div className="space-y-3">
                              <div className="flex items-center gap-2 text-red-400 mb-2">
                                 <AlertTriangle className="w-5 h-5" />
                                 <span className="font-bold">Missing Required Columns</span>
                              </div>
                              {metrics.missing_columns.map((col: string, i: number) => (
                                 <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-2 rounded-lg font-mono text-sm">
                                    {col}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
