import React, { useState } from 'react';
import { Course, Department } from '../types';
import { X, BookOpen } from 'lucide-react';

interface AddCourseModalProps {
  departments: Department[];
  onSave: (course: Course) => void;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  departments,
  onSave,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [semester, setSemester] = useState(4);
  const [credits, setCredits] = useState(4);
  const [maxInternalMarks, setMaxInternalMarks] = useState(40);
  const [maxExternalMarks, setMaxExternalMarks] = useState(60);
  const [passMinTotal, setPassMinTotal] = useState(40);
  const [passMinExternal, setPassMinExternal] = useState(24);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Please provide Course Code and Course Title.');
      return;
    }

    const newCourse: Course = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      departmentId,
      semester: Number(semester),
      credits: Number(credits),
      maxInternalMarks: Number(maxInternalMarks),
      maxExternalMarks: Number(maxExternalMarks),
      passMinTotal: Number(passMinTotal),
      passMinExternal: Number(passMinExternal),
    };

    onSave(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Add New Curriculum Course</h3>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS406"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cloud Computing & Microservices"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Semester
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Credits (Weight)
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Max Internal Marks
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={maxInternalMarks}
                onChange={(e) => setMaxInternalMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Max External Exam Marks
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={maxExternalMarks}
                onChange={(e) => setMaxExternalMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Min Passing Total Mark
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={passMinTotal}
                onChange={(e) => setPassMinTotal(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Min External Passing Mark
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={passMinExternal}
                onChange={(e) => setPassMinExternal(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
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
              Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
