import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BrainCircuit,
  BellRing,
  HeartHandshake,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Building2,
  FileCheck2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, alertCount = 0 }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    {
      id: isAdmin ? 'admin-dashboard' : 'faculty-dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'student-list',
      label: 'Student Roster',
      icon: Users
    },
    {
      id: 'class-analytics',
      label: 'Class Analytics',
      icon: BarChart3
    },
    {
      id: 'ai-insights',
      label: 'AI Risk Engine',
      icon: BrainCircuit
    },
    {
      id: 'alerts',
      label: 'Active Alerts',
      icon: BellRing,
      badge: alertCount > 0 ? alertCount : undefined
    },
    {
      id: 'interventions',
      label: 'Interventions',
      icon: HeartHandshake
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileSpreadsheet
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800 select-none">
      <div className="p-4 space-y-6">
        {/* Context Card */}
        <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Portal</span>
          </div>
          <div className="font-bold text-white text-xs mt-1 truncate">
            {user?.department || 'Computer Science & Engineering'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Spring Term · Semesters 3-8</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Main Management
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Ethics & Integrity Commitment */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/70 text-slate-400 text-[11px] space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Explainable AI Core</span>
        </div>
        <p className="leading-snug text-slate-400 text-[10px]">
          Pattern-based indicators only. No punitive labels or automated disciplinary decisions.
        </p>
      </div>
    </aside>
  );
};
