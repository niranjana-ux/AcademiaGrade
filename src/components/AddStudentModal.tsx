import React, { useState } from 'react';
import { Department, Student } from '../types';
import { X, UserPlus } from 'lucide-react';

interface AddStudentModalProps {
  departments: Department[];
  onSave: (student: Student) => void;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  departments,
  onSave,
  onClose,
}) => {
  const [registerNo, setRegisterNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [semester, setSemester] = useState(4);
  const [batchYear, setBatchYear] = useState('2024-2028');
  const [phone, setPhone] = useState('+1 555-');
  const [dateOfBirth, setDateOfBirth] = useState('2004-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerNo.trim() || !name.trim() || !email.trim()) {
      setError('Please provide Register Number, Full Name, and Student Email.');
      return;
    }

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      registerNo: registerNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      departmentId,
      semester: Number(semester),
      batchYear,
      phone,
      dateOfBirth,
      gender,
    };

    onSave(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Register New Student</h3>
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
                Register Number *
              </label>
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="e.g. CS202409"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.chen@student.academia.edu"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Semester
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
                Batch
              </label>
              <input
                type="text"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="2024-2028"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
