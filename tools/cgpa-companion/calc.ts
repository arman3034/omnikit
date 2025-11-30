import { CourseInput, SemesterInput, GPAResult, SemesterResult } from './types';

// Grade Scale Configuration
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0,
  'D': 1.0, 'F': 0.0
};

export const marksToLetter = (marks: number): string => {
  if (marks >= 90) return 'A+';
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 55) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
};

export const gradeToPoint = (grade: string): number | null => {
  const g = grade.trim().toUpperCase();
  // Check if direct letter match
  if (GRADE_POINTS.hasOwnProperty(g)) {
    return GRADE_POINTS[g];
  }
  
  // Check if numeric
  const marks = parseFloat(g);
  if (!isNaN(marks) && marks >= 0 && marks <= 100) {
    const letter = marksToLetter(marks);
    return GRADE_POINTS[letter];
  }

  return null;
};

export const calculateSemesterGPA = (courses: CourseInput[]): { sgpa: number; totalCredits: number; totalPoints: number } => {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach(course => {
    const cred = parseFloat(course.credits);
    const point = gradeToPoint(course.grade);

    if (!isNaN(cred) && cred > 0 && point !== null) {
      totalCredits += cred;
      totalPoints += (point * cred);
    }
  });

  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return {
    sgpa: parseFloat(sgpa.toFixed(2)),
    totalCredits,
    totalPoints
  };
};

export const calculateCGPA = (semesters: SemesterInput[]): GPAResult => {
  let grandTotalPoints = 0;
  let grandTotalCredits = 0;
  const semesterResults: SemesterResult[] = [];

  semesters.forEach(sem => {
    const { sgpa, totalCredits, totalPoints } = calculateSemesterGPA(sem.courses);
    grandTotalPoints += totalPoints;
    grandTotalCredits += totalCredits;
    semesterResults.push({
      semesterId: sem.id,
      sgpa,
      totalCredits,
      totalPoints
    });
  });

  const cgpa = grandTotalCredits > 0 ? grandTotalPoints / grandTotalCredits : 0;

  return {
    cgpa: parseFloat(cgpa.toFixed(2)),
    totalCredits: grandTotalCredits,
    totalPoints: grandTotalPoints,
    semesterResults
  };
};
