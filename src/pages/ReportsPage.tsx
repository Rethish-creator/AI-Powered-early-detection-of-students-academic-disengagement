import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { SystemAnalytics, Student } from '../types/index.ts';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'class' | 'student'>('class');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedStudentId, setSelectedStudentId] = useState('S023');
  const [students, setStudents] = useState<Student[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, selectedDept, selectedSection, selectedStudentId]);

  const fetchInitialData = async () => {
    try {
      const res = await api.getStudents();
      setStudents(res.students);
    } catch {}
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      if (reportType === 'class') {
        const res = await api.getClassReport(selectedDept, selectedSection);
        setReportData(res);
      } else {
        const res = await api.getStudentReport(selectedStudentId);
        setReportData(res);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;

    if (reportType === 'class') {
      const headers = ['Student ID', 'Name', 'Department', 'Section', 'Attendance', 'Assignments', 'Assessments', 'Risk Level', 'Risk Score'];
      const rows = (reportData.studentsList || []).map((s: any) => [
        s.id,
        `"${s.name}"`,
        `"${s.department}"`,
        s.section,
        s.attendance,
        s.assignments,
        s.assessments,
        s.riskLevel,
        s.riskScore
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const encoded = encodeURI(csvContent);
      const link = document.createElement('a');
      link.href = encoded;
      link.download = `academic_class_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const s = reportData.student;
      const headers = ['Week', 'Attendance', 'Assignments', 'Assessments', 'LMS Activity', 'Participation'];
      const rows = (reportData.weeklyRecords || []).map((r: any) => [
        r.weekNumber,
        r.attendance,
        r.assignmentCompletion,
        r.assessmentScore,
        r.lmsActivity,
        r.participation
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [`Student ID: ${s.id}`, `Student Name: "${s.name}"`, `Risk Level: ${s.currentRiskLevel}`, '', headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const encoded = encodeURI(csvContent);
      const link = document.createElement('a');
      link.href = encoded;
      link.download = `student_engagement_${s.id}_report.csv`;
      link.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Academic Engagement & Review Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal documentation for departmental review, mentoring committees, and academic audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Control Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Report Target</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportType('class')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                reportType === 'class' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Class & Department Overview
            </button>
            <button
              onClick={() => setReportType('student')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                reportType === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Individual Student Dossier
            </button>
          </div>
        </div>

        {reportType === 'class' ? (
          <>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Communication">ECE</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.name} ({s.department.includes('Computer') ? 'CSE' : 'IT'}-{s.section})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none space-y-6 text-xs text-slate-800">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
              Institutional Academic Report
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              {reportType === 'class' ? 'Cohort Academic Engagement Summary' : `Student Engagement Dossier: ${reportData?.student?.name}`}
            </h2>
            <p className="text-slate-500 mt-1">
              Generated on {new Date().toLocaleDateString()} · Spring Semester 2025
            </p>
          </div>

          <div className="text-right text-slate-500">
            <div className="font-bold text-slate-800">Faculty Review Required</div>
            <div className="text-[10px] text-slate-400">Strictly Confidential</div>
          </div>
        </div>

        {reportData && reportType === 'class' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Cohort Size</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{reportData.studentCount} Students</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Avg Attendance</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{reportData.analytics?.averageAttendance}%</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Assignment Rate</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{reportData.analytics?.averageAssignmentCompletion}%</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Recorded Support Plans</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{reportData.interventionsCount} Plans</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                Individual Indicator Breakdown
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-2 border-b">ID</th>
                      <th className="p-2 border-b">Name</th>
                      <th className="p-2 border-b">Class</th>
                      <th className="p-2 border-b">Attendance</th>
                      <th className="p-2 border-b">Assignments</th>
                      <th className="p-2 border-b">Assessments</th>
                      <th className="p-2 border-b">Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.studentsList?.slice(0, 15).map((s: any) => (
                      <tr key={s.id}>
                        <td className="p-2 font-mono font-bold text-slate-900">{s.id}</td>
                        <td className="p-2 font-medium">{s.name}</td>
                        <td className="p-2 text-slate-500">{s.section}</td>
                        <td className="p-2">{s.attendance}%</td>
                        <td className="p-2">{s.assignments}%</td>
                        <td className="p-2">{s.assessments}%</td>
                        <td className="p-2 font-bold">{s.riskLevel} ({s.riskScore})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 italic">
                Previewing top 15 records. Complete cohort export available via CSV.
              </div>
            </div>
          </div>
        )}

        {reportData && reportType === 'student' && reportData.student && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500">Student ID</span>
                <div className="font-mono font-black text-base text-slate-900">{reportData.student.id}</div>
              </div>
              <div>
                <span className="text-slate-500">Department</span>
                <div className="font-bold text-slate-900">{reportData.student.department}</div>
              </div>
              <div>
                <span className="text-slate-500">Engagement Indicator</span>
                <div className="font-bold text-orange-700">{reportData.student.currentRiskLevel} ({reportData.student.currentRiskScore}/100)</div>
              </div>
              <div>
                <span className="text-slate-500">Assigned Mentor</span>
                <div className="font-bold text-slate-900">{reportData.student.mentorName}</div>
              </div>
            </div>

            {/* Explainable Factors */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                Observed Factors in Recent 2-Week Window
              </h3>
              <div className="space-y-2">
                {reportData.aiEvaluation?.factors?.map((f: any, idx: number) => (
                  <div key={idx} className="p-2.5 border rounded-lg bg-white flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-900">{f.factor}: </strong>
                      <span className="text-slate-600">{f.previous}% → {f.current}% ({f.change}%)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded">
                      Impact: {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                Suggested Academic Support Interventions
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                {reportData.aiEvaluation?.recommendations?.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer Disclaimers */}
        <div className="pt-6 border-t text-[10px] text-slate-400 space-y-1">
          <p>
            <strong>Privacy & Ethics Assurance:</strong> This platform evaluates academic and engagement indicators to support timely educational intervention.
            AI-generated indicators are informational and should be reviewed by authorized faculty or mentors before any action is taken.
          </p>
        </div>
      </div>
    </div>
  );
};
