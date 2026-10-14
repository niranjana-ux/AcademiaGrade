export type Role = 'admin' | 'faculty' | 'student';

export type LetterGrade = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';

export type ExamStatus = 'draft' | 'evaluation' | 'published' | 'locked';

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDept: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semester: number;
  credits: number;
  maxInternalMarks: number; // default 40
  maxExternalMarks: number; // default 60
  passMinTotal: number;     // default 40
  passMinExternal: number;  // default 24 (40% of 60)
}

export interface Student {
  id: string;
  registerNo: string;
  name: string;
  email: string;
  departmentId: string;
  semester: number;
  batchYear: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
}

export interface Faculty {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  departmentId: string;
  assignedCourseIds: string[];
  designation: string;
}

export interface ExamSession {
  id: string;
  name: string;
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  publishedAt?: string;
}

export interface MarkRecord {
  id: string;
  studentId: string;
  courseId: string;
  examSessionId: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: LetterGrade;
  gradePoint: number;
  creditPoints: number;
  isPassed: boolean;
  evaluatedBy?: string;
  updatedAt: string;
}

export interface SemesterSummary {
  semester: number;
  totalCredits: number;
  earnedCredits: number;
  totalCreditPoints: number;
  sgpa: number;
  passedAll: boolean;
  marks: MarkRecord[];
}

export interface StudentTranscript {
  student: Student;
  department: Department;
  semesterSummaries: SemesterSummary[];
  cumulativeCredits: number;
  cumulativeCreditPoints: number;
  cgpa: number;
  backlogsCount: number;
  classification: string;
}

export interface GradingRule {
  grade: LetterGrade;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
}
