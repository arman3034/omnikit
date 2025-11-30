export interface CourseInput {
  id: string;
  name: string;
  code: string;
  credits: string; // string to handle input state easily
  grade: string;   // Letter or numeric marks
}

export interface SemesterInput {
  id: string;
  name: string;
  courses: CourseInput[];
}

export interface StudentProfile {
  name: string;
  rollNo: string;
  program: string;
}

export interface SemesterResult {
  semesterId: string;
  totalCredits: number;
  totalPoints: number;
  sgpa: number;
}

export interface GPAResult {
  cgpa: number;
  totalCredits: number;
  totalPoints: number;
  semesterResults: SemesterResult[];
}
