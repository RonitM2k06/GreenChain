import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Leaf, AlertTriangle, GitPullRequest, Globe, TrendingDown, Activity, Target, Database, Shield, FileText, BellRing } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Supply Chain Intelligence",
  description: "Carbon-Aware Process Mining Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-50 flex h-screen overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <Leaf className="w-6 h-6" />
              GreenChain
            </h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
              Executive Dashboard
            </Link>
            <Link href="/alerts" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors print:hidden">
              <BellRing className="w-5 h-5 text-rose-400" />
              Intelligence Center
            </Link>
            <Link href="/carbon-hotspots" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              Carbon Hotspots
            </Link>
            <Link href="/digital-twin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <Activity className="w-5 h-5 text-indigo-400" />
              Digital Twin Benchmark
            </Link>
            <Link href="/optimization" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <Target className="w-5 h-5 text-fuchsia-400" />
              Pareto Optimization
            </Link>

            <Link href="/data-quality" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors print:hidden">
              <Database className="w-5 h-5 text-blue-400" />
              Integrations & Data
            </Link>
            <Link href="/audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors print:hidden">
              <FileText className="w-5 h-5 text-indigo-400" />
              Decision Audit Trail
            </Link>
            <Link href="/governance" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors print:hidden">
              <Shield className="w-5 h-5 text-amber-400" />
              Governance
            </Link>
            <Link href="/simulator" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Disruption Simulator
            </Link>
            <Link href="/network" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <Globe className="w-5 h-5 text-sky-400" />
              Supply Chain Map
            </Link>
            <Link href="/process-mining" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors">
              <GitPullRequest className="w-5 h-5 text-teal-400" />
              Process Mining
            </Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
