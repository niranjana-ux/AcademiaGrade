import React, { useState } from 'react';
import {
  Course,
  Department,
  ExamSession,
  Faculty,
  GradingRule,
  Student,
  StudentTranscript,
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Lock,
  Plus,
  Search,
  FileText,
  Filter,
  Download,
  Trash2,
} from 'lucide-react';
import { exportToCSV } from '../utils/gradeCalculator';

interface AdminPortalProps {
  activeTab: string;
  onSelectStudentForTranscript: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddCourse: () => void;
  onOpenAddExam: () => void;
  onDataChanged: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeTab,
  onSelectStudentForTranscript,
  onOpenAddStudent,
  onOpenAddCourse,
  onOpenAddExam,
  onDataChanged,
}) => {
  const students = StorageService.getStudents();
  const departments = StorageService.getDepartments();
  const courses = StorageService.getCourses();
  const faculty = StorageService.getFaculty();
  const exams = StorageService.getExamSessions();
  const rules = StorageService.getGradingRules();
  const analytics = StorageService.getInstitutionalAnalytics();

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('ALL');
  const [studentSemFilter, setStudentSemFilter] = useState('ALL');

  const [courseSearch, setCourseSearch] = useState('');
  const [courseDeptFilter, setCourseDeptFilter] = useState('ALL');

  // Exam Status Transition Handler
  const handleUpdateExamStatus = (exam: ExamSession, newStatus: ExamSession['status']) => {
    const updated: ExamSession = {
      ...exam,
      status: newStatus,
      publishedAt: newStatus === 'published' ? new Date().toISOString().split('T')[0] : exam.publishedAt,
    };
    StorageService.saveExamSession(updated);
    onDataChanged();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"?`)) {
      StorageService.deleteStudent(id);
      onDataChanged();
    }
  };

  const handleDeleteCourse = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove course "${name}"?`)) {
      StorageService.deleteCourse(id);
      onDataChanged();
    }
  };

  const handleExportAllStudentsCSV = () => {
    const headers = ['RegisterNo', 'Name', 'Email', 'Department', 'Semester', 'Batch', 'Phone', 'Gender'];
    const rows = students.map((s) => {
      const dept = departments.find((d) => d.id === s.departmentId)?.code || s.departmentId;
      return [s.registerNo, s.name, s.email, dept, s.semester, s.batchYear, s.phone, s.gender];
    });
    exportToCSV(headers, rows, `AcademiaGrade_Students_Directory_${new Date().toISOString().split('T')[0]}`);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.registerNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesDept = studentDeptFilter === 'ALL' || s.departmentId === studentDeptFilter;
    const matchesSem = studentSemFilter === 'ALL' || s.semester === Number(studentSemFilter);
    return matchesSearch && matchesDept && matchesSem;
  });

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesDept = courseDeptFilter === 'ALL' || c.departmentId === courseDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 text-xs font-medium block">Total Enrolled</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {analytics.totalStudents}
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Active across 4 Depts</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 text-xs font-medium block">Curriculum Courses</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {analytics.totalCourses}
                </span>
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Credit-weighted units</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 text-xs font-medium block">Active Exam Sessions</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {analytics.activeExams}
                </span>
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Spring 2026 Cycle</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-slate-500 text-xs font-medium block">Overall Pass Rate</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                  {analytics.overallPassRate}%
                </span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Meeting UGC Norms</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs col-span-2 md:col-span-1">
              <span className="text-slate-500 text-xs font-medium block">Evaluation Status</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
                  92.5%
                </span>
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Papers normalized</span>
            </div>
          </div>

          {/* Department Pass Rates & Grade Distribution Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Pass Rates */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Department Performance Benchmark</h3>
                  <p className="text-xs text-slate-500">Pass percentage in latest published evaluation cycle</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {analytics.deptStats.map((item) => (
                  <div key={item.department.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {item.department.name} ({item.department.code})
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {item.passRate}% ({item.evaluatedPapers} papers)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.passRate >= 85
                            ? 'bg-emerald-600'
                            : item.passRate >= 70
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.passRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UGC 10-Point Grade Distribution */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Institutional Grade Distribution</h3>
                  <p className="text-xs text-slate-500">10-Point scale letter grades awarded this session</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
                {Object.entries(analytics.gradeDistribution).map(([grade, count]) => (
                  <div
                    key={grade}
                    className={`p-2.5 text-center rounded-lg border text-xs ${
                      grade === 'F'
                        ? 'bg-red-50/80 border-red-200 text-red-900'
                        : grade === 'O' || grade === 'A+'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="font-bold block text-sm">{grade}</span>
                    <span className="text-lg font-mono font-extrabold block my-0.5 tabular-nums">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-500 block">papers</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>Total Evaluated Records: <strong>{StorageService.getMarkRecords().length}</strong></span>
                <span className="text-emerald-700 font-medium">94.8% Pass / 5.2% Arrear</span>
              </div>
            </div>
          </div>

          {/* Dean's List / Top Academic Rankers */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Dean's Honor Roll · Top Academic Rankers</h3>
                <p className="text-xs text-slate-500">Highest Cumulative Grade Point Average (CGPA) across colleges</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Credits Earned</th>
                    <th className="py-2.5 px-3 text-center">CGPA</th>
                    <th className="py-2.5 px-3">Academic Classification</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.topStudents.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {item.student.registerNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.student.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.department.name} ({item.department.code})
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                        {item.cumulativeCredits}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 text-sm tabular-nums">
                        {item.cgpa.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {item.classification}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectStudentForTranscript(item.student.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Transcript</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXAMINATIONS MANAGER TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Examination Sessions &amp; Result Publishing</h3>
              <p className="text-xs text-slate-500">
                Manage evaluation cycles, publish student results, and lock records against tampering.
              </p>
            </div>
            <button
              onClick={onOpenAddExam}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Examination</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Examination Session</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4">Schedule Dates</th>
                  <th className="py-3 px-4 text-center">Workflow Status</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4 text-right">Publishing Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{exam.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{exam.academicYear}</td>
                    <td className="py-3 px-4 text-center font-mono">Sem {exam.semester}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {exam.startDate} to {exam.endDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          exam.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exam.status === 'evaluation'
                            ? 'bg-amber-100 text-amber-800'
                            : exam.status === 'locked'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {exam.status === 'published' && <CheckCircle className="w-3 h-3" />}
                        {exam.status === 'evaluation' && <Clock className="w-3 h-3" />}
                        {exam.status === 'locked' && <Lock className="w-3 h-3" />}
                        <span className="capitalize">{exam.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {exam.publishedAt || 'Not Published Yet'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {exam.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateExamStatus(exam, 'evaluation')}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                          >
                            Open Evaluation
                          </button>
                        )}
                        {exam.status === 'evaluation' && (
                          <button
                            onClick={() => handleUpdateExamStatus(exam, 'published')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                          >
                            Publish Results
                          </button>
                        )}
                        {exam.status === 'published' && (
                          <button
                            onClick={() => handleUpdateExamStatus(exam, 'locked')}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                          >
                            Lock &amp; Archive
                          </button>
                        )}
                        {exam.status === 'locked' && (
                          <button
                            onClick={() => handleUpdateExamStatus(exam, 'evaluation')}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                          >
                            Re-Open
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. STUDENTS DIRECTORY TAB */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name, roll no, or email..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              <select
                value={studentSemFilter}
                onChange={(e) => setStudentSemFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAllStudentsCSV}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={onOpenAddStudent}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Student</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Register No</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-center">Semester</th>
                  <th className="py-2.5 px-4">Batch</th>
                  <th className="py-2.5 px-4 text-center">CGPA</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const dept = departments.find((d) => d.id === student.departmentId);
                  const transcript = StorageService.getStudentTranscript(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700">
                        {student.registerNo}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-900 block">{student.name}</span>
                        <span className="text-[11px] text-slate-400 block">{student.email}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">
                        {dept?.name || student.departmentId}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        Sem {student.semester}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                        {student.batchYear}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                        {transcript ? transcript.cgpa.toFixed(2) : '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        {transcript && transcript.backlogsCount > 0 ? (
                          <span className="text-red-600 font-medium text-[11px]">
                            {transcript.backlogsCount} Arrears
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px]">
                            Regular / Clear
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectStudentForTranscript(student.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                            title="Generate & View Official Mark Sheet"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Mark Sheet</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CURRICULUM & COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search by code or course title..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={courseDeptFilter}
                onChange={(e) => setCourseDeptFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenAddCourse}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Course Code</th>
                  <th className="py-2.5 px-4">Course Title</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-center">Semester</th>
                  <th className="py-2.5 px-4 text-center">Credits</th>
                  <th className="py-2.5 px-4 text-center">Internal / External</th>
                  <th className="py-2.5 px-4 text-center">Passing Marks</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((c) => {
                  const dept = departments.find((d) => d.id === c.departmentId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{dept?.name || c.departmentId}</td>
                      <td className="py-2.5 px-4 text-center font-mono">Sem {c.semester}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-700">{c.credits}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                        {c.maxInternalMarks} / {c.maxExternalMarks}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                        Total &ge; {c.passMinTotal} (Ext &ge; {c.passMinExternal})
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.name)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. GRADING SCALE RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">UGC 10-Point Scale Standard Grading Scheme</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured automated conversion rules for raw percentage to letter grade and grade points.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">Performance Descriptor</th>
                  <th className="py-3 px-4 text-center">Marks Range (%)</th>
                  <th className="py-3 px-4 text-center">Grade Point</th>
                  <th className="py-3 px-4">Result Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.grade} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-base text-slate-900">
                      {rule.grade}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {rule.description}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                      {rule.minPercentage}% - {rule.maxPercentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700 text-sm tabular-nums">
                      {rule.gradePoint}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {rule.grade === 'F' ? (
                        <span className="text-red-600">Fail / Arrear (Zero Credits Awarded)</span>
                      ) : (
                        <span className="text-emerald-700">Passed / Full Credits Earned</span>
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
  );
};
