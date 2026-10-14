import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import {
  Search,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { OfficialMarkSheetModal } from './OfficialMarkSheetModal';

interface StudentPortalProps {
  initialStudentId?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ initialStudentId }) => {
  const students = StorageService.getStudents();
  const courses = StorageService.getCourses();
  const exams = StorageService.getExamSessions();

  // Default to Alex Rivera (s-1) or initialStudentId
  const defaultStudent = initialStudentId
    ? students.find((s) => s.id === initialStudentId || s.registerNo.toLowerCase() === initialStudentId.toLowerCase())
    : students[0];

  const [searchQuery, setSearchQuery] = useState(defaultStudent?.registerNo || 'CS202401');
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudent?.id || students[0]?.id);
  const [selectedSemesterTab, setSelectedSemesterTab] = useState<number | null>(null);
  const [isMarkSheetModalOpen, setIsMarkSheetModalOpen] = useState(false);

  const transcript = StorageService.getStudentTranscript(selectedStudentId);

  // When searching by roll number
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = students.find(
      (s) => s.registerNo.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );
    if (found) {
      setSelectedStudentId(found.id);
      setSelectedSemesterTab(null);
    } else {
      alert(`No student found with register number or name "${searchQuery}". Try "CS202401", "CS202402", or "IT202401".`);
    }
  };

  const handleQuickSelectStudent = (studentId: string, rollNo: string) => {
    setSelectedStudentId(studentId);
    setSearchQuery(rollNo);
    setSelectedSemesterTab(null);
  };

  if (!transcript) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Student Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please enter a valid register number above to search.</p>
      </div>
    );
  }

  const { student, department, semesterSummaries, cgpa, cumulativeCredits, backlogsCount, classification } = transcript;

  // Active semester summary
  const activeSemesterNum = selectedSemesterTab || (semesterSummaries.length > 0 ? semesterSummaries[semesterSummaries.length - 1].semester : student.semester);
  const activeSummary = semesterSummaries.find((s) => s.semester === activeSemesterNum) || semesterSummaries[semesterSummaries.length - 1];
  const activeExam = exams.find((e) => e.semester === activeSemesterNum);

  return (
    <div className="space-y-6">
      {/* Search Header Bar with Quick Candidate Switcher */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Academic Result Portal</h2>
            <p className="text-xs text-slate-500">
              Access official semester grade cards, credit transcripts, and automated CGPA records.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative min-w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Register No (e.g. CS202401)..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-xs shadow-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick demo student buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Quick Switch Demo Student:</span>
          {students.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() => handleQuickSelectStudent(s.id, s.registerNo)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                s.id === selectedStudentId
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {s.registerNo} ({s.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Student Profile Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900">{student.name}</h1>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  {student.registerNo}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {student.gender} · DOB: {student.dateOfBirth}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-600">
                <span>
                  <strong>Department:</strong> {department.name} ({department.code})
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>
                  <strong>Batch:</strong> {student.batchYear}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>
                  <strong>Email:</strong> {student.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-6 shrink-0">
            <div className="text-center sm:text-left">
              <span className="text-slate-500 text-[11px] block font-medium uppercase tracking-wide">
                Cumulative CGPA
              </span>
              <span className="text-3xl font-extrabold font-mono text-emerald-700 tabular-nums">
                {cgpa.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block">out of 10.00</span>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-slate-500 text-[11px] block font-medium uppercase tracking-wide">
                Total Credits
              </span>
              <span className="text-3xl font-extrabold font-mono text-blue-700 tabular-nums">
                {cumulativeCredits}
              </span>
              <span className="text-[10px] text-slate-400 block">Credits Earned</span>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-slate-500 text-[11px] block font-medium uppercase tracking-wide">
                Academic Standing
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-1">
                {classification}
              </span>
              <span className={`text-[10px] font-semibold block ${backlogsCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {backlogsCount > 0 ? `${backlogsCount} Backlog Pending` : 'Zero Arrears'}
              </span>
            </div>

            <button
              onClick={() => setIsMarkSheetModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-2 shadow-xs ml-auto lg:ml-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Official Mark Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-medium px-2">Academic Terms:</span>
        {semesterSummaries.map((summary) => (
          <button
            key={summary.semester}
            onClick={() => setSelectedSemesterTab(summary.semester)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              (activeSummary?.semester === summary.semester)
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Semester {summary.semester}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeSummary?.semester === summary.semester
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              SGPA: {summary.sgpa.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Detailed Semester Grade Card */}
      {activeSummary ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Semester {activeSummary.semester} Examination Statement
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    activeSummary.passedAll
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {activeSummary.passedAll ? 'SEMESTER CLEARED' : 'ARREAR PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeExam?.name || `End Semester Examinations - Term ${activeSummary.semester}`} · Published on{' '}
                {activeExam?.publishedAt || '15 June 2026'}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-2.5 border border-slate-200 rounded-lg text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Semester SGPA</span>
                <span className="font-mono font-extrabold text-blue-700 text-base tabular-nums">
                  {activeSummary.sgpa.toFixed(2)}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-slate-500 text-[10px] uppercase block">Credits Registered</span>
                <span className="font-mono font-bold text-slate-800 text-sm tabular-nums">
                  {activeSummary.earnedCredits} / {activeSummary.totalCredits}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-slate-500 text-[10px] uppercase block">Credit Points</span>
                <span className="font-mono font-bold text-slate-800 text-sm tabular-nums">
                  {activeSummary.totalCreditPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Internal (40)</th>
                  <th className="py-2.5 px-3 text-center">External (60)</th>
                  <th className="py-2.5 px-3 text-center">Total (100)</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                  <th className="py-2.5 px-3 text-center">Credit Points</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSummary.marks.map((mark, idx) => {
                  const course = courses.find((c) => c.id === mark.courseId);
                  return (
                    <tr key={mark.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {course?.code || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {course?.name || 'Academic Course'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-blue-700">
                        {course?.credits || 3}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {mark.internalMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {mark.externalMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                        {mark.totalMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={
                            mark.grade === 'F'
                              ? 'text-red-600 font-extrabold'
                              : mark.grade === 'O' || mark.grade === 'A+'
                              ? 'text-emerald-700'
                              : 'text-slate-900'
                          }
                        >
                          {mark.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                        {mark.gradePoint}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                        {mark.creditPoints}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            mark.isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {mark.isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified against UGC Autonomous Examination Regulations 2026</span>
            </span>

            <button
              onClick={() => setIsMarkSheetModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Official Printable Transcript</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No examination records declared for this semester yet.</p>
        </div>
      )}

      {/* Official Mark Sheet Printable Modal */}
      {isMarkSheetModalOpen && (
        <OfficialMarkSheetModal
          transcript={transcript}
          selectedSemester={activeSemesterNum}
          courses={courses}
          exams={exams}
          onClose={() => setIsMarkSheetModalOpen(false)}
        />
      )}
    </div>
  );
};
