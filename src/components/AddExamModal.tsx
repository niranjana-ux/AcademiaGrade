import React, { useState } from 'react';
import { ExamSession, ExamStatus } from '../types';
import { X, Calendar } from 'lucide-react';

interface AddExamModalProps {
  onSave: (exam: ExamSession) => void;
  onClose: () => void;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState(4);
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-12-05');
  const [status, setStatus] = useState<ExamStatus>('draft');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the Examination Session Name.');
      return;
    }

    const newExam: ExamSession = {
      id: `exam-${Date.now()}`,
      name: name.trim(),
      academicYear,
      semester: Number(semester),
      startDate,
      endDate,
      status,
    };

    onSave(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Schedule Examination Session</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Examination Session Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. End Semester Regular Examinations - Fall 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Initial Workflow Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ExamStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="draft">Draft (Planning stage, no evaluations)</option>
              <option value="evaluation">Evaluation (Open for faculty marks entry)</option>
              <option value="published">Published (Results live for students)</option>
              <option value="locked">Locked (Archived, immutable)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
            >
              Create Examination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
