import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Student, AcademicRecord, RiskPrediction, Intervention } from '../types/index.ts';
import { ExplainableAIPanel } from '../components/ExplainableAIPanel.tsx';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { InterventionModal } from '../components/InterventionModal.tsx';
import {
  ArrowLeft,
  Calendar,
  Mail,
  GraduationCap,
  Clock,
  PlusCircle,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  HeartHandshake,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface StudentDetailPageProps {
  studentId: string;
  onNavigate: (view: string, data?: any) => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  studentId,
  onNavigate
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intervention Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const [detailRes, intRes] = await Promise.all([
        api.getStudentReport(studentId),
        api.getInterventions()
      ]);

      setStudent(detailRes.student);
      setRecords(detailRes.weeklyRecords);
      setPrediction(detailRes.aiEvaluation);

      const studentInts = intRes.interventions.filter(i => i.studentId === studentId);
      setInterventions(studentInts);
    } catch (err: any) {
      setError(err.message || 'Failed to load student record');
    } finally {
      setLoading(false);
    }
  };

  const exportStudentPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading student record and computing AI indicators...
      </div>
    );
  }

  if (error || !student || !prediction) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
          {error || 'Student not found'}
        </div>
        <button
          onClick={() => onNavigate('student-list')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Student Roster</span>
        </button>
      </div>
    );
  }

  // Format chart data
  const chartData = records.map(r => ({
    week: `Wk ${r.weekNumber}`,
    attendance: r.attendance,
    assignments: r.assignmentCompletion,
    delay: r.assignmentDelayRate,
    assessments: r.assessmentScore,
    lms: r.lmsActivity,
    participation: r.participation
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('student-list')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={exportStudentPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Student Dossier</span>
          </button>
          <button
            onClick={() => {
              setSelectedIntervention(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Support Plan</span>
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-xl flex-shrink-0">
              {student.id}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <RiskBadge
                  level={student.currentRiskLevel}
                  score={student.currentRiskScore}
                  showScore
                  size="md"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span>{student.email}</span>
                <span>•</span>
                <span>{student.department}</span>
                <span>•</span>
                <span>Year {student.year} · Section {student.section}</span>
                <span>•</span>
                <span>Semester {student.semester}</span>
              </div>
            </div>
          </div>

          {/* Mentor Details Box */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs text-slate-600 md:text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Faculty Mentor
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{student.mentorName}</div>
            <div className="text-slate-500 font-mono text-[11px]">{student.mentorEmail}</div>
          </div>
        </div>

        {/* 5 Longitudinal Metric KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500">Attendance Avg</div>
            <div className="text-xl font-black text-slate-900 mt-1">{student.attendanceAverage}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">12 Weeks Lecture Log</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500">Assignment Completion</div>
            <div className="text-xl font-black text-slate-900 mt-1">{student.assignmentCompletionAverage}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Coursework velocity</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500">Assessment Average</div>
            <div className="text-xl font-black text-slate-900 mt-1">{student.assessmentAverage}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Exams & quizzes</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500">LMS Activity Avg</div>
            <div className="text-xl font-black text-slate-900 mt-1">{student.lmsActivityAverage}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Resource downloads</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500">Class Participation</div>
            <div className="text-xl font-black text-slate-900 mt-1">{student.participationAverage}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Seminar & lab sessions</div>
          </div>
        </div>
      </div>

      {/* Section 10 & 28: Explainable AI Panel */}
      <ExplainableAIPanel prediction={prediction} studentName={student.name} />

      {/* 12-Week Longitudinal Multi-Line Charts */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Longitudinal Metric Trends (Weeks 1 to 12)
            </h3>
            <p className="text-xs text-slate-500">
              Observe metric trajectories and compare early baseline against recent weeks
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
              <span>Attendance</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
              <span>Assignments</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-teal-600 rounded-full" />
              <span>LMS Activity</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="attendance"
                name="Attendance %"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="assignments"
                name="Assignments %"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="assessments"
                name="Assessments %"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="lms"
                name="LMS %"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Support Interventions Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <span>Active Academic Interventions & Mentorship Logs</span>
            </h3>
            <p className="text-xs text-slate-500">
              Coordinated educational assistance, scheduled check-ins, and follow-up notes
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedIntervention(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Action Plan</span>
          </button>
        </div>

        {interventions.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
            No active interventions recorded for {student.name}. Click "Create Support Plan" to schedule a mentor meeting or tutoring session.
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.interventionType}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Scheduled'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Mentor: {item.assignedMentor}</span>
                    <span>•</span>
                    <span>Scheduled: {item.scheduledDate}</span>
                    <span>•</span>
                    <span>Follow-up: {item.followUpDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.outcome && (
                    <div className="text-[11px] bg-slate-50 px-2.5 py-1 rounded text-slate-600 max-w-xs truncate">
                      Outcome: {item.outcome}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedIntervention(item);
                      setModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    Edit / Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        student={student}
        existingIntervention={selectedIntervention}
        onSuccess={() => {
          fetchStudentProfile();
        }}
      />
    </div>
  );
};
