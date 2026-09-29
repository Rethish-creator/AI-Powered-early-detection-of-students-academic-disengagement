import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Student, RiskLevel } from '../types/index.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { InterventionModal } from '../components/InterventionModal.tsx';
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface StudentListPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const StudentListPage: React.FC<StudentListPageProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof Student>('currentRiskScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Intervention modal
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedSection, selectedYear, selectedRisk]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudents({
        department: selectedDept,
        section: selectedSection,
        year: selectedYear !== 'All' ? Number(selectedYear) : undefined,
        riskLevel: selectedRisk !== 'All' ? selectedRisk : undefined
      });
      setStudents(res.students);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search & sort
  const filteredStudents = students
    .filter(s => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.department.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for numerical risk
    }
  };

  const exportCSV = () => {
    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Department',
      'Year',
      'Section',
      'Attendance %',
      'Assignments %',
      'Assessments %',
      'LMS Activity %',
      'Risk Score',
      'Risk Level'
    ];

    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`,
      s.email,
      `"${s.department}"`,
      s.year,
      s.section,
      s.attendanceAverage,
      s.assignmentCompletionAverage,
      s.assessmentAverage,
      s.lmsActivityAverage,
      s.currentRiskScore,
      s.currentRiskLevel
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_engagement_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Monitored Student Cohort
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full class roster with attendance, assignment velocity, and explainable indicators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchStudents}
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID (e.g. S023), name, email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication">ECE</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-medium"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs font-medium"
            >
              <option value="All">All Indicator Levels</option>
              <option value="Stable">Stable</option>
              <option value="Monitor">Monitor</option>
              <option value="Attention">Attention</option>
              <option value="Priority Support">Priority Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Class</th>
                <th
                  onClick={() => handleSort('attendanceAverage')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assignmentCompletionAverage')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Assignments</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assessmentAverage')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Assessments</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lmsActivityAverage')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>LMS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentRiskScore')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Engagement Indicator</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No student records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => onNavigate('student-detail', student.id)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-indigo-600">
                      {student.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{student.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{student.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {student.department.includes('Computer') ? 'CSE' : student.department.includes('Info') ? 'IT' : 'ECE'}
                      </span>
                      <span className="text-slate-400 ml-1">· Sec {student.section}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${student.attendanceAverage < 75 ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                        {student.attendanceAverage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${student.assignmentCompletionAverage < 70 ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                        {student.assignmentCompletionAverage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {student.assessmentAverage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {student.lmsActivityAverage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge
                        level={student.currentRiskLevel}
                        score={student.currentRiskScore}
                        showScore
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('student-detail', student.id)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Student File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveStudent(student);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Support</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of{' '}
            <strong className="font-bold text-slate-800">{filteredStudents.length}</strong> students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        student={activeStudent}
        onSuccess={() => {
          fetchStudents();
        }}
      />
    </div>
  );
};
