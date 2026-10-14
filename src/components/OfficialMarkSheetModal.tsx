import React, { useState } from 'react';
import { Printer, X, Award, ShieldCheck, Download } from 'lucide-react';
import { Course, ExamSession, StudentTranscript } from '../types';
import crestImage from '../assets/images/university_crest_seal_1791952957414.jpg';

interface OfficialMarkSheetModalProps {
  transcript: StudentTranscript;
  selectedSemester?: number;
  courses: Course[];
  exams: ExamSession[];
  onClose: () => void;
}

export const OfficialMarkSheetModal: React.FC<OfficialMarkSheetModalProps> = ({
  transcript,
  selectedSemester,
  courses,
  exams,
  onClose,
}) => {
  const { student, department, semesterSummaries, cgpa, cumulativeCredits, classification } = transcript;

  // If a specific semester is chosen, display that semester; otherwise display the latest
  const targetSummary = selectedSemester
    ? semesterSummaries.find((s) => s.semester === selectedSemester) || semesterSummaries[semesterSummaries.length - 1]
    : semesterSummaries[semesterSummaries.length - 1];

  const targetMarks = targetSummary ? targetSummary.marks : [];
  const currentExam = exams.find((e) => e.semester === (targetSummary?.semester || student.semester));

  const [printNotice, setPrintNotice] = useState<string | null>(null);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setPrintNotice('Print preview is restricted in sandboxed iframes. Use your browser Print option to save as PDF.');
    }
  };

  const serialNo = `AG-2026-${student.registerNo}-${targetSummary?.semester || 1}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl my-8 overflow-hidden border border-slate-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-sm">Official University Mark Sheet Preview</h3>
              <p className="text-xs text-slate-400">Verifiable Academic Record · UGC 10-Point Scale</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Mark Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {printNotice && (
          <div className="no-print p-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-6">
            {printNotice}
          </div>
        )}

        {/* Printable Mark Sheet Document Body */}
        <div className="print-page-container p-8 sm:p-12 bg-white text-slate-900 font-sans">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-center justify-between gap-6">
              <img
                src={crestImage}
                alt="University Crest"
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-contain shrink-0"
              />
              <div className="text-center flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
                  Apex Institute of Technology & Science
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                  (Autonomous Institution Affiliated with National University · Accredited Grade 'A++')
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic Administrative Complex, University Enclave · ISO 9001:2015 Certified
                </p>
                <div className="inline-block mt-3 px-4 py-1 border border-slate-900 font-bold text-xs uppercase tracking-wider bg-slate-50">
                  Grade Card & Statement of Marks
                </div>
              </div>
              <div className="w-20 text-right shrink-0">
                <div className="p-2 border border-slate-200 bg-slate-50 text-[10px] text-center font-mono rounded">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <span>SECURE</span>
                  <div className="text-[9px] text-slate-400 truncate">QR-VERIFIED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Student & Examination Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6">
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Candidate Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Register Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">{student.registerNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Degree & Department</span>
              <span className="font-semibold text-slate-900">B.Tech - {department.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Academic Year / Batch</span>
              <span className="font-medium text-slate-900">{student.batchYear}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Semester</span>
              <span className="font-bold text-slate-900">Semester {targetSummary?.semester || student.semester}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Examination Session</span>
              <span className="font-medium text-slate-900">{currentExam?.name || 'Regular Semester Exams 2026'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Date of Declaration</span>
              <span className="font-medium text-slate-900">{currentExam?.publishedAt || '15 June 2026'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium text-[10px]">Transcript Serial</span>
              <span className="font-mono text-slate-700 text-[11px]">{serialNo}</span>
            </div>
          </div>

          {/* Statement of Marks Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 uppercase font-bold text-[11px] border-b border-slate-300">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">S.No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-24">Course Code</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Course Title</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Credits</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Internal (40)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">External (60)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Total (100)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Grade</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">Grade Point</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">Credit Points</th>
                  <th className="py-2.5 px-3 text-center w-16">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {targetMarks.map((mark, idx) => {
                  const course = courses.find((c) => c.id === mark.courseId);
                  return (
                    <tr key={mark.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-900">
                        {course?.code || 'N/A'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-800">
                        {course?.name || 'Academic Course'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">
                        {course?.credits || 3}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                        {mark.internalMarks}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                        {mark.externalMarks}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold tabular-nums">
                        {mark.totalMarks}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                        <span className={mark.grade === 'F' ? 'text-red-600 font-extrabold' : 'text-slate-900'}>
                          {mark.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">
                        {mark.gradePoint}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-semibold">
                        {mark.creditPoints}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[11px]">
                        <span className={mark.isPassed ? 'text-emerald-700' : 'text-red-600'}>
                          {mark.isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Semester & Cumulative Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-slate-300 rounded-lg bg-slate-50/50 mb-6 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                Current Semester Performance (Sem {targetSummary?.semester || student.semester})
              </h4>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Total Registered Credits:</span>
                <span className="font-mono font-semibold text-slate-900">{targetSummary?.totalCredits || 0}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Earned Credits:</span>
                <span className="font-mono font-semibold text-slate-900">{targetSummary?.earnedCredits || 0}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Total Credit Points (TCP):</span>
                <span className="font-mono font-semibold text-slate-900">{targetSummary?.totalCreditPoints || 0}</span>
              </div>
              <div className="flex justify-between py-0.5 pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">Semester Grade Point Average (SGPA):</span>
                <span className="font-mono font-bold text-sm text-blue-700">{targetSummary?.sgpa.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                Cumulative Academic Standing
              </h4>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Cumulative Earned Credits:</span>
                <span className="font-mono font-semibold text-slate-900">{cumulativeCredits}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Cumulative Grade Point Average (CGPA):</span>
                <span className="font-mono font-bold text-sm text-emerald-700">{cgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Academic Standing / Division:</span>
                <span className="font-semibold text-slate-900">{classification}</span>
              </div>
              <div className="flex justify-between py-0.5 pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">Semester Result Status:</span>
                <span className={`font-bold ${targetSummary?.passedAll ? 'text-emerald-700' : 'text-red-600'}`}>
                  {targetSummary?.passedAll ? 'SEMESTER CLEARED' : 'ARREARS PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* UGC 10-Point Scale Legend */}
          <div className="border border-slate-200 rounded p-3 text-[10px] text-slate-600 mb-8 bg-white">
            <span className="font-bold text-slate-800 uppercase block mb-1">Grading Scale Reference (10-Point UGC System):</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center font-mono">
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">O (10)</div>
                <div className="text-[9px] text-slate-500">90-100%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">A+ (9)</div>
                <div className="text-[9px] text-slate-500">80-89%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">A (8)</div>
                <div className="text-[9px] text-slate-500">70-79%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">B+ (7)</div>
                <div className="text-[9px] text-slate-500">60-69%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">B (6)</div>
                <div className="text-[9px] text-slate-500">55-59%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">C (5)</div>
                <div className="text-[9px] text-slate-500">50-54%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-slate-50">
                <div className="font-bold text-slate-900">P (4)</div>
                <div className="text-[9px] text-slate-500">40-49%</div>
              </div>
              <div className="p-1 border border-slate-100 rounded bg-red-50 text-red-700">
                <div className="font-bold">F (0)</div>
                <div className="text-[9px]">&lt;40% (Fail)</div>
              </div>
            </div>
          </div>

          {/* Official Signatures & Verification Stamp */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-slate-400 text-sm">Prepared by Exam Cell</span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700 uppercase text-[11px]">
                Tabulator
              </div>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-slate-400 text-sm">Verified & Certified</span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700 uppercase text-[11px]">
                Dean (Academic Affairs)
              </div>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-blue-900 text-sm font-bold">Dr. K. Narayanan</span>
              </div>
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-900 uppercase text-[11px]">
                Controller of Examinations
              </div>
            </div>
          </div>

          {/* Security Disclaimer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            This digital grade card is an authentic academic statement generated by AcademiaGrade Institutional Information System.
            Any unauthorized alteration or forgery renders this document null and void.
          </div>
        </div>
      </div>
    </div>
  );
};
