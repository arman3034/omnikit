import { SemesterInput } from './types';

export const SAMPLE_SEMESTERS: SemesterInput[] = [
  {
    id: 'sample-sem-1',
    name: 'Fall 2023',
    courses: [
      { id: 'c1', name: 'Intro to Programming', code: 'CS101', credits: '3', grade: '88' }, // A (4.0)
      { id: 'c2', name: 'Calculus I', code: 'MATH101', credits: '3', grade: 'B+' }, // 3.3
      { id: 'c3', name: 'English Comp', code: 'ENG101', credits: '2', grade: 'A-' }  // 3.7
    ]
  },
  {
    id: 'sample-sem-2',
    name: 'Spring 2024',
    courses: [
      { id: 'c4', name: 'Data Structures', code: 'CS102', credits: '4', grade: '72' }, // B (3.0)
      { id: 'c5', name: 'Physics', code: 'PHY101', credits: '3', grade: 'C+' } // 2.3
    ]
  }
];
// Expected: 
// Sem 1: (12 + 9.9 + 7.4) / 8 = 29.3 / 8 = 3.66 SGPA
// Sem 2: (12 + 6.9) / 7 = 18.9 / 7 = 2.70 SGPA
// CGPA: (29.3 + 18.9) / 15 = 48.2 / 15 = 3.21
