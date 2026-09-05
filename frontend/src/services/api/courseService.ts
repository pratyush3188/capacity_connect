import { Course, ResourceItem, Assessment, Certificate } from '../../types';
import { fetchApi } from './apiClient';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const rawCourses = await fetchApi('/courses');
    return rawCourses.map((c: any) => ({
      id: c._id || c.id,
      code: c.code,
      title: c.title,
      subject: c.subject,
      description: c.description,
      difficulty: c.difficulty,
      duration: c.duration,
      trainerName: c.trainerId?.name || 'Senior IMD Scientist',
      trainerAvatar: c.trainerId?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      enrolledCount: 34,
      status: c.status,
      progress: c.progress || 0,
      competenciesCovered: c.competenciesCovered || [],
      prerequisites: c.prerequisites || [],
      modules: c.modules || [],
      trainerId: c.trainerId?._id || c.trainerId || 'trainer-1',
      completionRate: c.completionRate || 0,
      reviewCount: c.reviewCount || 0,
      resourcesCount: c.resourcesCount || 0
    } as Course));
  },

  async getCourseById(id: string): Promise<Course | undefined> {
    const c = await fetchApi(`/courses/${id}`);
    if (!c) return undefined;
    return {
      id: c._id || c.id,
      code: c.code,
      title: c.title,
      subject: c.subject,
      description: c.description,
      difficulty: c.difficulty,
      duration: c.duration,
      trainerName: c.trainerId?.name || 'Senior IMD Scientist',
      trainerAvatar: c.trainerId?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      enrolledCount: 34,
      status: c.status,
      progress: c.progress || 0,
      competenciesCovered: c.competenciesCovered || [],
      prerequisites: c.prerequisites || [],
      modules: c.modules || [],
      trainerId: c.trainerId?._id || c.trainerId || 'trainer-1',
      completionRate: c.completionRate || 0,
      reviewCount: c.reviewCount || 0,
      resourcesCount: c.resourcesCount || 0
    } as Course;
  },

  async createCourse(newCourseData: Partial<Course>): Promise<Course> {
    return fetchApi('/courses', {
      method: 'POST',
      body: JSON.stringify(newCourseData)
    });
  },

  async updateCourse(courseId: string, updatedData: Partial<Course>): Promise<Course> {
    return fetchApi(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async updateCourseStatus(courseId: string, status: Course['status']): Promise<Course> {
    return fetchApi(`/courses/${courseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getMyTrainerCourses(): Promise<any[]> {
    return fetchApi('/courses/trainer/me');
  },

  async getResources(courseId?: string): Promise<ResourceItem[]> {
    if (courseId) {
      return fetchApi(`/resources/course/${courseId}`);
    }
    return fetchApi('/resources');
  },

  async uploadResource(resourceData: FormData): Promise<ResourceItem> {
    return fetchApi('/resources/upload', {
      method: 'POST',
      body: resourceData
    });
  },

  async deleteResource(resourceId: string): Promise<any> {
    return fetchApi(`/resources/${resourceId}`, {
      method: 'DELETE'
    });
  },

  // === ASSESSMENTS ===

  // Get ALL assessments for logged-in trainee (pending + completed with scores)
  async getAllMyAssessments(): Promise<any[]> {
    return fetchApi('/assessments/me/all');
  },

  // Get questions for a specific assessment (answers hidden)
  async getAssessmentQuestions(assessmentId: string): Promise<any[]> {
    return fetchApi(`/assessments/${assessmentId}/questions`);
  },

  // Submit assessment answers: { questionId: selectedOptionIndex }
  async submitAssessment(assessmentId: string, answers: Record<string, number>): Promise<any> {
    return fetchApi(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // === TRAINER ASSESSMENTS ===

  // Get all assessments created by this trainer
  async getTrainerAssessments(): Promise<any[]> {
    return fetchApi('/assessments/trainer/my');
  },

  // Get Trainer Dashboard stats
  async getTrainerDashboard(): Promise<any> {
    return fetchApi('/trainers/me/dashboard');
  },

  // Get Trainer Trainees
  async getTrainerTrainees(): Promise<any> {
    return fetchApi('/trainers/me/trainees');
  },

  // Get questions for an assessment (with correct answers, for editing)
  async getTrainerAssessmentQuestions(assessmentId: string): Promise<any[]> {
    return fetchApi(`/assessments/trainer/${assessmentId}/questions`);
  },

  // Create new assessment with questions
  async createAssessment(data: {
    courseId: string;
    title: string;
    durationMinutes: number;
    passingScore: number;
    difficulty: string;
    dueDate?: string;
    retakeAllowed: boolean;
    questions: any[];
  }): Promise<any> {
    return fetchApi('/assessments/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // AI-generate questions
  async aiGenerateQuestions(data: { courseId?: string; assessmentId?: string; subject: string; competencyName: string }): Promise<any> {
    return fetchApi('/assessments/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Update a single question
  async updateQuestion(questionId: string, data: any): Promise<any> {
    return fetchApi(`/assessments/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Delete a specific question from a bank
  async deleteAssessmentQuestion(questionId: string): Promise<any> {
    return fetchApi(`/assessments/questions/${questionId}`, {
      method: 'DELETE'
    });
  },

  // Get trainee responses for an assessment
  async getAssessmentResponses(assessmentId: string): Promise<any[]> {
    return fetchApi(`/assessments/${assessmentId}/responses`);
  },

  // === CERTIFICATES ===

  async getCertificates(): Promise<Certificate[]> {
    return fetchApi('/certificates/me');
  }
};
