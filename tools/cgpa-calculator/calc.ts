
export interface GradeScaleItem {
  letter: string;
  min: number; // Minimum marks (inclusive)
  point: number;
}

// Standard 4.0 Scale
export const GRADE_SCALE: GradeScaleItem[] = [
  { letter: 'A+', min: 90, point: 4.0 },
  { letter: 'A', min: 85, point: 4.0 },
  { letter: 'A-', min: 80, point: 3.7 },
  { letter: 'B+', min: 77, point: 3.3 },
  { letter: 'B', min: 73, point: 3.0 },
  { letter: 'B-', min: 70, point: 2.7 },
  { letter: 'C+', min: 67, point: 2.3 },
  { letter: 'C', min: 63, point: 2.0 },
  { letter: 'C-', min: 60, point: 1.7 },
  { letter: 'D+', min: 57, point: 1.3 },
  { letter: 'D', min: 53, point: 1.0 },
  { letter: 'F', min: 0, point: 0.0 },
];

export interface CourseInput {
  id: string;
  name: string;
  credits: string; // Keep as string for input handling
  grade: string;   // Can be letter "A" or number "85"
}

export interface Semester {
  id: string;
  name: string;
  courses: CourseInput[];
}

export interface StudentProfile {
  name: string;
  rollNo: string;
  semesters: Semester[];
}

export interface GPAResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  validCourses: number;
  letterEquivalent: string;
}

export const getGradeDetails = (input: string): { letter: string; point: number; isNumeric: boolean } | null => {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return null;

  // Check if numeric
  const numericGrade = parseFloat(trimmed);
  if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
    const match = GRADE_SCALE.find(g => numericGrade >= g.min);
    return match ? { letter: match.letter, point: match.point, isNumeric: true } : { letter: 'F', point: 0, isNumeric: true };
  }

  // Check if letter
  const match = GRADE_SCALE.find(g => g.letter === trimmed);
  if (match) {
    return { letter: match.letter, point: match.point, isNumeric: false };
  }

  return null;
};

// Generic calculator for any list of courses (used for both SGPA and CGPA)
export const calculateGPA = (courses: CourseInput[]): GPAResult => {
  let totalPoints = 0;
  let totalCredits = 0;
  let validCourses = 0;

  courses.forEach(course => {
    const credits = parseFloat(course.credits);
    if (isNaN(credits) || credits <= 0) return;

    const details = getGradeDetails(course.grade);
    if (details) {
      totalPoints += (details.point * credits);
      totalCredits += credits;
      validCourses++;
    }
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  // Find letter equivalent for the final GPA
  let finalLetter = 'F';
  if (totalCredits > 0) {
      const match = GRADE_SCALE.find(g => gpa >= g.point);
      if (!match && gpa >= 4.0) finalLetter = 'A+';
      else if (match) finalLetter = match.letter;
      else finalLetter = 'F';
  }

  return {
    gpa: parseFloat(gpa.toFixed(2)),
    totalCredits,
    totalPoints,
    validCourses,
    letterEquivalent: finalLetter
  };
};

export const calculateOverallCGPA = (semesters: Semester[]): GPAResult => {
  const allCourses = semesters.flatMap(s => s.courses);
  return calculateGPA(allCourses);
};
