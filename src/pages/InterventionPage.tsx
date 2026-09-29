import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Intervention } from '../types/index.ts';
import { InterventionModal } from '../components/InterventionModal.tsx';
import {
  HeartHandshake,
  PlusCircle,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Edit,
  ArrowRight
} from 'lucide-react';

interface InterventionPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const InterventionPage: React.FC<InterventionPageProps> = ({ onNavigate }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Intervention['status']>('All');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getInterventions();
      setInterventions(res.interventions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interventions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = interventions.filter(item => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.studentId.toLowerCase().includes(q) ||
      item.studentName.toLowerCase().includes(q) ||
      item.interventionType.toLowerCase().includes(q) ||
      item.assignedMentor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <span>Academic Support & Intervention Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate faculty mentorship, tutoring assistance, study planning, and track milestone outcomes
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedIntervention(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Support Plan</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by student ID, student name, mentor..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-xs"
          >
            <option value="All">All Statuses ({interventions.length})</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Follow-up Required">Follow-up Required</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={fetchInterventions}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Intervention List Cards */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No active support plans found matching current search.
          </div>
        ) : (
          filtered.map(item => {
            const statusConfig = {
              'Scheduled': 'bg-indigo-50 text-indigo-700 border-indigo-200',
              'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
              'Follow-up Required': 'bg-orange-50 text-orange-800 border-orange-200',
              'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }[item.status];

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {item.studentId}
                    </span>
                    <button
                      onClick={() => onNavigate('student-detail', item.studentId)}
                      className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                    >
                      {item.studentName}
                    </button>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                      {item.interventionType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusConfig}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Mentor: <strong className="text-slate-600">{item.assignedMentor}</strong></span>
                    <span>•</span>
                    <span>Scheduled: <strong className="text-slate-600">{item.scheduledDate}</strong></span>
                    <span>•</span>
                    <span>Follow-up: <strong className="text-slate-600">{item.followUpDate}</strong></span>
                  </div>

                  {item.outcome && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200 text-emerald-900 text-xs mt-1">
                      <strong>Recorded Outcome:</strong> {item.outcome}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onNavigate('student-detail', item.studentId)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    View Student File
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIntervention(item);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <InterventionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        existingIntervention={selectedIntervention}
        onSuccess={() => {
          fetchInterventions();
        }}
      />
    </div>
  );
};
