import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, RefreshCw, Download, User, GraduationCap, Calculator, Copy, BookOpen } from 'lucide-react';
import { Card, Button, InputGroup, Badge } from '../../components/UIComponents';
import { useToast } from '../../components/Toast';
import { CourseInput, SemesterInput, StudentProfile, GPAResult } from './types';
import { calculateCGPA, gradeToPoint, marksToLetter } from './calc';
import { generateCgpaPdf } from './CgpaPdf';
import { SAMPLE_SEMESTERS } from './sample-data';

const TEXTS = {
  title: "CGPA Companion",
  desc: "Master your academic journey with precise GPA tracking.",
  addSem: "Add Semester",
  calc: "Calculate CGPA",
  clear: "Clear All",
  sample: "Load Sample Data"
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const CgpaCompanion: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [profile, setProfile] = useState<StudentProfile>({ name: '', rollNo: '', program: '' });
  const [semesters, setSemesters] = useState<SemesterInput[]>([
    { id: generateId(), name: 'Semester 1', courses: [{ id: generateId(), name: '', code: '', credits: '', grade: '' }] }
  ]);
  const [result, setResult] = useState<GPAResult | null>(null);

  // Handlers
  const addSemester = () => {
    setSemesters([...semesters, {
      id: generateId(),
      name: `Semester ${semesters.length + 1}`,
      courses: [{ id: generateId(), name: '', code: '', credits: '', grade: '' }]
    }]);
  };

  const removeSemester = (id: string) => {
    alert(`Delete button clicked! ID: ${id}`);
    console.log('removeSemester called with id:', id);
    console.log('Current semesters:', semesters);

    if (semesters.length === 1) {
      showToast("Cannot remove the only semester. Try clearing it instead.", "error");
      return;
    }

    if (window.confirm("Delete this semester?")) {
      console.log('User confirmed deletion');
      const newSemesters = semesters.filter(s => s.id !== id);
      console.log('New semesters after filter:', newSemesters);
      setSemesters(newSemesters);
      setResult(null);
      showToast("Semester deleted", "success");
    } else {
      console.log('User cancelled deletion');
    }
  };

  const clearSemester = (id: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, courses: [{ id: generateId(), name: '', code: '', credits: '', grade: '' }] } : s));
    setResult(null);
    showToast("Semester cleared", "info");
  };

  const addCourse = (semId: string) => {
    setSemesters(semesters.map(s =>
      s.id === semId ? { ...s, courses: [...s.courses, { id: generateId(), name: '', code: '', credits: '', grade: '' }] } : s
    ));
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id !== semId) return s;
      if (s.courses.length === 1) {
        showToast("Minimum one course required.", "error");
        return s;
      }
      return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
    }));
  };

  const updateCourse = (semId: string, courseId: string, field: keyof CourseInput, val: string) => {
    setSemesters(semesters.map(s =>
      s.id === semId ? {
        ...s,
        courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: val } : c)
      } : s
    ));
  };

  const handleCalculate = () => {
    const res = calculateCGPA(semesters);
    setResult(res);
    showToast("CGPA Calculated!", "success");
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm("Clear all data?")) {
      setProfile({ name: '', rollNo: '', program: '' });
      setSemesters([{ id: generateId(), name: 'Semester 1', courses: [{ id: generateId(), name: '', code: '', credits: '', grade: '' }] }]);
      setResult(null);
    }
  };

  const loadSample = () => {
    if (window.confirm("Load sample data? This will replace current entries.")) {
      setProfile({ name: 'Alex Doe', rollNo: '2024-CS-007', program: 'Computer Science' });
      setSemesters(SAMPLE_SEMESTERS);
      handleCalculate();
    }
  };

  const handleDownload = () => {
    if (!result) {
      console.warn('No result available for PDF generation');
      return;
    }

    console.log('=== PDF Download Started ===');
    console.log('Profile:', profile);
    console.log('Semesters:', semesters.length);
    console.log('Result:', result);

    try {
      generateCgpaPdf(profile, semesters, result);
      showToast("PDF Download Started!", "success");
      console.log('=== PDF Download Completed ===');
    } catch (error) {
      console.error("=== PDF Download Error ===");
      console.error("Error details:", error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      showToast("Failed to download PDF. Check console for details.", "error");
    }
  };


  const handleCopy = () => {
    if (!result) return;
    const text = `Name: ${profile.name}\nCGPA: ${result.cgpa}\nTotal Credits: ${result.totalCredits}`;
    navigator.clipboard.writeText(text);
    showToast("Result copied to clipboard", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{TEXTS.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{TEXTS.desc}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSample}>{TEXTS.sample}</Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300 font-bold">
          <User size={20} /> Student Profile
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputGroup label="Full Name" placeholder="e.g. Alex Doe" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          <InputGroup label="Roll No / ID" placeholder="e.g. CS-2024-001" value={profile.rollNo} onChange={e => setProfile({ ...profile, rollNo: e.target.value })} />
          <InputGroup label="Program" placeholder="e.g. BSCS" value={profile.program} onChange={e => setProfile({ ...profile, program: e.target.value })} />
        </div>
      </Card>

      {/* Semesters */}
      <div className="space-y-6">
        {semesters.map((sem, sIdx) => (
          <div key={sem.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <input
                  className="bg-transparent font-bold text-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-b-2 focus:border-indigo-500 w-48"
                  value={sem.name}
                  onChange={(e) => {
                    setSemesters(semesters.map(s =>
                      s.id === sem.id ? { ...s, name: e.target.value } : s
                    ));
                  }}
                  aria-label={`Semester Name for ${sem.name}`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSemester(sem.id)}
                  className="text-slate-500 hover:text-orange-500"
                  aria-label={`Clear ${sem.name}`}
                  title="Clear Semester"
                >
                  <RefreshCw size={16} />
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('NATIVE BUTTON CLICKED!', sem.id);
                    removeSemester(sem.id);
                  }}
                  className="px-3 py-1.5 text-sm text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  aria-label={`Delete ${sem.name}`}
                  title="Delete Semester"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 pl-2 w-32">Code (Opt)</th>
                    <th className="pb-3">Course Name</th>
                    <th className="pb-3 w-24">Credits</th>
                    <th className="pb-3 w-32">Grade/Marks</th>
                    <th className="pb-3 w-16 text-center">GP</th>
                    <th className="pb-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sem.courses.map((course, idx) => {
                    const gp = gradeToPoint(course.grade);
                    const isInvalid = course.grade && gp === null;
                    return (
                      <tr key={course.id} className="group border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="p-2">
                          <input
                            className="w-full bg-transparent outline-none"
                            placeholder="CS101"
                            value={course.code}
                            onChange={e => updateCourse(sem.id, course.id, 'code', e.target.value)}
                            aria-label={`Course Code row ${idx + 1}`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full bg-transparent outline-none font-medium"
                            placeholder="Course Title"
                            value={course.name}
                            onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)}
                            aria-label={`Course Name row ${idx + 1}`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number" min="0" step="0.5"
                            className="w-full bg-slate-100 dark:bg-slate-900 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                            placeholder="3"
                            value={course.credits}
                            onChange={e => updateCourse(sem.id, course.id, 'credits', e.target.value)}
                            aria-label={`Credits row ${idx + 1}`}
                          />
                        </td>
                        <td className="p-2 relative">
                          <input
                            className={`w-full bg-slate-100 dark:bg-slate-900 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-bold text-center ${isInvalid ? 'ring-2 ring-rose-500 text-rose-500' : ''}`}
                            placeholder="A / 85"
                            value={course.grade}
                            onChange={e => updateCourse(sem.id, course.id, 'grade', e.target.value)}
                            aria-label={`Grade or Marks row ${idx + 1}`}
                          />
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-slate-400">
                          {gp !== null ? gp.toFixed(1) : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeCourse(sem.id, course.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                            aria-label={`Remove course row ${idx + 1}`}
                            title="Remove Course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => addCourse(sem.id)}>
                <Plus size={16} className="mr-2" /> Add Course
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full py-4 border-dashed" onClick={addSemester}>
          <Plus size={20} className="mr-2" /> Add Another Semester
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button size="lg" className="flex-1 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50" onClick={handleCalculate}>
          <Calculator size={20} className="mr-2" /> Calculate CGPA
        </Button>
        <Button variant="secondary" size="lg" onClick={handleReset}>
          {TEXTS.clear}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-in zoom-in duration-300">
          <Card className="border-indigo-500 ring-4 ring-indigo-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GraduationCap size={120} />
            </div>
            <div className="relative z-10 text-center py-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Cumulative GPA</h3>
              <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 mb-4">{result.cgpa.toFixed(2)}</div>
              <div className="flex justify-center gap-4 mb-8">
                <Badge color="indigo">Total Credits: {result.totalCredits}</Badge>
                <Badge color="green">Total Points: {result.totalPoints.toFixed(1)}</Badge>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleDownload}>
                  <Download size={18} className="mr-2" /> Download PDF Report
                </Button>
                <Button variant="outline" onClick={handleCopy}>
                  <Copy size={18} className="mr-2" /> Copy Result
                </Button>
              </div>
            </div>

            {/* Semester Breakdown */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
              <h4 className="font-bold mb-4 px-4">Semester Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
                {result.semesterResults.map((sr, i) => (
                  <div key={sr.semesterId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{semesters[i].name}</span>
                    <div className="flex gap-3">
                      <span className="text-xs text-slate-500 self-center">{sr.totalCredits} Cr</span>
                      <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                        SGPA: {sr.sgpa.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CgpaCompanion;