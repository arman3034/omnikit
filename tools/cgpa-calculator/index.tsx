import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, RefreshCw, Download, User, GraduationCap, ChevronDown, ChevronUp, Copy, Calculator } from 'lucide-react';
import { Card, Button, InputGroup, Badge } from '../../components/UIComponents';
import { useToast } from '../../components/Toast';
import { CourseInput, StudentProfile, Semester, calculateGPA, calculateOverallCGPA, getGradeDetails } from './calc';
import { generateCgpaPdf } from '../../services/pdfGenerator';

// Robust ID Generator
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createEmptyRow = (): CourseInput => ({
  id: generateId(),
  name: '',
  credits: '',
  grade: ''
});

const createEmptySemester = (name: string): Semester => ({
  id: generateId(),
  name,
  courses: Array(4).fill(null).map(createEmptyRow)
});

const CgpaCalculator: React.FC = () => {
  const { showToast } = useToast();
  
  // Initial State: One empty semester
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const sem1 = createEmptySemester("Semester 1");
    return {
      name: '',
      rollNo: '',
      semesters: [sem1]
    };
  });
  
  const [overallResult, setOverallResult] = useState<{ gpa: number; totalCredits: number; letterEquivalent: string } | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});

  // Refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addSemesterBtnRef = useRef<HTMLButtonElement>(null);

  // Expand the first semester on mount
  useEffect(() => {
    if (profile.semesters.length > 0) {
      const firstId = profile.semesters[0].id;
      setExpandedSemesters(prev => {
        // Only set if not already set (though on mount it's empty)
        if (!prev[firstId]) return { [firstId]: true };
        return prev;
      });
    }
  }, []);

  const initializeDefaults = () => {
    const sem1 = createEmptySemester("Semester 1");
    setProfile({
      name: '',
      rollNo: '',
      semesters: [sem1]
    });
    setExpandedSemesters({ [sem1.id]: true });
    setOverallResult(null);
  };

  const addSemester = () => {
    const nextNum = profile.semesters.length + 1;
    const newSem = createEmptySemester(`Semester ${nextNum}`);
    // Default to 3 rows for new semesters
    newSem.courses = Array(3).fill(null).map(createEmptyRow);
    
    setProfile(prev => ({ ...prev, semesters: [...prev.semesters, newSem] }));
    setExpandedSemesters(prev => ({ ...prev, [newSem.id]: true }));
    showToast(`Added ${newSem.name}`, 'info');
    
    // Scroll to new semester
    setTimeout(() => {
        const element = document.getElementById(`semester-body-${newSem.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const removeSemester = (semId: string) => {
    if (profile.semesters.length <= 1) {
      showToast("Cannot remove the last semester. Use Reset instead.", "error");
      return;
    }

    if (!window.confirm("Delete this semester and all its courses?")) return;

    // Pure state update
    setProfile(prev => ({
      ...prev,
      semesters: prev.semesters.filter(s => s.id !== semId)
    }));

    setExpandedSemesters(prev => {
      const next = { ...prev };
      delete next[semId];
      return next;
    });

    showToast("Semester removed", "success");
    
    // Focus management
    setTimeout(() => {
      addSemesterBtnRef.current?.focus();
    }, 50);
  };

  const toggleSemester = (semId: string) => {
    setExpandedSemesters(prev => ({ ...prev, [semId]: !prev[semId] }));
  };

  // --- Course Row Operations ---

  const addRow = (semId: string) => {
    setProfile(prev => ({
        ...prev,
        semesters: prev.semesters.map(s => 
            s.id === semId ? { ...s, courses: [...s.courses, createEmptyRow()] } : s
        )
    }));
  };

  const removeRow = (semId: string, courseId: string) => {
    setProfile(prev => ({
        ...prev,
        semesters: prev.semesters.map(s => {
            if (s.id === semId) {
                if (s.courses.length <= 1) {
                    showToast("At least one course is required per semester.", "error");
                    return s;
                }
                return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
            }
            return s;
        })
    }));
  };

  const updateRow = (semId: string, courseId: string, field: keyof CourseInput, value: string) => {
    setProfile(prev => ({
        ...prev,
        semesters: prev.semesters.map(s => 
            s.id === semId 
                ? { ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c) } 
                : s
        )
    }));
  };

  const updateSemesterName = (semId: string, newName: string) => {
     setProfile(prev => ({
         ...prev,
         semesters: prev.semesters.map(s => s.id === semId ? { ...s, name: newName } : s)
     }));
  };

  // --- Calculations ---

  const handleCalculate = useCallback(() => {
    const calc = calculateOverallCGPA(profile.semesters);
    if (calc.totalCredits === 0) {
      setOverallResult(null);
      return;
    }
    setOverallResult({
      gpa: calc.gpa,
      totalCredits: calc.totalCredits,
      letterEquivalent: calc.letterEquivalent
    });
  }, [profile.semesters]);

  // Reactive Calculation
  useEffect(() => {
    const hasData = profile.semesters.some(s => s.courses.some(c => c.credits && c.grade));
    if (hasData) {
        handleCalculate();
    } else {
        setOverallResult(null);
    }
  }, [profile.semesters, handleCalculate]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      initializeDefaults();
      showToast("All data cleared", "info");
      
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  };

  const handleDownload = () => {
    if (!overallResult) {
      showToast("Calculate your CGPA first.", "error");
      return;
    }
    try {
      generateCgpaPdf(profile, overallResult);
      showToast("Downloading Report...", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate PDF.", "error");
    }
  };

  const cloneSemester = (semId: string) => {
    const semToClone = profile.semesters.find(s => s.id === semId);
    if (!semToClone) return;

    const newSem = createEmptySemester(`${semToClone.name} (Copy)`);
    // Copy courses structure
    newSem.courses = semToClone.courses.map(c => ({
        ...c, 
        id: generateId(), 
        grade: '' // Reset grades for the copy
    })); 
    
    setProfile(prev => ({ ...prev, semesters: [...prev.semesters, newSem] }));
    setExpandedSemesters(prev => ({ ...prev, [newSem.id]: true }));
    showToast('Semester cloned', 'success');
  };

  return (
    <div className="space-y-8 cgpa-tool">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
         <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
             <Calculator size={28} aria-hidden="true" />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">GPA Calculator</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Track your academic performance across multiple semesters.</p>
         </div>
      </div>

      {/* Student Info Section */}
      <section aria-labelledby="student-info-heading">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
           <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
              <User size={20} aria-hidden="true" />
              <h3 id="student-info-heading" className="font-bold text-lg">Student Information</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                 ref={nameInputRef}
                 label="Student Name" 
                 placeholder="e.g. John Doe" 
                 value={profile.name}
                 onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
              />
              <InputGroup 
                 label="Roll Number / ID" 
                 placeholder="e.g. 2024-CS-101" 
                 value={profile.rollNo}
                 onChange={(e) => setProfile(prev => ({...prev, rollNo: e.target.value}))}
              />
           </div>
        </Card>
      </section>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Main Semesters Area */}
        <div className="flex-grow space-y-6 w-full">
            {profile.semesters.map((semester, semIdx) => {
               const semResult = calculateGPA(semester.courses);
               const isExpanded = expandedSemesters[semester.id];
               const semesterLabel = semester.name || `Semester ${semIdx + 1}`;
               
               return (
                  <div key={semester.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
                     {/* Semester Header */}
                     <div 
                        className={`
                            p-4 flex items-center justify-between select-none transition-colors cursor-pointer
                            ${isExpanded ? 'bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'}
                        `}
                        onClick={() => toggleSemester(semester.id)}
                     >
                        <div className="flex items-center gap-3 flex-grow">
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleSemester(semester.id); }}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                              aria-label={isExpanded ? `Collapse ${semesterLabel}` : `Expand ${semesterLabel}`}
                              aria-expanded={isExpanded}
                              aria-controls={`semester-body-${semester.id}`}
                           >
                              {isExpanded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
                           </button>

                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                               <label htmlFor={`sem-name-${semester.id}`} className="sr-only">Semester Name</label>
                               <input 
                                  id={`sem-name-${semester.id}`}
                                  type="text" 
                                  value={semester.name}
                                  onChange={(e) => updateSemesterName(semester.id, e.target.value)}
                                  className="font-bold text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 w-full max-w-[200px] transition-all px-1"
                                  aria-label={`Edit Name for ${semesterLabel}`}
                                  onClick={(e) => e.stopPropagation()}
                               />
                               {semResult.totalCredits > 0 && !isExpanded && (
                                  <Badge color="green">SGPA: {semResult.gpa.toFixed(2)}</Badge>
                               )}
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                              onClick={(e) => { e.stopPropagation(); cloneSemester(semester.id); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              title="Clone Semester"
                              aria-label={`Clone ${semesterLabel}`}
                           >
                              <Copy size={18} aria-hidden="true" />
                           </button>
                           <button 
                              onClick={(e) => { e.stopPropagation(); removeSemester(semester.id); }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                              title="Delete Semester"
                              aria-label={`Delete ${semesterLabel}`}
                           >
                              <Trash2 size={18} aria-hidden="true" />
                           </button>
                        </div>
                     </div>

                     {/* Semester Body */}
                     {isExpanded && (
                        <div id={`semester-body-${semester.id}`} className="p-0 animate-in slide-in-from-top-2 duration-200">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <caption className="sr-only">Courses for {semesterLabel}</caption>
                                 <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                       <th scope="col" className="p-3 pl-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">#</th>
                                       <th scope="col" className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px]">Course</th>
                                       <th scope="col" className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Credits</th>
                                       <th scope="col" className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Grade</th>
                                       <th scope="col" className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24 hidden sm:table-cell">Points</th>
                                       <th scope="col" className="p-3 w-12"><span className="sr-only">Actions</span></th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {semester.courses.map((course, idx) => {
                                       const details = getGradeDetails(course.grade);
                                       return (
                                          <tr key={course.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                             <td className="p-3 pl-6 text-slate-400 font-mono text-sm">{idx + 1}</td>
                                             <td className="p-3">
                                                <input
                                                   type="text"
                                                   className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 outline-none transition-all py-1 text-sm"
                                                   placeholder="Course Name"
                                                   aria-label={`Course Name row ${idx + 1}`}
                                                   value={course.name}
                                                   onChange={(e) => updateRow(semester.id, course.id, 'name', e.target.value)}
                                                />
                                             </td>
                                             <td className="p-3">
                                                <input
                                                   type="number"
                                                   min="0"
                                                   step="0.5"
                                                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-center"
                                                   placeholder="3"
                                                   aria-label={`Credits for row ${idx + 1}`}
                                                   value={course.credits}
                                                   onChange={(e) => updateRow(semester.id, course.id, 'credits', e.target.value)}
                                                />
                                             </td>
                                             <td className="p-3">
                                                <input
                                                   type="text"
                                                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-center uppercase font-medium"
                                                   placeholder="A / 85"
                                                   aria-label={`Grade or Marks for row ${idx + 1}`}
                                                   value={course.grade}
                                                   onChange={(e) => updateRow(semester.id, course.id, 'grade', e.target.value)}
                                                />
                                             </td>
                                             <td className="p-3 hidden sm:table-cell text-center">
                                                {details ? (
                                                   <span className={`font-mono font-bold ${details.point >= 3 ? 'text-emerald-600 dark:text-emerald-400' : details.point >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                      {details.point.toFixed(1)}
                                                   </span>
                                                ) : (
                                                   <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                             </td>
                                             <td className="p-3 text-center">
                                                <button 
                                                   onClick={() => removeRow(semester.id, course.id)}
                                                   className="text-slate-300 hover:text-rose-500 transition-colors focus:outline-none focus:text-rose-600"
                                                   title="Remove Course"
                                                   aria-label={`Remove course row ${idx + 1}`}
                                                >
                                                   <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                             </td>
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </table>
                           </div>
                           <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => addRow(semester.id)} 
                                className="text-slate-600 dark:text-slate-400"
                                aria-label={`Add new course row to ${semesterLabel}`}
                              >
                                 <Plus size={16} className="mr-2" aria-hidden="true" /> Add Course
                              </Button>
                              <div className="flex items-center gap-3 text-sm" aria-live="polite">
                                 <span className="text-slate-500">Credits: <strong className="text-slate-900 dark:text-slate-200">{semResult.totalCredits}</strong></span>
                                 <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" aria-hidden="true"></div>
                                 <span className="text-slate-500">SGPA: <strong className="text-indigo-600 dark:text-indigo-400 text-lg">{semResult.gpa.toFixed(2)}</strong></span>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
            
            <Button 
                id="add-semester-btn"
                ref={addSemesterBtnRef}
                variant="outline" 
                onClick={addSemester} 
                className="w-full border-dashed border-2 py-4 hover:border-indigo-400 dark:hover:border-indigo-600"
                aria-label="Add Another Semester"
            >
               <Plus size={20} className="mr-2" aria-hidden="true" /> Add Another Semester
            </Button>
        </div>

        {/* Results Sidebar - Sticky */}
        <div className="w-full xl:w-80 flex-shrink-0 space-y-6 sticky top-24">
           <Card className={`text-center transition-all duration-300 relative overflow-hidden ${overallResult ? 'border-indigo-500 ring-4 ring-indigo-500/10' : ''}`}>
              {/* Decorative BG */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/20 pointer-events-none" aria-hidden="true"></div>
              
              <div className="relative">
                 <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <GraduationCap size={32} aria-hidden="true" />
                 </div>
                 <h3 className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-xs mb-2">Overall CGPA</h3>
                 
                 <div 
                    className="text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tight" 
                    aria-live="polite"
                    aria-label={`Calculated Cumulative GPA: ${overallResult ? overallResult.gpa.toFixed(2) : "0.00"}`}
                 >
                    {overallResult ? overallResult.gpa.toFixed(2) : "0.00"}
                 </div>
                 
                 {overallResult && (
                   <div className="flex justify-center items-center gap-2 mb-8 animate-in fade-in zoom-in">
                      <Badge color="indigo">Grade: {overallResult.letterEquivalent}</Badge>
                      <span className="text-sm text-slate-400" aria-hidden="true">|</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{overallResult.totalCredits} Total Credits</span>
                   </div>
                 )}

                 <div className="space-y-3">
                    <Button 
                        onClick={handleDownload} 
                        className="w-full shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40" 
                        disabled={!overallResult} 
                        size="lg"
                        aria-label="Download Report as PDF"
                    >
                       <Download size={18} className="mr-2" aria-hidden="true" /> Download Report PDF
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={handleReset} 
                        size="sm" 
                        className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        aria-label="Clear all calculator data"
                    >
                       <RefreshCw size={14} className="mr-2" aria-hidden="true" /> Clear All Data
                    </Button>
                 </div>
              </div>
           </Card>

           {/* Semester Breakdown Mini-View */}
           {overallResult && profile.semesters.length > 1 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm" aria-label="Performance Trend">
                 <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">Performance Trend</h4>
                 <div className="space-y-2">
                    {profile.semesters.map((s, i) => {
                       const res = calculateGPA(s.courses);
                       if(res.totalCredits === 0) return null;
                       return (
                          <div key={s.id} className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{s.name}</span>
                             <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{res.gpa.toFixed(2)}</span>
                                <div 
                                    className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden" 
                                    role="progressbar" 
                                    aria-valuenow={res.gpa} 
                                    aria-valuemin={0} 
                                    aria-valuemax={4}
                                    aria-label={`GPA bar for ${s.name}`}
                                >
                                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(res.gpa/4)*100}%` }}></div>
                                </div>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CgpaCalculator;