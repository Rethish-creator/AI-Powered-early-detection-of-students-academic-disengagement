import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Student, AcademicRecord, RiskPrediction, Intervention } from '../types/index.ts';
import { AttractiveBackground } from '../components/AttractiveBackground.tsx';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Compass,
  ArrowRight
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

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.studentId || 'S023';

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportRes, intRes] = await Promise.all([
        api.getStudentReport(studentId),
        api.getInterventions()
      ]);

      setStudent(reportRes.student);
      setRecords(reportRes.weeklyRecords);
      setPrediction(reportRes.aiEvaluation);
      setInterventions(intRes.interventions.filter(i => i.studentId === studentId));
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve your learning portal records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading your learning engagement portal...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-3">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
          {error || 'Student records unavailable'}
        </div>
      </div>
    );
  }

  // Generate encouraging, growth-oriented feedback based on recent deltas
  const supportiveInsights = [];
  const latestRecords = records.slice(-2);
  const prevRecords = records.slice(-4, -2);

  const currentAtt = latestRecords.reduce((acc, r) => acc + r.attendance, 0) / (latestRecords.length || 1);
  const prevAtt = prevRecords.reduce((acc, r) => acc + r.attendance, 0) / (prevRecords.length || 1);

  const currentAssign = latestRecords.reduce((acc, r) => acc + r.assignmentCompletion, 0) / (latestRecords.length || 1);
  const prevAssign = prevRecords.reduce((acc, r) => acc + r.assignmentCompletion, 0) / (prevRecords.length || 1);

  if (currentAssign < prevAssign - 10) {
    supportiveInsights.push({
      type: 'tip',
      icon: Clock,
      title: 'Upcoming Assignment Deadlines',
      message: 'Your assignment completion has dipped slightly over the last 2 weeks. Consider reviewing upcoming coursework deadlines or dropping by faculty office hours.'
    });
  } else {
    supportiveInsights.push({
      type: 'positive',
      icon: CheckCircle2,
      title: 'Steady Assignment Rhythm',
      message: 'You have been submitting your coursework consistently. Keep building on this positive momentum!'
    });
  }

  if (currentAtt < prevAtt - 10) {
    supportiveInsights.push({
      type: 'tip',
      icon: Calendar,
      title: 'Class Attendance Check-in',
      message: 'We noticed a few missed lectures recently. If you have any schedule conflicts or need assistance catching up on notes, your mentor Dr. Elena Rostova is here to support you.'
    });
  } else {
    supportiveInsights.push({
      type: 'positive',
      icon: TrendingUp,
      title: 'Solid Classroom Presence',
      message: 'Your lecture attendance has been steady over the past 3 weeks. Consistent classroom engagement pays dividends during exams!'
    });
  }

  const chartData = records.map(r => ({
    week: `Wk ${r.weekNumber}`,
    attendance: r.attendance,
    assignments: r.assignmentCompletion,
    assessments: r.assessmentScore,
    lms: r.lmsActivity
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Student Welcome Header with Student Collab Hub Backdrop & bg-slate-900/70 Overlay */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <AttractiveBackground variant="learning-hub" overlayStyle="bg-slate-900/70" imageOpacity={0.85} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/40 text-indigo-200 text-xs font-semibold mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Personal Academic Engagement Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
              Welcome back, {student.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Track your learning consistency, view positive study feedback, and coordinate with your faculty mentor.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-xs shadow-lg">
            <div className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
              Enrolled Term
            </div>
            <div className="font-bold text-white mt-0.5">{student.department}</div>
            <div className="text-indigo-200 text-[11px]">
              Year {student.year} · Section {student.section} (ID: {student.id})
            </div>
          </div>
        </div>
      </div>

      {/* 5 Personal Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{student.attendanceAverage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Lectures & labs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignments</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{student.assignmentCompletionAverage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Submitted tasks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessments</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{student.assessmentAverage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Quizzes & tests</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LMS Activity</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{student.lmsActivityAverage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Course materials</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Participation</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{student.participationAverage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Interactive sessions</div>
        </div>
      </div>

      {/* Constructive, Non-Punitive Feedback Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Supportive Learning Observations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportiveInsights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{insight.title}</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Engagement Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Your 12-Week Academic Trajectory
          </h3>
          <p className="text-xs text-slate-500">
            Track your semester progress across lectures, assignments, and online learning modules
          </p>
        </div>

        <div className="h-64 w-full">
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
                dataKey="lms"
                name="LMS Engagement %"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scheduled Faculty Support & Mentorship Sessions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <span>Faculty Support & Mentorship Sessions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Personalized guidance organized by your department mentor
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Mentor: <strong className="text-slate-800">{student.mentorName}</strong>
          </div>
        </div>

        {interventions.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
            No pending support meetings scheduled at this time. You are welcome to reach out to {student.mentorEmail} for office hours!
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-slate-200 bg-indigo-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.interventionType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{item.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Scheduled for: <strong>{item.scheduledDate}</strong> with {item.assignedMentor}
                  </div>
                </div>

                <div className="text-xs text-indigo-700 font-semibold bg-white px-3 py-1.5 rounded-md border border-indigo-200 shadow-2xs flex-shrink-0 text-center">
                  Confirmed on Calendar
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Student Privacy Guaranteed:</strong> You are the only student with access to this view. Academic indicators are used exclusively by educators to provide timely support and will never impact disciplinary evaluations.
        </p>
      </div>
    </div>
  );
};
