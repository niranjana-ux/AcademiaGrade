import {
  Course,
  Department,
  ExamSession,
  Faculty,
  GradingRule,
  MarkRecord,
  SemesterSummary,
  Student,
  StudentTranscript,
} from '../types';
import {
  calculateCGPA,
  calculateGrade,
  calculateSGPA,
  DEFAULT_GRADING_RULES,
} from '../utils/gradeCalculator';

const STORAGE_KEYS = {
  DEPARTMENTS: 'academiagrade_departments_v1',
  COURSES: 'academiagrade_courses_v1',
  STUDENTS: 'academiagrade_students_v1',
  FACULTY: 'academiagrade_faculty_v1',
  EXAM_SESSIONS: 'academiagrade_exams_v1',
  MARK_RECORDS: 'academiagrade_marks_v1',
  GRADING_RULES: 'academiagrade_rules_v1',
};

// Initial Seed Data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', headOfDept: 'Dr. Alan Turing' },
  { id: 'dept-it', code: 'IT', name: 'Information Technology', headOfDept: 'Dr. Grace Hopper' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', headOfDept: 'Dr. Claude Shannon' },
  { id: 'dept-dsai', code: 'DSAI', name: 'Data Science & Artificial Intelligence', headOfDept: 'Dr. Geoffrey Hinton' },
];

