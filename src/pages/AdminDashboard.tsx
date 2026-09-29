import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { SystemAnalytics, AuditLog } from '../types/index.ts';
import { CSVImportModal } from '../components/CSVImportModal.tsx';
import { AttractiveBackground } from '../components/AttractiveBackground.tsx';
import {
  ShieldAlert,
  Users,
  Building2,
  FileSpreadsheet,
  History,
  Upload,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, logsRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAuditLogs()
      ]);
      setAnalytics(analyticsRes.analytics);
      setAuditLogs(logsRes.auditLogs);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with High-Quality Academic Background & bg-slate-900/70 Overlay */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <AttractiveBackground variant="cyber-academic" overlayStyle="bg-slate-900/70" imageOpacity={0.85} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-bold uppercase mb-1.5 backdrop-blur-md">
              <Lock className="w-3 h-3 text-purple-300" />
              <span>Administrator Control Console</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              Institutional Oversight & Data Ingestion
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Manage student telemetry datasets, system audit traces, and department allocations across campus.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCsvModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import Student Dataset (CSV)</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2.5 border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Monitored Cohort</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.totalStudents ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Students across 3 Departments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Active Alerts</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{analytics?.activeAlertsCount ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting faculty check-in</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Active Support Plans</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{analytics?.activeInterventionsCount ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scheduled mentor interventions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">AI Pipeline Status</div>
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block mt-2 border border-emerald-200">
            Active · Random Forest Ensemble
          </div>
          <div className="text-[10px] text-slate-400 mt-1">12-week velocity baseline active</div>
        </div>
      </div>

      {/* Departments Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Academic Departments Configuration</span>
          </h3>
          <span className="text-xs text-slate-400">Semester 1</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">Computer Science & Engineering</div>
            <div className="text-slate-500 text-[11px] mt-1">Sections A, B, C, D · Years 2, 3, 4</div>
            <div className="mt-3 flex items-center justify-between text-slate-600">
              <span>Lead Mentor:</span>
              <strong className="text-slate-800">Dr. Elena Rostova</strong>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">Information Technology</div>
            <div className="text-slate-500 text-[11px] mt-1">Sections A, B, C, D · Years 2, 3, 4</div>
            <div className="mt-3 flex items-center justify-between text-slate-600">
              <span>Lead Mentor:</span>
              <strong className="text-slate-800">Prof. Marcus Vance</strong>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900">Electronics & Communication</div>
            <div className="text-slate-500 text-[11px] mt-1">Sections A, B, C, D · Years 2, 3, 4</div>
            <div className="mt-3 flex items-center justify-between text-slate-600">
              <span>Lead Mentor:</span>
              <strong className="text-slate-800">Dr. Aris Thorne</strong>
            </div>
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Immutable System Audit Log (Privacy & Access Compliance)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks all dataset updates, model evaluations, user logins, and mentor actions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Event ID</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{log.id}</td>
                  <td className="py-2.5 px-4 font-bold text-indigo-700 text-[11px]">{log.action}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{log.actorEmail}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate">{log.details}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={() => {
          fetchAdminData();
        }}
      />
    </div>
  );
};
