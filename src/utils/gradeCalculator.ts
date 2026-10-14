import { Course, GradingRule, LetterGrade, SemesterSummary } from '../types';

export const DEFAULT_GRADING_RULES: GradingRule[] = [
  { grade: 'O', minPercentage: 90, maxPercentage: 100, gradePoint: 10, description: 'Outstanding' },
  { grade: 'A+', minPercentage: 80, maxPercentage: 89, gradePoint: 9, description: 'Excellent' },
  { grade: 'A', minPercentage: 70, maxPercentage: 79, gradePoint: 8, description: 'Very Good' },
  { grade: 'B+', minPercentage: 60, maxPercentage: 69, gradePoint: 7, description: 'Good' },
  { grade: 'B', minPercentage: 55, maxPercentage: 59, gradePoint: 6, description: 'Above Average' },
  { grade: 'C', minPercentage: 50, maxPercentage: 54, gradePoint: 5, description: 'Average' },
  { grade: 'P', minPercentage: 40, maxPercentage: 49, gradePoint: 4, description: 'Pass' },
  { grade: 'F', minPercentage: 0, maxPercentage: 39, gradePoint: 0, description: 'Fail / Arrear' },
];

/**
 * Calculates total marks, grade, grade points, credit points, and pass status.
 */
export function calculateGrade(
  internal: number,
  external: number,
  course: Course,
  rules: GradingRule[] = DEFAULT_GRADING_RULES
): {
  totalMarks: number;
  grade: LetterGrade;
  gradePoint: number;
  creditPoints: number;
  isPassed: boolean;
} {
  const safeInternal = Math.max(0, Math.min(course.maxInternalMarks, internal || 0));
  const safeExternal = Math.max(0, Math.min(course.maxExternalMarks, external || 0));
  const totalMarks = Math.round((safeInternal + safeExternal) * 10) / 10;
  
  const maxTotal = course.maxInternalMarks + course.maxExternalMarks;
  const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

  // Passing criteria:
  // Must meet minimum external marks (e.g. 24/60) AND minimum total marks (e.g. 40/100)
  const passedExternal = safeExternal >= course.passMinExternal;
  const passedTotal = totalMarks >= course.passMinTotal;
  const isPassed = passedExternal && passedTotal;

  if (!isPassed) {
    return {
      totalMarks,
      grade: 'F',
      gradePoint: 0,
      creditPoints: 0,
      isPassed: false,
    };
  }

  // Find matching rule
  const matched = rules.find(
    (r) => percentage >= r.minPercentage && percentage <= r.maxPercentage
  ) || {
    grade: 'F' as LetterGrade,
    gradePoint: 0,
  };

  const creditPoints = matched.gradePoint * course.credits;

  return {
    totalMarks,
    grade: matched.grade,
    gradePoint: matched.gradePoint,
    creditPoints,
    isPassed: true,
  };
}

/**
 * Calculates Semester Grade Point Average (SGPA)
 * SGPA = sum(Credit Points) / sum(Total Credits Registered)
 */
export function calculateSGPA(
  items: { creditPoints: number; credits: number; isPassed: boolean }[]
): {
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  totalCreditPoints: number;
} {
  if (items.length === 0) {
    return { sgpa: 0, totalCredits: 0, earnedCredits: 0, totalCreditPoints: 0 };
  }

  let totalCredits = 0;
  let earnedCredits = 0;
  let totalCreditPoints = 0;

  for (const item of items) {
    totalCredits += item.credits;
    totalCreditPoints += item.creditPoints;
    if (item.isPassed) {
      earnedCredits += item.credits;
    }
  }

  const sgpa = totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100) / 100 : 0;

  return {
    sgpa,
    totalCredits,
    earnedCredits,
    totalCreditPoints,
  };
}

/**
 * Calculates Cumulative Grade Point Average (CGPA)
 * CGPA = sum(Total Credit Points across all semesters) / sum(Total Credits across all semesters)
 */
export function calculateCGPA(semesterSummaries: SemesterSummary[]): {
  cgpa: number;
  cumulativeCredits: number;
  cumulativeCreditPoints: number;
  backlogsCount: number;
  classification: string;
} {
  let cumulativeCredits = 0;
  let cumulativeCreditPoints = 0;
  let backlogsCount = 0;

  for (const sem of semesterSummaries) {
    cumulativeCredits += sem.totalCredits;
    cumulativeCreditPoints += sem.totalCreditPoints;
    for (const mark of sem.marks) {
      if (!mark.isPassed) {
        backlogsCount++;
      }
    }
  }

  const cgpa = cumulativeCredits > 0 ? Math.round((cumulativeCreditPoints / cumulativeCredits) * 100) / 100 : 0;

  let classification = 'Pass';
  if (backlogsCount > 0) {
    classification = `Pending (${backlogsCount} Arrears)`;
  } else if (cgpa >= 8.5) {
    classification = 'First Class with Distinction';
  } else if (cgpa >= 6.5) {
    classification = 'First Class';
  } else if (cgpa >= 5.0) {
    classification = 'Second Class';
  } else if (cgpa >= 4.0) {
    classification = 'Third Class / Pass';
  } else {
    classification = 'Unclassified / Fail';
  }

  return {
    cgpa,
    cumulativeCredits,
    cumulativeCreditPoints,
    backlogsCount,
    classification,
  };
}

/**
 * Generates and triggers browser download of an RFC-4180 CSV file.
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void {
  const formatCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(formatCell).join(','),
    ...rows.map((row) => row.map(formatCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses CSV file contents into row arrays.
 */
export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}