const INITIAL_COURSES: Course[] = [
  // CSE Semester 4
  { id: 'c-cs401', code: 'CS401', name: 'Distributed Operating Systems', departmentId: 'dept-cse', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs402', code: 'CS402', name: 'Design and Analysis of Algorithms', departmentId: 'dept-cse', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs403', code: 'CS403', name: 'Database Management Systems', departmentId: 'dept-cse', semester: 4, credits: 3, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs404', code: 'CS404', name: 'Computer Networks', departmentId: 'dept-cse', semester: 4, credits: 3, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs405', code: 'CS405', name: 'Web Technologies & Cloud Lab', departmentId: 'dept-cse', semester: 4, credits: 2, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },

  // CSE Semester 3
  { id: 'c-cs301', code: 'CS301', name: 'Data Structures and Algorithms', departmentId: 'dept-cse', semester: 3, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs302', code: 'CS302', name: 'Object Oriented Programming in Java', departmentId: 'dept-cse', semester: 3, credits: 3, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-cs303', code: 'CS303', name: 'Discrete Computational Mathematics', departmentId: 'dept-cse', semester: 3, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },

  // IT Semester 4
  { id: 'c-it401', code: 'IT401', name: 'Software Architecture & Quality', departmentId: 'dept-it', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-it402', code: 'IT402', name: 'Cyber Security & Cryptography', departmentId: 'dept-it', semester: 4, credits: 3, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-it403', code: 'IT403', name: 'Mobile Application Frameworks', departmentId: 'dept-it', semester: 4, credits: 3, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },

  // ECE Semester 4
  { id: 'c-ec401', code: 'EC401', name: 'Microprocessors and Microcontrollers', departmentId: 'dept-ece', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-ec402', code: 'EC402', name: 'Digital Signal Processing', departmentId: 'dept-ece', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },

  // DSAI Semester 4
  { id: 'c-ds401', code: 'DS401', name: 'Machine Learning Foundations', departmentId: 'dept-dsai', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
  { id: 'c-ds402', code: 'DS402', name: 'Big Data Processing Systems', departmentId: 'dept-dsai', semester: 4, credits: 4, maxInternalMarks: 40, maxExternalMarks: 60, passMinTotal: 40, passMinExternal: 24 },
];

const INITIAL_FACULTY: Faculty[] = [
  { id: 'fac-1', facultyId: 'FAC201', name: 'Prof. Sarah Jenkins', email: 's.jenkins@academia.edu', departmentId: 'dept-cse', assignedCourseIds: ['c-cs401', 'c-cs402'], designation: 'Associate Professor' },
  { id: 'fac-2', facultyId: 'FAC202', name: 'Dr. Marcus Vance', email: 'm.vance@academia.edu', departmentId: 'dept-cse', assignedCourseIds: ['c-cs403', 'c-cs404'], designation: 'Professor' },
  { id: 'fac-3', facultyId: 'FAC203', name: 'Prof. Elena Rostova', email: 'e.rostova@academia.edu', departmentId: 'dept-it', assignedCourseIds: ['c-it401', 'c-it402'], designation: 'Assistant Professor' },
  { id: 'fac-4', facultyId: 'FAC204', name: 'Dr. Rajesh Kumar', email: 'r.kumar@academia.edu', departmentId: 'dept-ece', assignedCourseIds: ['c-ec401', 'c-ec402'], designation: 'Associate Professor' },
  { id: 'fac-5', facultyId: 'FAC205', name: 'Prof. Sophia Chen', email: 's.chen@academia.edu', departmentId: 'dept-dsai', assignedCourseIds: ['c-ds401', 'c-ds402'], designation: 'Assistant Professor' },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 's-1', registerNo: 'CS202401', name: 'Alex Rivera', email: 'alex.rivera@student.academia.edu', departmentId: 'dept-cse', semester: 4, batchYear: '2024-2028', phone: '+1 555-0192', dateOfBirth: '2004-03-14', gender: 'Male' },
  { id: 's-2', registerNo: 'CS202402', name: 'Priya Sharma', email: 'priya.sharma@student.academia.edu', departmentId: 'dept-cse', semester: 4, batchYear: '2024-2028', phone: '+1 555-0193', dateOfBirth: '2004-08-22', gender: 'Female' },
  { id: 's-3', registerNo: 'CS202403', name: 'Jordan Lee', email: 'jordan.lee@student.academia.edu', departmentId: 'dept-cse', semester: 4, batchYear: '2024-2028', phone: '+1 555-0194', dateOfBirth: '2004-11-05', gender: 'Male' },
  { id: 's-4', registerNo: 'CS202404', name: 'Fatima Al-Mansoor', email: 'fatima.m@student.academia.edu', departmentId: 'dept-cse', semester: 4, batchYear: '2024-2028', phone: '+1 555-0195', dateOfBirth: '2004-05-18', gender: 'Female' },
  { id: 's-5', registerNo: 'CS202405', name: 'Liam O\'Connor', email: 'liam.oc@student.academia.edu', departmentId: 'dept-cse', semester: 4, batchYear: '2024-2028', phone: '+1 555-0196', dateOfBirth: '2004-01-30', gender: 'Male' },
  { id: 's-6', registerNo: 'IT202401', name: 'Maya Patel', email: 'maya.patel@student.academia.edu', departmentId: 'dept-it', semester: 4, batchYear: '2024-2028', phone: '+1 555-0201', dateOfBirth: '2004-09-12', gender: 'Female' },
  { id: 's-7', registerNo: 'IT202402', name: 'David Kim', email: 'david.kim@student.academia.edu', departmentId: 'dept-it', semester: 4, batchYear: '2024-2028', phone: '+1 555-0202', dateOfBirth: '2004-04-08', gender: 'Male' },
  { id: 's-8', registerNo: 'EC202401', name: 'Rohan Gupta', email: 'rohan.gupta@student.academia.edu', departmentId: 'dept-ece', semester: 4, batchYear: '2024-2028', phone: '+1 555-0211', dateOfBirth: '2004-07-19', gender: 'Male' },
  { id: 's-9', registerNo: 'EC202402', name: 'Chloe Dubois', email: 'chloe.dubois@student.academia.edu', departmentId: 'dept-ece', semester: 4, batchYear: '2024-2028', phone: '+1 555-0212', dateOfBirth: '2004-12-03', gender: 'Female' },
  { id: 's-10', registerNo: 'DS202401', name: 'Samantha Zhang', email: 'samantha.zhang@student.academia.edu', departmentId: 'dept-dsai', semester: 4, batchYear: '2024-2028', phone: '+1 555-0221', dateOfBirth: '2004-02-15', gender: 'Female' },
  { id: 's-11', registerNo: 'DS202402', name: 'Noah Williams', email: 'noah.williams@student.academia.edu', departmentId: 'dept-dsai', semester: 4, batchYear: '2024-2028', phone: '+1 555-0222', dateOfBirth: '2004-06-25', gender: 'Male' },
];

const INITIAL_EXAMS: ExamSession[] = [
  { id: 'exam-1', name: 'End Semester Regular Examinations - Spring 2026', academicYear: '2025-2026', semester: 4, startDate: '2026-05-15', endDate: '2026-06-02', status: 'published', publishedAt: '2026-06-15' },
  { id: 'exam-2', name: 'Continuous Midterm Evaluation - Spring 2026', academicYear: '2025-2026', semester: 4, startDate: '2026-03-10', endDate: '2026-03-20', status: 'evaluation' },
  { id: 'exam-3', name: 'End Semester Regular Examinations - Fall 2025', academicYear: '2025-2026', semester: 3, startDate: '2025-11-20', endDate: '2025-12-08', status: 'locked', publishedAt: '2025-12-20' },
];

function generateSeedMarks(): MarkRecord[] {
  const marks: MarkRecord[] = [];
  const rules = DEFAULT_GRADING_RULES;

  // Spring 2026 Exam (Semester 4)
  // For Alex Rivera (s-1): High performer (O and A+)
  const alexScores = [
    { courseId: 'c-cs401', internal: 38, external: 56 }, // 94 -> O
    { courseId: 'c-cs402', internal: 37, external: 54 }, // 91 -> O
    { courseId: 'c-cs403', internal: 36, external: 52 }, // 88 -> A+
    { courseId: 'c-cs404', internal: 35, external: 53 }, // 88 -> A+
    { courseId: 'c-cs405', internal: 39, external: 58 }, // 97 -> O
  ];
  alexScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s1-${course.id}-exam1`,
      studentId: 's-1',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-1',
      updatedAt: '2026-06-10T14:30:00Z',
    });
  });

  // For Priya Sharma (s-2): Excellent (A+ and A)
  const priyaScores = [
    { courseId: 'c-cs401', internal: 35, external: 50 }, // 85 -> A+
    { courseId: 'c-cs402', internal: 34, external: 49 }, // 83 -> A+
    { courseId: 'c-cs403', internal: 32, external: 45 }, // 77 -> A
    { courseId: 'c-cs404', internal: 33, external: 46 }, // 79 -> A
    { courseId: 'c-cs405', internal: 38, external: 54 }, // 92 -> O
  ];
  priyaScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s2-${course.id}-exam1`,
      studentId: 's-2',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-1',
      updatedAt: '2026-06-10T14:35:00Z',
    });
  });

  // For Jordan Lee (s-3): Above Average (B+ and A)
  const jordanScores = [
    { courseId: 'c-cs401', internal: 30, external: 42 }, // 72 -> A
    { courseId: 'c-cs402', internal: 28, external: 40 }, // 68 -> B+
    { courseId: 'c-cs403', internal: 26, external: 38 }, // 64 -> B+
    { courseId: 'c-cs404', internal: 29, external: 43 }, // 72 -> A
    { courseId: 'c-cs405', internal: 35, external: 48 }, // 83 -> A+
  ];
  jordanScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s3-${course.id}-exam1`,
      studentId: 's-3',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-1',
      updatedAt: '2026-06-10T14:40:00Z',
    });
  });

  // For Fatima Al-Mansoor (s-4): Very Good (A+ and A)
  const fatimaScores = [
    { courseId: 'c-cs401', internal: 36, external: 48 }, // 84 -> A+
    { courseId: 'c-cs402', internal: 32, external: 46 }, // 78 -> A
    { courseId: 'c-cs403', internal: 33, external: 47 }, // 80 -> A+
    { courseId: 'c-cs404', internal: 31, external: 44 }, // 75 -> A
    { courseId: 'c-cs405', internal: 37, external: 53 }, // 90 -> O
  ];
  fatimaScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s4-${course.id}-exam1`,
      studentId: 's-4',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-2',
      updatedAt: '2026-06-10T14:45:00Z',
    });
  });

  // For Liam O'Connor (s-5): Struggling with 1 Backlog in Algorithms (c-cs402 external 18 < 24)
  const liamScores = [
    { courseId: 'c-cs401', internal: 26, external: 32 }, // 58 -> B
    { courseId: 'c-cs402', internal: 18, external: 18 }, // 36 -> F (external < 24 and total < 40)
    { courseId: 'c-cs403', internal: 24, external: 30 }, // 54 -> C
    { courseId: 'c-cs404', internal: 25, external: 31 }, // 56 -> B
    { courseId: 'c-cs405', internal: 30, external: 42 }, // 72 -> A
  ];
  liamScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s5-${course.id}-exam1`,
      studentId: 's-5',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-2',
      updatedAt: '2026-06-10T14:50:00Z',
    });
  });

  // Fall 2025 Exam (Semester 3) for Alex Rivera (s-1) to demonstrate multi-semester CGPA!
  const alexSem3Scores = [
    { courseId: 'c-cs301', internal: 38, external: 55 }, // 93 -> O
    { courseId: 'c-cs302', internal: 37, external: 54 }, // 91 -> O
    { courseId: 'c-cs303', internal: 35, external: 52 }, // 87 -> A+
  ];
  alexSem3Scores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s1-${course.id}-exam3`,
      studentId: 's-1',
      courseId: course.id,
      examSessionId: 'exam-3',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-1',
      updatedAt: '2025-12-15T10:00:00Z',
    });
  });

  // Fall 2025 Exam (Semester 3) for Priya Sharma (s-2)
  const priyaSem3Scores = [
    { courseId: 'c-cs301', internal: 36, external: 51 }, // 87 -> A+
    { courseId: 'c-cs302', internal: 35, external: 50 }, // 85 -> A+
    { courseId: 'c-cs303', internal: 34, external: 48 }, // 82 -> A+
  ];
  priyaSem3Scores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s2-${course.id}-exam3`,
      studentId: 's-2',
      courseId: course.id,
      examSessionId: 'exam-3',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-1',
      updatedAt: '2025-12-15T10:05:00Z',
    });
  });

  // IT & DSAI students sample marks in Spring 2026
  // Samantha Zhang (DS top student)
  const samanthaScores = [
    { courseId: 'c-ds401', internal: 39, external: 57 }, // 96 -> O
    { courseId: 'c-ds402', internal: 39, external: 58 }, // 97 -> O
  ];
  samanthaScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s10-${course.id}-exam1`,
      studentId: 's-10',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-5',
      updatedAt: '2026-06-10T15:00:00Z',
    });
  });

  // Maya Patel (IT student)
  const mayaScores = [
    { courseId: 'c-it401', internal: 37, external: 54 }, // 91 -> O
    { courseId: 'c-it402', internal: 35, external: 51 }, // 86 -> A+
    { courseId: 'c-it403', internal: 36, external: 52 }, // 88 -> A+
  ];
  mayaScores.forEach((score) => {
    const course = INITIAL_COURSES.find((c) => c.id === score.courseId)!;
    const calc = calculateGrade(score.internal, score.external, course, rules);
    marks.push({
      id: `mark-s6-${course.id}-exam1`,
      studentId: 's-6',
      courseId: course.id,
      examSessionId: 'exam-1',
      internalMarks: score.internal,
      externalMarks: score.external,
      totalMarks: calc.totalMarks,
      grade: calc.grade,
      gradePoint: calc.gradePoint,
      creditPoints: calc.creditPoints,
      isPassed: calc.isPassed,
      evaluatedBy: 'fac-3',
      updatedAt: '2026-06-10T15:15:00Z',
    });
  });

  return marks;
}

