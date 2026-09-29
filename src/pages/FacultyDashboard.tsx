import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Student, SystemAnalytics, RiskLevel } from '../types/index.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { InterventionModal } from '../components/InterventionModal.tsx';
import { AttractiveBackground, BackgroundVariant } from '../components/AttractiveBackground.tsx';
import { ImageStudioModal } from '../components/ImageStudioModal.tsx';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  ArrowRight,
  Filter,
  RefreshCw,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  BookOpen,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface FacultyDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [flaggedStudents, setFlaggedStudents] = useState<Student[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [sectionComparison, setSectionComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Modal
  const [interventionStudent, setInterventionStudent] = useState<Student | null>(null);
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [headerBg, setHeaderBg] = useState<BackgroundVariant>('clean-library');
  const [customHeaderBgUrl, setCustomHeaderBgUrl] = useState<string | undefined>(undefined);
  const [imageStudioOpen, setImageStudioOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDept, selectedSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, classRes, studentsRes] = await Promise.all([
        api.getAnalyticsOverview(selectedDept, selectedSection),
        api.getClassAnalytics(selectedDept, selectedSection),
        api.getStudents({
          department: selectedDept,
          section: selectedSection
        })
      ]);

      setAnalytics(overviewRes.analytics);
      setWeeklyTrends(classRes.weeklyTrends);
      setSectionComparison(classRes.sectionComparison);

      // Filter students with Attention or Priority Support
      const flagged = studentsRes.students.filter(
        s => s.currentRiskLevel === 'Attention' || s.currentRiskLevel === 'Priority Support'
      );
      setFlaggedStudents(flagged.slice(0, 8)); // Top 8 requiring review
    } catch (err: any) {
      setError(err.message || 'Failed to load faculty analytics');
    } finally {
      setLoading(false);
    }
  };

  // Distribution chart data
  const riskDistData = analytics
    ? [
        { name: 'Stable', count: analytics.stableCount, color: '#0d9488' },
        { name: 'Monitor', count: analytics.monitorCount, color: '#d97706' },
        { name: 'Attention', count: analytics.attentionCount, color: '#ea580c' },
        { name: 'Priority Support', count: analytics.prioritySupportCount, color: '#be123c' }
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Filter Controls with Subtle Academic Background Overlay */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <AttractiveBackground
          variant={headerBg}
          customImageUrl={customHeaderBgUrl}
          overlayStyle="bg-slate-900/70"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-semibold mb-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Real-Time Student Telemetry Active</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              Faculty Engagement Dashboard
            </h1>
            <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
              Longitudinal tracking of lecture attendance, coursework submissions, and LMS resource engagement.
            </p>
          </div>

          {/* Filters & Ambient Theme Selector */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
            {/* Background Theme Switcher */}
            <button
              onClick={() => {
                setCustomHeaderBgUrl(undefined);
                setHeaderBg(prev =>
                  prev === 'clean-library'
                    ? 'data-network'
                    : prev === 'data-network'
                    ? 'campus-quad'
                    : 'clean-library'
                );
              }}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 border border-white/10"
              title="Click to switch header backdrop: Clean Library / Data Network / Campus Quad"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {customHeaderBgUrl
                  ? 'Custom AI'
                  : headerBg === 'clean-library'
                  ? 'Library'
                  : headerBg === 'data-network'
                  ? 'Data Network'
                  : 'Campus Quad'}
              </span>
            </button>

            {/* AI Image Studio Button (Create & Edit Images) */}
            <button
              onClick={() => setImageStudioOpen(true)}
              className="px-2.5 py-1.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-1.5 border border-indigo-400/40 shadow-xs"
              title="Create & Edit Background Images with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Studio</span>
            </button>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold pl-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 text-xs font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Eng</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Comm</option>
            </select>

            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 text-xs font-medium"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            <button
              onClick={fetchDashboardData}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              title="Refresh Data"
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '-' : analytics?.totalStudents ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active monitored cohort
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-teal-800 text-[11px] font-bold uppercase tracking-wider">
            <span>Stable</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-950 mt-2">
            {loading ? '-' : analytics?.stableCount ?? 0}
          </div>
          <div className="text-[11px] text-teal-700 mt-1">
            Healthy engagement velocity
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase tracking-wider">
            <span>Monitor</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-2">
            {loading ? '-' : analytics?.monitorCount ?? 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Minor indicator deviation
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-200 bg-orange-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-orange-800 text-[11px] font-bold uppercase tracking-wider">
            <span>Attention</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-950 mt-2">
            {loading ? '-' : analytics?.attentionCount ?? 0}
          </div>
          <div className="text-[11px] text-orange-700 mt-1">
            Faculty review recommended
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold uppercase tracking-wider">
            <span>Priority Support</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-950 mt-2">
            {loading ? '-' : analytics?.prioritySupportCount ?? 0}
          </div>
          <div className="text-[11px] text-rose-700 mt-1">
            Multi-factor negative trend
          </div>
        </div>
      </div>

      {/* Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Weekly Trends (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                12-Week Longitudinal Engagement Trends
              </h3>
              <p className="text-xs text-slate-500">
                Weekly averages across attendance, assignment submissions, and LMS hours
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Cohort Aggregated
            </span>
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
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
                  name="Assignment Completion %"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="lms"
                  name="LMS Engagement %"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Indicator Distribution (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Engagement Risk Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Categorization based on multi-week trend deltas
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
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
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section Comparison */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Section-Level Engagement Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Comparative benchmark across Sections A, B, C, and D
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Department Wide</span>
        </div>

        <div className="h-56 w-full">
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

      {/* Flagged Students Priority Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <span>Students Requiring Academic Mentorship Review</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified by early negative changes in recent 2-week metrics
            </p>
          </div>

          <button
            onClick={() => onNavigate('student-list')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Students ({analytics?.totalStudents ?? 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Assignments</th>
                <th className="py-3 px-4">Assessments</th>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {flaggedStudents.map(student => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => onNavigate('student-detail', student.id)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {student.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    Yr {student.year} · Sec {student.section}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{student.attendanceAverage}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{student.assignmentCompletionAverage}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{student.assessmentAverage}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={student.currentRiskLevel} score={student.currentRiskScore} showScore size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigate('student-detail', student.id)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="View Detailed Explanation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setInterventionStudent(student);
                          setInterventionModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Support</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        student={interventionStudent}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      {/* AI Image Studio Modal for creating and editing background images */}
      <ImageStudioModal
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        onApplyImage={(url) => {
          setCustomHeaderBgUrl(url);
        }}
        currentImageUrl={customHeaderBgUrl}
      />
    </div>
  );
};
