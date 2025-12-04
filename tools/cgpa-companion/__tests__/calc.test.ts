import { calculateCGPA, calculateSemesterGPA, gradeToPoint, marksToLetter } from '../calc';
import { SAMPLE_SEMESTERS } from '../sample-data';

const runTests = () => {
  console.log("Running CGPA Companion Tests...");

  // 1. Grade Conversion
  console.assert(gradeToPoint('A+') === 4.0, 'A+ should be 4.0');
  console.assert(gradeToPoint('95') === 4.0, '95 marks should be 4.0');
  console.assert(gradeToPoint('F') === 0.0, 'F should be 0.0');
  console.assert(gradeToPoint('50') === 1.0, '50 marks should be 1.0 (D)');
  console.assert(marksToLetter(77) === 'B+', '77 marks should be B+');

  // 2. SGPA Calculation
  const sem1 = SAMPLE_SEMESTERS[0];
  const sem1Res = calculateSemesterGPA(sem1.courses);
  console.assert(sem1Res.sgpa === 3.66, `Sem 1 SGPA expected 3.66, got ${sem1Res.sgpa}`);

  // 3. CGPA Calculation
  const res = calculateCGPA(SAMPLE_SEMESTERS);
  console.assert(res.cgpa === 3.21, `CGPA expected 3.21, got ${res.cgpa}`);
  console.assert(res.totalCredits === 15, `Total credits expected 15, got ${res.totalCredits}`);

  console.log("CGPA Companion Tests Completed.");
};

export default runTests;
