import React from 'react';
import { Role } from '../types';
import { ShieldCheck, UserCheck, GraduationCap, RotateCcw } from 'lucide-react';
import crestImage from '../assets/images/university_crest_seal_1791952957414.jpg';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeNavTab,
  onNavTabChange,
  onResetData,
}) => {
  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark with crest */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={crestImage}
              alt="AcademiaGrade Crest"
              referrerPolicy="no-referrer"
              className="w-9 h-9 object-contain rounded-full bg-white/10 p-0.5 border border-white/20"
            />
            <div className="leading-tight">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
                AcademiaGrade
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block">
                Result Management System
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => onNavTabChange('overview')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'overview'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Overview &amp; Analytics
                </button>
                <button
                  onClick={() => onNavTabChange('exams')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'exams'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Examinations
                </button>
                <button
                  onClick={() => onNavTabChange('students')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'students'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Student Directory
                </button>
                <button
                  onClick={() => onNavTabChange('courses')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'courses'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Curriculum &amp; Courses
                </button>
                <button
                  onClick={() => onNavTabChange('rules')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'rules'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Grading Scale
                </button>
              </>
            )}

            {currentRole === 'faculty' && (
              <>
                <button
                  onClick={() => onNavTabChange('entry')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'entry'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Marks Entry Sheet
                </button>
                <button
                  onClick={() => onNavTabChange('csv')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'csv'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Batch Import / Export
                </button>
              </>
            )}

            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => onNavTabChange('results')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'results'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Semester Results &amp; SGPA
                </button>
                <button
                  onClick={() => onNavTabChange('transcript')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeNavTab === 'transcript'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Academic Transcript
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Role Switcher & Reset Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Persona Switcher Pill */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => {
                  onRoleChange('admin');
                  onNavTabChange('overview');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Institution Admin (Exam Cell)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => {
                  onRoleChange('faculty');
                  onNavTabChange('entry');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentRole === 'faculty'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Faculty Evaluator (Prof. Jenkins)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                onClick={() => {
                  onRoleChange('student');
                  onNavTabChange('results');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentRole === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Student Portal (Alex Rivera - CS202401)"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Reset Database to Fresh Demo State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
