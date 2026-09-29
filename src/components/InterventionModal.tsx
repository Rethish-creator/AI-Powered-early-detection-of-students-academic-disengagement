import React, { useState } from 'react';
import { Intervention, Student } from '../types/index.ts';
import { api } from '../services/api.ts';
import { X, Calendar, UserCheck, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (intervention: Intervention) => void;
  student?: Student | null;
  existingIntervention?: Intervention | null;
}

const INTERVENTION_TYPES: Intervention['interventionType'][] = [
  'Mentor Meeting',
  'Assignment Support',
  'Study Planning',
  'Peer Tutoring',
  'Additional Learning Resources',
  'Remedial Support',
  'Follow-up Meeting'
];

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  existingIntervention
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState(student?.id || existingIntervention?.studentId || '');
  const [studentName, setStudentName] = useState(student?.name || existingIntervention?.studentName || '');
  const [interventionType, setInterventionType] = useState<Intervention['interventionType']>(
    existingIntervention?.interventionType || 'Mentor Meeting'
  );
  const [description, setDescription] = useState(
    existingIntervention?.description ||
      'Review recent academic engagement indicator trends and collaborate on a support action plan.'
  );
  const [assignedMentor, setAssignedMentor] = useState(
    existingIntervention?.assignedMentor || student?.mentorName || 'Dr. Elena Rostova'
  );
  const [assignedMentorEmail, setAssignedMentorEmail] = useState(
    existingIntervention?.assignedMentorEmail || student?.mentorEmail || 'elena.rostova@edu.example.org'
  );
  const [scheduledDate, setScheduledDate] = useState(
    existingIntervention?.scheduledDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [followUpDate, setFollowUpDate] = useState(
    existingIntervention?.followUpDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<Intervention['status']>(
    existingIntervention?.status || 'Scheduled'
  );
  const [outcome, setOutcome] = useState(existingIntervention?.outcome || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Student ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (existingIntervention) {
        const res = await api.updateIntervention(existingIntervention.id, {
          interventionType,
          description,
          assignedMentor,
          assignedMentorEmail,
          scheduledDate,
          followUpDate,
          status,
          outcome
        });
        onSuccess(res.intervention);
      } else {
        const res = await api.createIntervention({
          studentId,
          studentName,
          interventionType,
          description,
          assignedMentor,
          assignedMentorEmail,
          scheduledDate,
          followUpDate,
          status,
          outcome
        });
        onSuccess(res.intervention);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save intervention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {existingIntervention ? 'Update Academic Support Plan' : 'Create Academic Support Intervention'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted educational assistance and faculty mentorship
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                disabled={!!student || !!existingIntervention}
                placeholder="e.g. S023"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="e.g. Priya Patel"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention Type</label>
            <select
              value={interventionType}
              onChange={e => setInterventionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              {INTERVENTION_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Goal</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the collaborative support strategy..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Mentor</label>
              <input
                type="text"
                value={assignedMentor}
                onChange={e => setAssignedMentor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Outcome & Follow-up Notes (Optional)
            </label>
            <input
              type="text"
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="e.g. Student attended, agreed on revised timetable and TA tutoring"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{existingIntervention ? 'Update Plan' : 'Confirm Intervention'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
