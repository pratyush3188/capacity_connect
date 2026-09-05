import React, { useState, useEffect } from 'react';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { Course } from '../../../types';
import {
  Compass,
  Search,
  Filter,
  Star,
  User,
  Clock,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { courseService } from '../../../services/api/courseService';
import { traineeService } from '../../../services/api/traineeService';

export const CourseCatalogView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [modalCourse, setModalCourse] = useState<Course | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const handleOpenCourse = (e: any) => {
      const courseId = e.detail;
      const course = courses.find((c: any) => c.id === courseId || c._id === courseId);
      if (course) {
        setModalCourse(course);
      }
    };
    window.addEventListener('openCourseModal', handleOpenCourse);
    return () => window.removeEventListener('openCourseModal', handleOpenCourse);
  }, [courses]);

  const handleEnroll = async (courseId: string, title: string) => {
    try {
      setEnrollingId(courseId);
      await traineeService.enrollInCourse(courseId);
      showToast(`Enrolled in "${title}" successfully!`);
      setActiveTab('my-learning');
    } catch (err: any) {
      showToast(err.message || 'Already enrolled in this course');
      setActiveTab('my-learning');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSubject = selectedSubject === 'All' || course.subject === selectedSubject;
    const matchesDiff = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesDiff && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-sm text-slate-300">Loading Live Course Catalog from MongoDB...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400" />
            <span>Operational Capacity Course Catalog</span>
          </h2>
          <p className="text-xs text-slate-400">Certified courses created by IMD & MoES senior scientists for operational capacity enhancement.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            <option value="Radar Meteorology">Radar Meteorology</option>
            <option value="Numerical Modeling">Numerical Modeling</option>
            <option value="Remote Sensing">Remote Sensing</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Instrumentation">Instrumentation</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Published Courses Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Switch to the Admin portal to create and publish courses. Once published, courses will appear live here for trainees.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-700"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 mb-4">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2">
                    <Badge variant="cyan">{course.code}</Badge>
                  </span>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-slate-950/80 px-2 py-0.5 text-xs text-amber-400 font-bold border border-slate-800">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-cyan-400">{course.subject}</span>
                  <span className="font-mono text-slate-400">{course.duration}</span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{course.description}</p>

                {/* Trainer Info */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <img src={course.trainerAvatar} alt={course.trainerName} className="h-5 w-5 rounded-full object-cover" />
                  <span className="truncate">{course.trainerName}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setModalCourse(course)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition-all border border-slate-700"
                >
                  View Course
                </button>

                <button
                  onClick={() => handleEnroll(course.id || (course as any)._id, course.title)}
                  disabled={enrollingId === (course.id || (course as any)._id)}
                  className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-md shadow-cyan-500/20"
                >
                  {enrollingId === (course.id || (course as any)._id) ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Detail Modal (Udemy Style) */}
      {modalCourse && (
        <Modal
          isOpen={!!modalCourse}
          onClose={() => setModalCourse(null)}
          title={`${modalCourse.code}: ${modalCourse.title}`}
          subtitle={`Subject: ${modalCourse.subject} • Trainer: ${modalCourse.trainerName}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Left Column: Details & Curriculum */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <img src={modalCourse.thumbnail} alt={modalCourse.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="mb-2"><Badge variant="cyan">{modalCourse.difficulty}</Badge></div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">{modalCourse.title}</h2>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-2">About This Course</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                  {modalCourse.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3">Course Curriculum</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                          {num}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Module {num}: {num === 1 ? 'Introduction & Fundamentals' : num === 2 ? 'Core Concepts & Analysis' : 'Advanced Applications'}</h4>
                          <span className="text-[10px] text-slate-400">{num === 2 ? 'Interactive Lab' : 'Video Lecture'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">1h 30m</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Enrollment Info */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl sticky top-0">
                <div className="text-center mb-4">
                  <span className="text-2xl font-black text-white block">Free</span>
                  <span className="text-xs text-emerald-400 font-bold">IMD Employee Benefit</span>
                </div>

                <button
                  onClick={() => {
                    handleEnroll(modalCourse.id || (modalCourse as any)._id, modalCourse.title);
                    setModalCourse(null);
                  }}
                  disabled={enrollingId === (modalCourse.id || (modalCourse as any)._id)}
                  className="w-full py-3 mb-4 text-sm font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {enrollingId === (modalCourse.id || (modalCourse as any)._id) ? 'Enrolling...' : 'Enroll Now'}
                </button>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-start gap-2 text-xs">
                    <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Prerequisites</span>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        {modalCourse.prerequisites?.map((p, i) => <li key={i}>{p}</li>)}
                        {(!modalCourse.prerequisites || modalCourse.prerequisites.length === 0) && <li>None</li>}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs mt-3">
                    <BrainCircuit className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Competencies Covered</span>
                      <ul className="list-disc list-inside text-cyan-400/80 mt-1">
                        {modalCourse.competenciesCovered?.map((c, i) => <li key={i}>{c}</li>)}
                        {(!modalCourse.competenciesCovered || modalCourse.competenciesCovered.length === 0) && <li>General Meteorology</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
