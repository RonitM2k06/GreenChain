"use client";
import { useEffect, useState } from "react";
import { Activity, Leaf, AlertTriangle, ShieldCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/dashboard/kpis")
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(err => console.error(err));
  }, []);

  const mockChartData = [
    { name: "Jan", emissions: 4000 },
    { name: "Feb", emissions: 3000 },
    { name: "Mar", emissions: 2000 },
    { name: "Apr", emissions: 2780 },
    { name: "May", emissions: 1890 },
    { name: "Jun", emissions: 2390 },
  ];

  if (!kpis) return <div className="text-slate-400 animate-pulse flex h-full items-center justify-center text-xl">Loading dashboard intelligence...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-400 mt-2">Real-time supply chain resilience and carbon tracking.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Emissions" value={`${(kpis.total_emissions_kg / 1000).toFixed(1)}k kg`} icon={<Leaf className="text-emerald-400" />} />
        <MetricCard title="Avg ESG Score" value={kpis.esg_avg} icon={<ShieldCheck className="text-blue-400" />} />
        <MetricCard title="Active Disruptions" value={kpis.active_disruptions} icon={<AlertTriangle className="text-red-400" />} />
        <MetricCard title="Resilience Score" value={kpis.resilience_score} icon={<Activity className="text-purple-400" />} />
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-slate-200">Carbon Emission Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              <Line type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors shadow-lg group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h4 className="text-3xl font-bold text-white mt-2 group-hover:scale-105 transition-transform origin-left">{value}</h4>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  )
}
