
import { getGradeDetails, calculateGPA, calculateOverallCGPA, CourseInput, Semester } from './calc';

const runTests = () => {
  console.log('Running Semester GPA Calc Tests...');

  // Test 1: Grade Conversion
  const t1 = getGradeDetails('A');
  console.assert(t1?.point === 4.0, 'Grade A should be 4.0');
  
  const t2 = getGradeDetails('87');
  console.assert(t2?.point === 4.0, 'Marks 87 should be 4.0 (A)');
  
  // Test 2: Single Semester GPA (SGPA)
  const courses: CourseInput[] = [
    { id: '1', name: 'Math', credits: '3', grade: 'A' }, // 4.0 * 3 = 12
    { id: '2', name: 'English', credits: '2', grade: 'B' }, // 3.0 * 2 = 6
  ];
  // Total Points = 18, Total Credits = 5, SGPA = 3.6
  const res = calculateGPA(courses);
  console.assert(res.gpa === 3.6, `Expected SGPA 3.6, got ${res.gpa}`);
  console.assert(res.totalCredits === 5, 'Total credits should be 5');

  // Test 3: Cumulative CGPA (Multiple Semesters)
  const sem1: Semester = { id: 's1', name: 'Sem 1', courses: courses }; // 18 pts / 5 cr
  
  const courses2: CourseInput[] = [
     { id: '3', name: 'Physics', credits: '4', grade: 'C' } // 2.0 * 4 = 8 pts
  ];
  const sem2: Semester = { id: 's2', name: 'Sem 2', courses: courses2 }; // 8 pts / 4 cr

  // Combined: Total Points = 18 + 8 = 26, Total Credits = 5 + 4 = 9
  // CGPA = 26 / 9 = 2.888... -> 2.89
  const cumulative = calculateOverallCGPA([sem1, sem2]);
  
  console.assert(cumulative.gpa === 2.89, `Expected CGPA 2.89, got ${cumulative.gpa}`);
  console.assert(cumulative.totalCredits === 9, 'Total cumulative credits should be 9');

  console.log('Tests Completed.');
};

export default runTests;
