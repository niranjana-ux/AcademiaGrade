import React, { useState, useEffect } from 'react';
import { Course, ExamSession, Faculty, MarkRecord, Student } from '../types';
import { StorageService } from '../services/storageService';
import { calculateGrade, DEFAULT_GRADING_RULES, exportToCSV } from '../utils/gradeCalculator';
import {
  BookOpen,
  Calendar,
  Save,
  Download,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Award,
  Users,
  Search,
} from 'lucide-react';
import { CsvUploadModal } from './CsvUploadModal';

interface FacultyPortalProps {
  onDataChanged: () => void;
}

interface EditableMarkRow {
  student: Student;
  internal: number | '';
  external: number | '';
  total: number;
  grade: string;
  gradePoint: number;
  creditPoints: number;
  isPassed: boolean;
  isDirty: boolean;
  hasError: boolean;
  errorMsg?: string;
}

export const FacultyPortal: React.FC<FacultyPortalProps> = ({ onDataChanged }) => {
  const facultyList = StorageService.getFaculty();
  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyList[0]?.id || '');
  const activeFaculty = facultyList.find((f) => f.id === selectedFacultyId) || facultyList[0];

  const allCourses = StorageService.getCourses();
  const assignedCourses = allCourses.filter((c) =>
    activeFaculty?.assignedCourseIds.includes(c.id) || c.departmentId === activeFaculty?.departmentId
  );

  const [selectedCourseId, setSelectedCourseId] = useState(assignedCourses[0]?.id || allCourses[0]?.id || '');
  const activeCourse = allCourses.find((c) => c.id === selectedCourseId) || allCourses[0];

  const examSessions = StorageService.getExamSessions();
  const [selectedExamId, setSelectedExamId] = useState(
    examSessions.find((e) => e.status === 'evaluation')?.id || examSessions[0]?.id || ''
  );
  const activeExam = examSessions.find((e) => e.id === selectedExamId) || examSessions[0];

  const students = StorageService.getStudents();
  // Filter students matching the course department and semester
  const enrolledStudents = students.filter(
    (s) => s.departmentId === activeCourse.departmentId && s.semester === activeCourse.semester
  );

  const [rows, setRows] = useState<EditableMarkRow[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load existing mark records into local editable rows
  useEffect(() => {
    if (!activeCourse || !activeExam) return;

    const existingMarks = StorageService.getMarkRecords().filter(
      (m) => m.courseId === activeCourse.id && m.examSessionId === activeExam.id
    );

    const markMap = new Map<string, MarkRecord>();
    existingMarks.forEach((m) => markMap.set(m.studentId, m));

    const initialRows: EditableMarkRow[] = enrolledStudents.map((student) => {
      const existing = markMap.get(student.id);
      if (existing) {
        return {
          student,
          internal: existing.internalMarks,
          external: existing.externalMarks,
          total: existing.totalMarks,
          grade: existing.grade,
          gradePoint: existing.gradePoint,
          creditPoints: existing.creditPoints,
          isPassed: existing.isPassed,
          isDirty: false,
          hasError: false,
        };
      } else {
        return {
          student,
          internal: '',
          external: '',
          total: 0,
          grade: '—',
          gradePoint: 0,
          creditPoints: 0,
          isPassed: false,
          isDirty: false,
          hasError: false,
        };
      }
    });

    setRows(initialRows);
  }, [selectedCourseId, selectedExamId, selectedFacultyId]);

  // Handle Mark Change for an individual student row
  const handleMarkChange = (studentId: string, field: 'internal' | 'external', rawValue: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.student.id !== studentId) return row;

        const numVal = rawValue === '' ? '' : parseFloat(rawValue);
        const newInternal = field === 'internal' ? numVal : row.internal;
        const newExternal = field === 'external' ? numVal : row.external;

        let hasError = false;
        let errorMsg = '';

        if (typeof newInternal === 'number') {
          if (newInternal < 0 || newInternal > activeCourse.maxInternalMarks) {
            hasError = true;
            errorMsg = `Internal must be 0–${activeCourse.maxInternalMarks}`;
          }
        }

        if (typeof newExternal === 'number') {
          if (newExternal < 0 || newExternal > activeCourse.maxExternalMarks) {
            hasError = true;
            errorMsg = `External must be 0–${activeCourse.maxExternalMarks}`;
          }
        }

        const validInternal = typeof newInternal === 'number' ? newInternal : 0;
        const validExternal = typeof newExternal === 'number' ? newExternal : 0;

        const calc = calculateGrade(validInternal, validExternal, activeCourse, DEFAULT_GRADING_RULES);

        return {
          ...row,
          internal: newInternal,
          external: newExternal,
          total: calc.totalMarks,
          grade: newInternal === '' && newExternal === '' ? '—' : calc.grade,
          gradePoint: calc.gradePoint,
          creditPoints: calc.creditPoints,
          isPassed: calc.isPassed,
          isDirty: true,
          hasError,
          errorMsg,
        };
      })
    );
  };

  // Save All Marks to Storage
  const handleSaveAll = () => {
    const hasAnyErrors = rows.some((r) => r.hasError);
    if (hasAnyErrors) {
      alert('Please fix out-of-range mark errors before saving.');
      return;
    }

    const recordsToSave: MarkRecord[] = rows
      .filter((r) => r.internal !== '' || r.external !== '')
      .map((r) => {
        const intVal = typeof r.internal === 'number' ? r.internal : 0;
        const extVal = typeof r.external === 'number' ? r.external : 0;
        const calc = calculateGrade(intVal, extVal, activeCourse, DEFAULT_GRADING_RULES);

        return {
          id: `mark-${r.student.id}-${activeCourse.id}-${activeExam.id}`,
          studentId: r.student.id,
          courseId: activeCourse.id,
          examSessionId: activeExam.id,
          internalMarks: intVal,
          externalMarks: extVal,
          totalMarks: calc.totalMarks,
          grade: calc.grade,
          gradePoint: calc.gradePoint,
          creditPoints: calc.creditPoints,
          isPassed: calc.isPassed,
          evaluatedBy: activeFaculty?.id,
          updatedAt: new Date().toISOString(),
        };
      });

    StorageService.saveMarkRecords(recordsToSave);
    setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
    setSaveSuccessMsg(`Successfully saved ${recordsToSave.length} student marks!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    onDataChanged();
  };

  // Download Blank CSV Template
  const handleDownloadTemplate = () => {
    const headers = ['RegisterNo', 'StudentName', 'InternalMarks', 'ExternalMarks'];
    const dataRows = enrolledStudents.map((s) => [s.registerNo, s.name, '', '']);
    exportToCSV(headers, dataRows, `MarksTemplate_${activeCourse.code}_${activeExam.name.replace(/\s+/g, '_')}`);
  };

  // Export Evaluated CSV
  const handleExportEvaluatedCSV = () => {
    const headers = ['RegisterNo', 'StudentName', 'InternalMarks', 'ExternalMarks', 'TotalMarks', 'Grade', 'GradePoint', 'Result'];
    const dataRows = rows.map((r) => [
      r.student.registerNo,
      r.student.name,
      r.internal === '' ? 0 : r.internal,
      r.external === '' ? 0 : r.external,
      r.total,
      r.grade,
      r.gradePoint,
      r.isPassed ? 'PASS' : 'FAIL',
    ]);
    exportToCSV(headers, dataRows, `EvaluatedMarks_${activeCourse.code}_${activeExam.name.replace(/\s+/g, '_')}`);
  };

  // Handle Marks applied from CSV Modal
  const handleApplyCsvMarks = (newRecords: MarkRecord[]) => {
    StorageService.saveMarkRecords(newRecords);
    onDataChanged();
    setSaveSuccessMsg(`Bulk imported ${newRecords.length} student marks from CSV!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Evaluation Statistics for current view
  const evaluatedCount = rows.filter((r) => r.internal !== '' || r.external !== '').length;
  const pendingCount = rows.length - evaluatedCount;
  const evaluatedRows = rows.filter((r) => r.internal !== '' || r.external !== '');
  const avgScore = evaluatedRows.length > 0
    ? Math.round((evaluatedRows.reduce((acc, r) => acc + r.total, 0) / evaluatedRows.length) * 10) / 10
    : 0;
  const passCount = evaluatedRows.filter((r) => r.isPassed).length;
  const passRate = evaluatedRows.length > 0 ? Math.round((passCount / evaluatedRows.length) * 100) : 0;

  const filteredRows = rows.filter((r) =>
    r.student.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.student.registerNo.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Faculty Selector & Context Strip */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm">
            {activeFaculty?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{activeFaculty?.name}</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-500 text-xs font-medium">{activeFaculty?.designation}</span>
            </div>
            <p className="text-[11px] text-slate-500">{activeFaculty?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Switch Evaluator:</span>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white font-medium"
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.departmentId.replace('dept-', '').toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course and Exam Session Selector Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Assigned Curriculum Course</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white font-medium"
            >
              {allCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name} (Sem {c.semester} · {c.credits} Credits)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Examination Session</span>
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white font-medium"
            >
              {examSessions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Evaluation KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px] block">Roster Size</span>
            <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
              {rows.length} Students
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px] block">Evaluated</span>
            <span className="font-mono font-bold text-blue-700 text-base tabular-nums">
              {evaluatedCount} / {rows.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px] block">Class Average</span>
            <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
              {avgScore} / 100
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px] block">Pass Rate</span>
            <span className="font-mono font-bold text-emerald-700 text-base tabular-nums">
              {passRate}%
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs col-span-2 sm:col-span-1">
            <span className="text-slate-500 text-[11px] block">Grading Limits</span>
            <span className="font-mono text-slate-700 text-xs">
              Int: {activeCourse.maxInternalMarks} | Ext: {activeCourse.maxExternalMarks}
            </span>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Action Toolbar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search students by name or roll number..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="Download blank CSV template for offline grading"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="Upload completed CSV spreadsheet"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportEvaluatedCSV}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
            title="Export full grade sheet to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Marks</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Mark Entry Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center w-32">
                  Internal ({activeCourse.maxInternalMarks})
                </th>
                <th className="py-3 px-4 text-center w-32">
                  External ({activeCourse.maxExternalMarks})
                </th>
                <th className="py-3 px-4 text-center w-24">Total (100)</th>
                <th className="py-3 px-4 text-center w-20">Grade</th>
                <th className="py-3 px-4 text-center w-24">Grade Point</th>
                <th className="py-3 px-4 text-center w-24">Result</th>
                <th className="py-3 px-4">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No enrolled students found for this department and semester.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.student.id}
                    className={`transition-colors ${
                      row.hasError
                        ? 'bg-red-50/70'
                        : row.isDirty
                        ? 'bg-blue-50/40'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-2 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-mono font-bold text-slate-900">
                      {row.student.registerNo}
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-800">
                      {row.student.name}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={activeCourse.maxInternalMarks}
                        step="0.5"
                        value={row.internal}
                        onChange={(e) =>
                          handleMarkChange(row.student.id, 'internal', e.target.value)
                        }
                        placeholder="0"
                        className={`w-20 px-2 py-1 text-center font-mono font-semibold rounded border text-xs tabular-nums focus:outline-hidden focus:ring-2 ${
                          row.hasError
                            ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-400'
                            : 'border-slate-300 text-slate-900 bg-white focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={activeCourse.maxExternalMarks}
                        step="0.5"
                        value={row.external}
                        onChange={(e) =>
                          handleMarkChange(row.student.id, 'external', e.target.value)
                        }
                        placeholder="0"
                        className={`w-20 px-2 py-1 text-center font-mono font-semibold rounded border text-xs tabular-nums focus:outline-hidden focus:ring-2 ${
                          row.hasError
                            ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-400'
                            : 'border-slate-300 text-slate-900 bg-white focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {row.internal !== '' || row.external !== '' ? row.total : '—'}
                    </td>
                    <td className="py-2 px-4 text-center font-bold">
                      {row.grade !== '—' ? (
                        <span
                          className={
                            row.grade === 'F'
                              ? 'text-red-600 font-extrabold'
                              : row.grade === 'O' || row.grade === 'A+'
                              ? 'text-emerald-700'
                              : 'text-slate-900'
                          }
                        >
                          {row.grade}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center font-mono text-slate-700 tabular-nums">
                      {row.internal !== '' || row.external !== '' ? row.gradePoint : '—'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {row.internal !== '' || row.external !== '' ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {row.isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {row.hasError ? (
                        <span className="text-red-600 text-[11px] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{row.errorMsg}</span>
                        </span>
                      ) : row.isDirty ? (
                        <span className="text-blue-600 text-[11px] font-medium">Unsaved edits</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Saved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {isCsvModalOpen && (
        <CsvUploadModal
          course={activeCourse}
          exam={activeExam}
          students={enrolledStudents}
          onApplyMarks={handleApplyCsvMarks}
          onClose={() => setIsCsvModalOpen(false)}
        />
      )}
    </div>
  );
};