export class StorageService {
  private static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      this.resetToDefaults();
    }
  }

  public static resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(STORAGE_KEYS.MARK_RECORDS, JSON.stringify(generateSeedMarks()));
    localStorage.setItem(STORAGE_KEYS.GRADING_RULES, JSON.stringify(DEFAULT_GRADING_RULES));
  }

  // Departments
  public static getDepartments(): Department[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || '[]');
  }

  // Courses
  public static getCourses(): Course[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
  }

  public static saveCourse(course: Course): Course {
    const list = this.getCourses();
    const idx = list.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      list[idx] = course;
    } else {
      list.push(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(list));
    return course;
  }

  public static deleteCourse(id: string): void {
    const list = this.getCourses().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(list));
  }

  // Students
  public static getStudents(): Student[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  }

  public static saveStudent(student: Student): Student {
    const list = this.getStudents();
    const idx = list.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      list[idx] = student;
    } else {
      list.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    return student;
  }

  public static deleteStudent(id: string): void {
    const list = this.getStudents().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  }

  // Faculty
  public static getFaculty(): Faculty[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY) || '[]');
  }

  public static saveFaculty(faculty: Faculty): Faculty {
    const list = this.getFaculty();
    const idx = list.findIndex((f) => f.id === faculty.id);
    if (idx >= 0) {
      list[idx] = faculty;
    } else {
      list.push(faculty);
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(list));
    return faculty;
  }

  // Exams
  public static getExamSessions(): ExamSession[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS) || '[]');
  }

  public static saveExamSession(exam: ExamSession): ExamSession {
    const list = this.getExamSessions();
    const idx = list.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      list[idx] = exam;
    } else {
      list.push(exam);
    }
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(list));
    return exam;
  }

  // Mark Records
  public static getMarkRecords(): MarkRecord[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MARK_RECORDS) || '[]');
  }

  public static saveMarkRecords(newRecords: MarkRecord[]): void {
    const existing = this.getMarkRecords();
    const map = new Map<string, MarkRecord>();
    existing.forEach((r) => map.set(`${r.studentId}_${r.courseId}_${r.examSessionId}`, r));
    newRecords.forEach((r) => map.set(`${r.studentId}_${r.courseId}_${r.examSessionId}`, r));
    localStorage.setItem(STORAGE_KEYS.MARK_RECORDS, JSON.stringify(Array.from(map.values())));
  }

  // Grading Rules
  public static getGradingRules(): GradingRule[] {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADING_RULES) || JSON.stringify(DEFAULT_GRADING_RULES));
  }

  public static saveGradingRules(rules: GradingRule[]): void {
    localStorage.setItem(STORAGE_KEYS.GRADING_RULES, JSON.stringify(rules));
  }

  // Higher-level academic analytics & transcript computation
  public static getStudentTranscript(studentId: string): StudentTranscript | null {
    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId || s.registerNo.toLowerCase() === studentId.toLowerCase());
    if (!student) return null;

    const departments = this.getDepartments();
    const department = departments.find((d) => d.id === student.departmentId) || {
      id: student.departmentId,
      code: 'GEN',
      name: 'General Academic Department',
      headOfDept: 'Academic Dean',
    };

    const courses = this.getCourses();
    const exams = this.getExamSessions();
    const allMarks = this.getMarkRecords().filter((m) => m.studentId === student.id);

    // Group marks by semester
    const semMap = new Map<number, MarkRecord[]>();
    allMarks.forEach((mark) => {
      const course = courses.find((c) => c.id === mark.courseId);
      const sem = course ? course.semester : student.semester;
      if (!semMap.has(sem)) semMap.set(sem, []);
      semMap.get(sem)!.push(mark);
    });

    const semesterSummaries: SemesterSummary[] = [];

    // Sort semesters numerically
    const sortedSemesters = Array.from(semMap.keys()).sort((a, b) => a - b);

    for (const semNum of sortedSemesters) {
      const semMarks = semMap.get(semNum)!;
      const itemsForCalc = semMarks.map((m) => {
        const c = courses.find((crs) => crs.id === m.courseId);
        return {
          creditPoints: m.creditPoints,
          credits: c ? c.credits : 3,
          isPassed: m.isPassed,
        };
      });

      const calc = calculateSGPA(itemsForCalc);
      const passedAll = semMarks.every((m) => m.isPassed);

      semesterSummaries.push({
        semester: semNum,
        totalCredits: calc.totalCredits,
        earnedCredits: calc.earnedCredits,
        totalCreditPoints: calc.totalCreditPoints,
        sgpa: calc.sgpa,
        passedAll,
        marks: semMarks,
      });
    }

    const cgpaCalc = calculateCGPA(semesterSummaries);

    return {
      student,
      department,
      semesterSummaries,
      cumulativeCredits: cgpaCalc.cumulativeCredits,
      cumulativeCreditPoints: cgpaCalc.cumulativeCreditPoints,
      cgpa: cgpaCalc.cgpa,
      backlogsCount: cgpaCalc.backlogsCount,
      classification: cgpaCalc.classification,
    };
  }

  // General Institutional KPIs
  public static getInstitutionalAnalytics() {
    const students = this.getStudents();
    const departments = this.getDepartments();
    const courses = this.getCourses();
    const exams = this.getExamSessions();
    const marks = this.getMarkRecords();

    // Published marks only for clean reporting
    const publishedExamIds = new Set(
      exams.filter((e) => e.status === 'published' || e.status === 'locked').map((e) => e.id)
    );
    const validMarks = marks.filter((m) => publishedExamIds.has(m.examSessionId));

    const totalStudents = students.length;
    const totalCourses = courses.length;
    const activeExams = exams.filter((e) => e.status !== 'locked').length;

    // Overall pass percentage
    const totalEvals = validMarks.length;
    const passedEvals = validMarks.filter((m) => m.isPassed).length;
    const overallPassRate = totalEvals > 0 ? Math.round((passedEvals / totalEvals) * 1000) / 10 : 0;

    // Grade Distribution Histogram
    const gradeDistribution: Record<string, number> = {
      'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'P': 0, 'F': 0,
    };
    validMarks.forEach((m) => {
      if (gradeDistribution[m.grade] !== undefined) {
        gradeDistribution[m.grade]++;
      }
    });

    // Department Performance
    const deptStats = departments.map((dept) => {
      const deptCourseIds = new Set(courses.filter((c) => c.departmentId === dept.id).map((c) => c.id));
      const deptMarks = validMarks.filter((m) => deptCourseIds.has(m.courseId));
      const deptPassed = deptMarks.filter((m) => m.isPassed).length;
      const deptTotal = deptMarks.length;
      const passRate = deptTotal > 0 ? Math.round((deptPassed / deptTotal) * 100) : 0;
      const deptStudentCount = students.filter((s) => s.departmentId === dept.id).length;

      return {
        department: dept,
        studentCount: deptStudentCount,
        evaluatedPapers: deptTotal,
        passRate,
      };
    });

    // Top Performers (Dean's List)
    const transcripts = students
      .map((s) => this.getStudentTranscript(s.id))
      .filter((t): t is StudentTranscript => t !== null && t.semesterSummaries.length > 0)
      .sort((a, b) => b.cgpa - a.cgpa);

    return {
      totalStudents,
      totalCourses,
      activeExams,
      overallPassRate,
      gradeDistribution,
      deptStats,
      topStudents: transcripts.slice(0, 5),
    };
  }
}
