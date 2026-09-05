import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { courseService } from '../../../services/api/courseService';
import {
  FileText, PlusCircle, HelpCircle, Clock, Award, CheckCircle,
  Loader2, Sparkles, Trash2, Edit3, Save, X, ChevronDown, Users
} from 'lucide-react';
import { AssessmentEditorView } from './AssessmentEditorView';

interface QuestionDraft {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const TrainerAssessmentsView: React.FC = () => {
  const { showToast } = useApp();
  const { user } = useAuth();

  // Assessment list
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trainer's courses for dropdown
  const [trainerCourses, setTrainerCourses] = useState<any[]>([]);

  // Create assessment modal
  const [isCreating, setIsCreating] = useState(false);

  // Question drafts for the create form
  const [questionDrafts, setQuestionDrafts] = useState<QuestionDraft[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Question Bank Editor modal
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [loadingEditQuestions, setLoadingEditQuestions] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState<string | null>(null);

  // Load assessments and courses
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asmData, coursesData] = await Promise.all([
        courseService.getTrainerAssessments(),
        courseService.getCourses()
      ]);
      setAssessments(asmData || []);
      // Filter to only courses by this trainer
      const myCourses = (coursesData || []).filter(
        (c: any) => c.trainerId === user?.id || c.status === 'published'
      );
      setTrainerCourses(myCourses.length > 0 ? myCourses : coursesData || []);
    } catch (err) {
      console.error('Failed to load trainer assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  // View Responses Modal
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [currentAssessmentTitle, setCurrentAssessmentTitle] = useState('');

  const handleViewResponses = async (asm: any) => {
    try {
      setLoadingResponses(true);
      setCurrentAssessmentTitle(asm.title);
      setShowResponsesModal(true);
      const res = await courseService.getAssessmentResponses(asm.id || asm._id);
      setAssessmentResponses(res || []);
    } catch (err) {
      showToast('Failed to load responses');
    } finally {
      setLoadingResponses(false);
    }
  };

  // Open Question Bank Editor
  const openQuestionBank = async (asm: any) => {
    setEditingAssessment(asm);
    try {
      setLoadingEditQuestions(true);
      const questions = await courseService.getTrainerAssessmentQuestions(asm.id);
      setEditQuestions(questions || []);
    } catch (err) {
      showToast('Failed to load questions');
    } finally {
      setLoadingEditQuestions(false);
    }
  };

  // Save edited question
  const handleSaveQuestion = async (question: any) => {
    try {
      setSavingQuestion(question._id);
      await courseService.updateQuestion(question._id, {
        questionText: question.questionText,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        explanation: question.explanation
      });
      showToast('Question updated!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update question');
    } finally {
      setSavingQuestion(null);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await courseService.deleteAssessmentQuestion(questionId);
      setEditQuestions(prev => prev.filter(q => q._id !== questionId));
      showToast('Question deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete question');
    }
  };

  // Update edit question field
  const updateEditQuestion = (qId: string, field: string, value: any) => {
    setEditQuestions(prev => prev.map(q => q._id === qId ? { ...q, [field]: value } : q));
  };

  const updateEditOption = (qId: string, oIdx: number, value: string) => {
    setEditQuestions(prev => prev.map(q => {
      if (q._id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[oIdx] = value;
      return { ...q, options: newOptions };
    }));
  };

  // AI Generate more questions for existing assessment
  const handleAiGenerateForExisting = async () => {
    if (!editingAssessment) return;
    const course = trainerCourses.find((c: any) => c.id === editingAssessment.courseId?.toString());
    try {
      setAiGenerating(true);
      const result = await courseService.aiGenerateQuestions({
        assessmentId: editingAssessment.id,
        courseId: editingAssessment.courseId,
        subject: course?.subject || 'Meteorology',
        competencyName: course?.competenciesCovered?.[0] || 'Operational Meteorology'
      });
      // Reload questions
      const updatedQuestions = await courseService.getTrainerAssessmentQuestions(editingAssessment.id);
      setEditQuestions(updatedQuestions || []);
      showToast(`AI generated ${result.questions?.length || 0} new questions and saved them!`);
    } catch (err: any) {
      showToast(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="ml-3 text-sm text-slate-300">Loading Assessments...</span>
      </div>
    );
  }

  if (isCreating) {
    return (
      <AssessmentEditorView 
        trainerCourses={trainerCourses} 
        onClose={() => setIsCreating(false)} 
        onSuccess={() => { setIsCreating(false); loadData(); }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>Assessment Authoring & Question Bank</span>
          </h2>
          <p className="text-xs text-slate-400">Build MCQ tests with manual or AI-generated questions, configure timers, and manage question banks.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create MCQ Quiz</span>
        </button>
      </div>

      {/* Grid */}
      {assessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Assessments Created Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">
            Create your first MCQ assessment for your courses. You can add questions manually or use AI to auto-generate them.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
          >
            Create First Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((asm) => (
            <div key={asm.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="cyan">{asm.difficulty}</Badge>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {asm.durationMinutes} mins
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-white leading-snug">{asm.title}</h3>
                <p className="text-xs text-emerald-400 mt-1">{asm.courseTitle}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Question Pool</span>
                    <span className="font-bold text-white">{asm.totalQuestions} Questions</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pass Benchmark</span>
                    <span className="font-bold text-emerald-400">{asm.passingScore}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => handleViewResponses(asm)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Users className="h-3.5 w-3.5" />
                  View Responses
                </button>
                <button
                  onClick={() => openQuestionBank(asm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Questions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== VIEW RESPONSES MODAL ========== */}
      <Modal
        isOpen={showResponsesModal}
        onClose={() => setShowResponsesModal(false)}
        title={`Responses: ${currentAssessmentTitle}`}
        subtitle="View all trainees who have submitted this assessment."
        maxWidth="4xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loadingResponses ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : assessmentResponses.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No responses yet for this assessment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Trainee Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {assessmentResponses.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {r.traineeId?.name || 'Unknown User'}
                      </td>
                      <td className="px-4 py-3">{r.traineeId?.email || 'N/A'}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{r.score}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'passed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {new Date(r.completedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowResponsesModal(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-sm font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>



      {/* ========== QUESTION BANK EDITOR MODAL ========== */}
      {editingAssessment && (
        <Modal
          isOpen={!!editingAssessment}
          onClose={() => setEditingAssessment(null)}
          title={`Question Bank: ${editingAssessment.title}`}
          subtitle={`${editingAssessment.courseTitle} • ${editQuestions.length} Questions`}
          maxWidth="4xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Actions Bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">
                {editQuestions.length} questions in bank
              </span>
              <button
                onClick={handleAiGenerateForExisting}
                disabled={aiGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold disabled:opacity-50"
              >
                {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {aiGenerating ? 'Generating...' : 'Add AI Questions'}
              </button>
            </div>

            {loadingEditQuestions ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading question bank...</p>
              </div>
            ) : editQuestions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No questions in this assessment yet. Use "Add AI Questions" to generate some.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {editQuestions.map((q, idx) => (
                  <div key={q._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">Question {idx + 1}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveQuestion(q)}
                          disabled={savingQuestion === q._id}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold disabled:opacity-50"
                        >
                          {savingQuestion === q._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          Save
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={q.questionText}
                      onChange={(e) => updateEditQuestion(q._id, 'questionText', e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-white text-xs resize-none"
                      rows={2}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {(q.options || []).map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="flex items-center gap-1">
                          <button
                            onClick={() => updateEditQuestion(q._id, 'correctOptionIndex', oIdx)}
                            className={`flex-shrink-0 h-5 w-5 rounded-full border text-[9px] font-bold flex items-center justify-center ${
                              q.correctOptionIndex === oIdx
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateEditOption(q._id, oIdx, e.target.value)}
                            className="flex-1 rounded border border-slate-800 bg-slate-950 p-1.5 text-white text-[10px]"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => updateEditQuestion(q._id, 'explanation', e.target.value)}
                      placeholder="Explanation"
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-white text-[10px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
