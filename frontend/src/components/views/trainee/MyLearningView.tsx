import React, { useState, useEffect } from 'react';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import {
  BookOpen,
  PlayCircle,
  Clock,
  FileText,
  Video,
  Download,
  CheckCircle,
  Sparkles,
  Loader2,
  Trophy,
  CheckCircle2,
  ListVideo
} from 'lucide-react';
import { Course, ResourceItem } from '../../../types';
import { traineeService } from '../../../services/api/traineeService';

export const MyLearningView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [enrollmentData, resourceData] = await Promise.all([
          traineeService.getMyEnrollments(),
          traineeService.getResources()
        ]);

        const mappedCourses: Course[] = (enrollmentData || []).map((e: any) => {
          const c = e.course || e.courseId || {};
          return {
            id: c._id || e._id,
            code: c.code || 'COURSE',
            title: c.title || 'Operational Course',
            subject: c.subject || 'Meteorology',
            description: c.description || '',
            difficulty: c.difficulty || 'Intermediate',
            duration: c.duration || '30 hrs',
            trainerName: c.trainerId?.name || 'Senior IMD Scientist',
            trainerAvatar: c.trainerId?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            rating: 4.8,
            enrolledCount: 34,
            status: c.status || 'published',
            progress: c.progress ?? e.progressPercentage ?? 0,
            competenciesCovered: c.competenciesCovered || [],
            prerequisites: c.prerequisites || [],
            modules: c.modules || [],
            trainerId: c.trainerId || 'trainer-1',
            completionRate: c.completionRate || 0,
            reviewCount: c.reviewCount || 0,
            resourcesCount: c.resourcesCount || 0
          } as Course;
        });

        setEnrolledCourses(mappedCourses);
        setResources(resourceData || []);
      } catch (err) {
        console.error('Failed to load my learning data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-sm text-slate-300">Loading Enrolled Courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <span>My Learning Journey</span>
          </h2>
          <p className="text-xs text-slate-400">Track active course progress, video lectures, and operational training resources.</p>
        </div>
      </div>

      {/* Course Cards Grid */}
      {enrolledCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Active Enrolled Courses</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">
            Enroll in a course from the Course Catalog or through your personalized Skill Gap Analysis pathway.
          </p>
          <button
            onClick={() => setActiveTab('courses')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20"
          >
            Browse Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 mb-4">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute top-2 left-2">
                  <Badge variant="cyan">{course.code}</Badge>
                </span>
                <span className="absolute bottom-2 right-2 text-xs font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  {course.duration}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-cyan-400">{course.subject}</span>
                <span>•</span>
                <span>{course.difficulty}</span>
              </div>
              <h3 className="mt-1 text-base font-bold text-white">{course.title}</h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{course.description}</p>
            </div>

            {/* Progress & Continue Button */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Completion Progress</span>
                <span className="font-bold text-cyan-400">{course.progress}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              <button
                onClick={() => {
                  setActiveCourse(course);
                  showToast(`Opening interactive workspace for ${course.code}`);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20 transition-all"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Recently Accessed Resources */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>Learning Resources & Assets</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map((r: any) => (
            <div key={r._id || r.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-cyan-400 uppercase">{r.category || 'resource'}</span>
                <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{r.title}</h4>
                <span className="text-[10px] text-slate-500 uppercase">{r.type} • {r.fileSize || 'N/A'}</span>
              </div>
              
              {['code', 'script', 'text'].includes(r.type) ? (
                <button
                  onClick={() => setSelectedResource(r)}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 text-[10px] font-bold px-2"
                >
                  View
                </button>
              ) : (
                <a
                  href={r.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Content Modal */}
      {selectedResource && (
        <Modal
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          title={selectedResource.title}
          subtitle={`Category: ${selectedResource.category} • Type: ${selectedResource.type}`}
          maxWidth="2xl"
        >
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            {['code', 'script'].includes(selectedResource.type) ? (
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                <code>{selectedResource.content || 'No content available'}</code>
              </pre>
            ) : (
              <div className="p-4 bg-slate-900 text-slate-200 text-sm whitespace-pre-wrap">
                {selectedResource.content || 'No content available'}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setSelectedResource(null)} className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700">Close</button>
          </div>
        </Modal>
      )}

      {/* Udemy-style Course Player Modal */}
      {activeCourse && (
        <Modal
          isOpen={!!activeCourse}
          onClose={() => setActiveCourse(null)}
          title={`${activeCourse.code}: ${activeCourse.title}`}
          subtitle={`Trainer: ${activeCourse.trainerName}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 max-h-[80vh]">
            
            {/* Left side: Video Player */}
            <div className="lg:col-span-2 flex flex-col bg-black">
              <div className="relative aspect-video w-full bg-black flex items-center justify-center border-b border-slate-800 shadow-2xl">
                {/* Dummy Video Player UI */}
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" 
                  title="Course Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-2">Module 1: Introduction and Fundamentals</h3>
                <p className="text-xs text-slate-400 mb-4">
                  In this module, you will learn the core basics required for understanding atmospheric modeling and radar detection.
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><Video className="h-4 w-4 text-cyan-400" /> 1h 30m</span>
                  <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"><FileText className="h-4 w-4 text-emerald-400" /> 2 Attachments</span>
                </div>
              </div>
            </div>

            {/* Right side: Course Content (Playlist) */}
            <div className="bg-slate-900 flex flex-col border-l border-slate-800 max-h-[80vh]">
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 flex items-center gap-2">
                <ListVideo className="h-5 w-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Course Content</h4>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {(activeCourse.modules?.length || 0) > 0 ? (
                  activeCourse.modules!.map((mod: any, idx: number) => (
                    <div 
                      key={mod.id || idx} 
                      className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-all ${idx === 0 ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        {idx === 0 ? (
                          <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                            <PlayCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : mod.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-600 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${idx === 0 ? 'text-cyan-400' : 'text-slate-200'}`}>
                          {mod.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Video className="h-3 w-3" /> {idx === 0 ? '1h 30m' : '2h 15m'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback dummy modules if none in DB for this course
                  [1, 2, 3].map((num) => (
                    <div 
                      key={num} 
                      className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-all ${num === 1 ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        {num === 1 ? (
                          <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                            <PlayCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-600 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                            {num}
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${num === 1 ? 'text-cyan-400' : 'text-slate-200'}`}>
                          Module {num}: {num === 1 ? 'Introduction' : num === 2 ? 'Core Analysis' : 'Advanced Deployment'}
                        </h5>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Video className="h-3 w-3" /> 1h 30m
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
