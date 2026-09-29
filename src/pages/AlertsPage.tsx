import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { AlertItem } from '../types/index.ts';
import { InterventionModal } from '../components/InterventionModal.tsx';
import {
  BellRing,
  AlertTriangle,
  CheckCircle,
  Eye,
  PlusCircle,
  XCircle,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AlertsPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Reviewed' | 'Dismissed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal
  const [interventionStudentId, setInterventionStudentId] = useState<string>('');
  const [interventionStudentName, setInterventionStudentName] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAlerts();
      setAlerts(res.alerts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string) => {
    try {
      await api.reviewAlert(id);
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'Reviewed', reviewedAt: new Date().toISOString() } : a))
      );
    } catch {}
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissAlert(id);
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'Dismissed' } : a)));
    } catch {}
  };

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && a.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-600" />
            <span>Early Engagement Trend Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated signals triggered when recent student metrics diverge significantly from baseline
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="New">New Alerts</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Priority Support">Priority Support</option>
            <option value="Attention">Attention</option>
            <option value="Monitor">Monitor</option>
          </select>

          <button
            onClick={fetchAlerts}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Alert Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No active engagement alerts match the selected filters.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isPriority = alert.priority === 'Priority Support';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  alert.status === 'Dismissed'
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : isPriority
                    ? 'bg-rose-50/20 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {alert.studentId}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{alert.studentName}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-500">{alert.department} (Sec {alert.section})</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          isPriority
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}
                      >
                        Priority: {alert.priority}
                      </span>
                      {alert.status !== 'New' && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {alert.status}
                        </span>
                      )}
                    </div>

                    {/* Observed Metric Changes */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Observed Longitudinal Changes (Past 2 Weeks):
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {alert.observedChanges.map((change, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium"
                          >
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                            <span>{change}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                      <strong>Recommended Action:</strong> {alert.recommendedAction}
                    </div>

                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Logged {new Date(alert.createdAt).toLocaleString()}
                      {alert.reviewedBy && ` · Reviewed by ${alert.reviewedBy}`}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('student-detail', alert.studentId)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Student</span>
                    </button>

                    {alert.status === 'New' && (
                      <button
                        onClick={() => handleReview(alert.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Reviewed</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setInterventionStudentId(alert.studentId);
                        setInterventionStudentName(alert.studentName);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Support Plan</span>
                    </button>

                    {alert.status !== 'Dismissed' && (
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                        title="Dismiss Alert"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        student={{
          id: interventionStudentId,
          name: interventionStudentName,
          email: '',
          department: '',
          year: 3,
          section: 'A',
          semester: 5,
          mentorName: '',
          mentorEmail: '',
          currentRiskLevel: 'Attention',
          currentRiskScore: 65,
          attendanceAverage: 80,
          assignmentCompletionAverage: 75,
          assessmentAverage: 75,
          lmsActivityAverage: 75,
          participationAverage: 75,
          lastUpdated: '',
          patternType: 'stable'
        }}
        onSuccess={() => {
          fetchAlerts();
        }}
      />
    </div>
  );
};
