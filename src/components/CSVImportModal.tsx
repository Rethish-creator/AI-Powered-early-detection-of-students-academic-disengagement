import React, { useState, useRef } from 'react';
import { api } from '../services/api.ts';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Download, RefreshCw } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [summary, setSummary] = useState<{
    totalDetected: number;
    validCount: number;
    invalidCount: number;
    errors: { row: number; reason: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setError('CSV file must have a header line and at least one data row');
      return;
    }

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    setHeaders(rawHeaders);

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj: Record<string, any> = {};
      rawHeaders.forEach((h, index) => {
        rowObj[h] = values[index] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;
    try {
      setLoading(true);
      setError(null);

      const res = await api.bulkImportRecords(parsedRows);
      setSummary(res);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV dataset');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const headerLine = 'student_id,student_name,department,year,section,week,attendance,assignment_completion,assignment_delay,assessment_score,quiz_score,lms_activity,material_access,participation';
    const sampleRows = [
      'S109,Aditya Rao,Computer Science & Engineering,3,A,12,88,85,6,82,80,84,88,78',
      'S110,Ananya Sharma,Information Technology,2,B,12,94,92,4,89,86,91,95,85',
      'S111,Karan Desai,Electronics & Communication,4,C,12,68,62,25,65,60,58,60,62'
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headerLine, ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'academic_records_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Import Academic & Engagement Dataset
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload weekly student performance metrics (CSV) for automatic AI pattern evaluation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & drop upload area */}
          {!summary && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="font-semibold text-slate-800 text-sm">
                {file ? file.name : 'Click to upload or drag & drop CSV file'}
              </div>
              <p className="text-slate-500 mt-1">
                Supports standard academic CSV sheets with student metrics
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleTemplate();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && !summary && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">
                  Detected Rows: {parsedRows.length} records ready to import
                </span>
                <span className="text-slate-500">Previewing first 4 rows</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-2 border-b">ID</th>
                      <th className="p-2 border-b">Name</th>
                      <th className="p-2 border-b">Week</th>
                      <th className="p-2 border-b">Attendance</th>
                      <th className="p-2 border-b">Assignments</th>
                      <th className="p-2 border-b">Assessments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {parsedRows.slice(0, 4).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 font-mono font-medium text-slate-900">{row.student_id || row.studentId}</td>
                        <td className="p-2">{row.student_name || row.name || 'Student'}</td>
                        <td className="p-2">{row.week || row.weekNumber || 12}</td>
                        <td className="p-2">{row.attendance}%</td>
                        <td className="p-2">{row.assignment_completion || row.assignmentCompletion}%</td>
                        <td className="p-2">{row.assessment_score || row.assessmentScore || 80}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result Summary */}
          {summary && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Dataset Ingestion Summary</h4>
                  <div className="mt-1 space-y-0.5 text-xs text-emerald-800">
                    <p>Total Records Detected: <strong className="font-bold">{summary.totalDetected}</strong></p>
                    <p>Successfully Validated & Imported: <strong className="font-bold">{summary.validCount}</strong></p>
                    <p>Invalid / Skipped Records: <strong className="font-bold">{summary.invalidCount}</strong></p>
                  </div>
                </div>
              </div>

              {summary.errors && summary.errors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-semibold text-amber-900 mb-1">Row Validation Notes:</div>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800 text-[11px]">
                    {summary.errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-xs"
          >
            {summary ? 'Close' : 'Cancel'}
          </button>
          {!summary ? (
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || parsedRows.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating & Running AI Engine...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Records ({parsedRows.length})</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSummary(null);
                setFile(null);
                setParsedRows([]);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-xs"
            >
              Import Another File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
