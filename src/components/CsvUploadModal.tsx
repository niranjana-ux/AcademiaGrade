import React, { useState } from 'react';
import { Course, ExamSession, MarkRecord, Student } from '../types';
import { parseCSV, calculateGrade, DEFAULT_GRADING_RULES } from '../utils/gradeCalculator';
import { X, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CsvUploadModalProps {
  course: Course;
  exam: ExamSession;
  students: Student[];
  onApplyMarks: (records: MarkRecord[]) => void;
  onClose: () => void;
}

interface ParsedEntry {
  student: Student;
  internal: number;
  external: number;
  total: number;
  grade: string;
  isPassed: boolean;
  isValid: boolean;
  errorMsg?: string;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  course,
  exam,
  students,
  onApplyMarks,
  onClose,
}) => {
  const [fileText, setFileText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [parseError, setParseError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileText(text);
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (text: string) => {
    try {
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setParseError('CSV file appears empty or missing header row.');
        setParsedEntries([]);
        return;
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const regIdx = headers.findIndex((h) => h.includes('register') || h.includes('roll') || h.includes('reg'));
      const intIdx = headers.findIndex((h) => h.includes('internal') || h.includes('int'));
      const extIdx = headers.findIndex((h) => h.includes('external') || h.includes('ext') || h.includes('end'));

      if (regIdx === -1 || intIdx === -1 || extIdx === -1) {
        setParseError('CSV headers must include RegisterNo, InternalMarks, and ExternalMarks columns.');
        setParsedEntries([]);
        return;
      }

      setParseError('');
      const entries: ParsedEntry[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length <= Math.max(regIdx, intIdx, extIdx)) continue;

        const regNo = row[regIdx]?.trim().toUpperCase();
        if (!regNo) continue;

        const matchedStudent = students.find((s) => s.registerNo.toUpperCase() === regNo);
        const internalVal = parseFloat(row[intIdx]);
        const externalVal = parseFloat(row[extIdx]);

        if (!matchedStudent) {
          entries.push({
            student: { id: '', registerNo: regNo, name: 'Unknown Student', email: '', departmentId: '', semester: 4, batchYear: '', phone: '', dateOfBirth: '', gender: 'Other' },
            internal: isNaN(internalVal) ? 0 : internalVal,
            external: isNaN(externalVal) ? 0 : externalVal,
            total: 0,
            grade: 'F',
            isPassed: false,
            isValid: false,
            errorMsg: `Student "${regNo}" not found in roster`,
          });
          continue;
        }

        if (isNaN(internalVal) || internalVal < 0 || internalVal > course.maxInternalMarks) {
          entries.push({
            student: matchedStudent,
            internal: isNaN(internalVal) ? 0 : internalVal,
            external: isNaN(externalVal) ? 0 : externalVal,
            total: 0,
            grade: 'F',
            isPassed: false,
            isValid: false,
            errorMsg: `Internal marks must be 0–${course.maxInternalMarks}`,
          });
          continue;
        }

        if (isNaN(externalVal) || externalVal < 0 || externalVal > course.maxExternalMarks) {
          entries.push({
            student: matchedStudent,
            internal: internalVal,
            external: isNaN(externalVal) ? 0 : externalVal,
            total: 0,
            grade: 'F',
            isPassed: false,
            isValid: false,
            errorMsg: `External marks must be 0–${course.maxExternalMarks}`,
          });
          continue;
        }

        const calc = calculateGrade(internalVal, externalVal, course, DEFAULT_GRADING_RULES);
        entries.push({
          student: matchedStudent,
          internal: internalVal,
          external: externalVal,
          total: calc.totalMarks,
          grade: calc.grade,
          isPassed: calc.isPassed,
          isValid: true,
        });
      }

      setParsedEntries(entries);
    } catch (err: any) {
      setParseError(`Failed to parse CSV: ${err.message || 'Malformed file'}`);
      setParsedEntries([]);
    }
  };

  const handleApply = () => {
    const validEntries = parsedEntries.filter((e) => e.isValid);
    if (validEntries.length === 0) return;

    const records: MarkRecord[] = validEntries.map((entry) => {
      const calc = calculateGrade(entry.internal, entry.external, course, DEFAULT_GRADING_RULES);
      return {
        id: `mark-${entry.student.id}-${course.id}-${exam.id}`,
        studentId: entry.student.id,
        courseId: course.id,
        examSessionId: exam.id,
        internalMarks: entry.internal,
        externalMarks: entry.external,
        totalMarks: calc.totalMarks,
        grade: calc.grade,
        gradePoint: calc.gradePoint,
        creditPoints: calc.creditPoints,
        isPassed: calc.isPassed,
        evaluatedBy: 'csv-batch-import',
        updatedAt: new Date().toISOString(),
      };
    });

    onApplyMarks(records);
    onClose();
  };

  const validCount = parsedEntries.filter((e) => e.isValid).length;
  const invalidCount = parsedEntries.filter((e) => !e.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm">Bulk Marks Import (CSV)</h3>
              <p className="text-[11px] text-slate-400">
                {course.code}: {course.name} · {exam.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* File input dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-slate-50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="font-semibold text-blue-600 hover:text-blue-700">Click to select CSV</span>
              <span className="text-slate-500 block text-[11px] mt-1">
                Required columns: <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">RegisterNo</code>,{' '}
                <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">InternalMarks</code>,{' '}
                <code className="font-mono bg-white px-1 py-0.5 border border-slate-200 rounded">ExternalMarks</code>
              </span>
            </label>
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedEntries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Parsed Data Preview ({parsedEntries.length} records found)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {invalidCount} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Register No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3 text-center">Internal (40)</th>
                      <th className="py-2 px-3 text-center">External (60)</th>
                      <th className="py-2 px-3 text-center">Total</th>
                      <th className="py-2 px-3 text-center">Grade</th>
                      <th className="py-2 px-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedEntries.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{item.student.registerNo}</td>
                        <td className="py-1.5 px-3 text-slate-700">{item.student.name}</td>
                        <td className="py-1.5 px-3 text-center font-mono tabular-nums">{item.internal}</td>
                        <td className="py-1.5 px-3 text-center font-mono tabular-nums">{item.external}</td>
                        <td className="py-1.5 px-3 text-center font-mono font-bold tabular-nums">
                          {item.isValid ? item.total : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-center font-bold">
                          {item.isValid ? (
                            <span className={item.grade === 'F' ? 'text-red-600' : 'text-slate-900'}>
                              {item.grade}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-1.5 px-3">
                          {item.isValid ? (
                            <span className="text-emerald-700 text-[11px] font-medium">Valid</span>
                          ) : (
                            <span className="text-red-600 text-[11px] font-medium">{item.errorMsg}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={validCount === 0}
            className={`px-4 py-2 font-semibold rounded-lg transition-colors text-xs shadow-xs ${
              validCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Import {validCount} Valid Marks
          </button>
        </div>
      </div>
    </div>
  );
};
