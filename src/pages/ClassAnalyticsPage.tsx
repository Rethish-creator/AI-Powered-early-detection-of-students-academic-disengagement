import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { SystemAnalytics } from '../types/index.ts';
import { AttractiveBackground } from '../components/AttractiveBackground.tsx';
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const ClassAnalyticsPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [sectionComparison, setSectionComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassData();
  }, [selectedDept, selectedSection]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, classRes] = await Promise.all([
        api.getAnalyticsOverview(selectedDept, selectedSection),
        api.getClassAnalytics(selectedDept, selectedSection)
      ]);
      setAnalytics(overviewRes.analytics);
      setWeeklyTrends(classRes.weeklyTrends);
      setSectionComparison(classRes.sectionComparison);
    } catch (err: any) {
      setError(err.message || 'Failed to load class analytics');
    } finally {
      setLoading(false);
    }
  };

  const riskDistribution = analytics
    ? [
        { name: 'Stable', count: analytics.stableCount, color: '#0d9488' },
        { name: 'Monitor', count: analytics.monitorCount, color: '#d97706' },
        { name: 'Attention', count: analytics.attentionCount, color: '#ea580c' },
        { name: 'Priority Support', count: analytics.prioritySupportCount, color: '#be123c' }
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Filter Bar with Academic Library Backdrop & bg-slate-900/70 Overlay */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <AttractiveBackground variant="clean-library" overlayStyle="bg-slate-900/70" imageOpacity={0.85} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-semibold mb-2 backdrop-blur-md">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Aggregate Cohort Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              Class-Level Academic & Engagement Analytics
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Cohort aggregate benchmarks across departments and sections (preserves individual student privacy).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs bg-slate-900/70 backdrop-blur-md p-2 rounded-xl border border-white/10">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication">ECE</option>
            </select>

            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            <button
              onClick={fetchClassData}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Attendance</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '-' : analytics?.averageAttendance ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cohort lecture participation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignment Avg</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '-' : analytics?.averageAssignmentCompletion ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Submission completion rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessment Avg</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '-' : analytics?.averageAssessmentScore ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Quizzes & internal exams</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LMS Activity Avg</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '-' : analytics?.averageLmsActivity ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Portal access index</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class Participation</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {loading ? '-' : analytics?.averageParticipation ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Lab & workshop involvement</div>
        </div>
      </div>

      {/* Row of Charts: Section Comparison & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Section Performance Benchmark (A vs B vs C vs D)
              </h3>
              <p className="text-xs text-slate-500">
                Comparative metrics across sections
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">All Sections</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="section" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assignments" name="Assignments %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assessments" name="Assessments %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicator Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Engagement Risk Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Cohort distribution by required faculty attention
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Total: {analytics?.totalStudents ?? 0} Students
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 12-Week Weekly Trajectory Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Class Weekly Engagement Trends (Weeks 1 to 12)
          </h3>
          <p className="text-xs text-slate-500">
            Cohort aggregate trajectories across the entire semester
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="assignments"
                name="Assignment %"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="assessments"
                name="Assessments %"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="lms"
                name="LMS %"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
