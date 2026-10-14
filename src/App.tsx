import React, { useState } from 'react';
import { Role, Student, Course, ExamSession, StudentTranscript } from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { AdminPortal } from './components/AdminPortal';
import { FacultyPortal } from './components/FacultyPortal';
import { StudentPortal } from './components/StudentPortal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddCourseModal } from './components/AddCourseModal';
import { AddExamModal } from './components/AddExamModal';
import { OfficialMarkSheetModal } from './components/OfficialMarkSheetModal';
import { ConfirmDialog } from './components/ConfirmDialog';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [activeNavTab, setActiveNavTab] = useState<string>('overview');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [transcriptModalStudentId, setTranscriptModalStudentId] = useState<string | null>(null);

  const departments = StorageService.getDepartments();
  const courses = StorageService.getCourses();
  const exams = StorageService.getExamSessions();

  const handleDataChanged = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleConfirmReset = () => {
    StorageService.resetToDefaults();
    setIsResetConfirmOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleSaveStudent = (newStudent: Student) => {
    StorageService.saveStudent(newStudent);
    handleDataChanged();
  };

  const handleSaveCourse = (newCourse: Course) => {
    StorageService.saveCourse(newCourse);
    handleDataChanged();
  };

  const handleSaveExam = (newExam: ExamSession) => {
    StorageService.saveExamSession(newExam);
    handleDataChanged();
  };

  // Selected student transcript for Admin popup
  const activeTranscript: StudentTranscript | null = transcriptModalStudentId
    ? StorageService.getStudentTranscript(transcriptModalStudentId)
    : null;

  return (
    <div key={refreshKey} className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Clean Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeNavTab={activeNavTab}
        onNavTabChange={setActiveNavTab}
        onResetData={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'admin' && (
          <AdminPortal
            activeTab={activeNavTab}
            onSelectStudentForTranscript={(studentId) => setTranscriptModalStudentId(studentId)}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenAddCourse={() => setIsAddCourseOpen(true)}
            onOpenAddExam={() => setIsAddExamOpen(true)}
            onDataChanged={handleDataChanged}
          />
        )}

        {currentRole === 'faculty' && (
          <FacultyPortal onDataChanged={handleDataChanged} />
        )}

        {currentRole === 'student' && (
          <StudentPortal />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-900">AcademiaGrade Enterprise</span>
            <span>·</span>
            <span>UGC 10-Point Scale Compliant</span>
            <span>·</span>
            <span>Autonomous Examination Regulations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ISO 9001:2015 Quality Certified</span>
            <span>·</span>
            <span>© 2026 Board of Examinations</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAddStudentOpen && (
        <AddStudentModal
          departments={departments}
          onSave={handleSaveStudent}
          onClose={() => setIsAddStudentOpen(false)}
        />
      )}

      {isAddCourseOpen && (
        <AddCourseModal
          departments={departments}
          onSave={handleSaveCourse}
          onClose={() => setIsAddCourseOpen(false)}
        />
      )}

      {isAddExamOpen && (
        <AddExamModal
          onSave={handleSaveExam}
          onClose={() => setIsAddExamOpen(false)}
        />
      )}

      {activeTranscript && (
        <OfficialMarkSheetModal
          transcript={activeTranscript}
          courses={courses}
          exams={exams}
          onClose={() => setTranscriptModalStudentId(null)}
        />
      )}

      {/* Confirmation Dialog for Resetting Data */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Academic Database"
        message="This will restore all departments, courses, faculty, students, and marks to the fresh initial higher education demo state. Any custom additions will be cleared."
        confirmLabel="Reset All Data"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
