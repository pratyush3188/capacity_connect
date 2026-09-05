import { Announcement } from '../../types';
import { fetchApi } from './apiClient';

export interface AnalyticsSummary {
  totalTrainees: number;
  totalTrainers: number;
  activeCourses: number;
  completedCourses: number;
  totalCertifications: number;
  pendingAssessments: number;
  monthlyEnrollments: { month: string; enrollments: number; completions: number }[];
  performanceByDepartment: { department: string; avgScore: number; participationRate: number }[];
}

export const analyticsService = {
  async getOverviewAnalytics(): Promise<AnalyticsSummary> {
    const data = await fetchApi('/admin/dashboard');
    return {
      totalTrainees: data.totalTrainees,
      totalTrainers: data.totalTrainers,
      activeCourses: data.totalCourses,
      completedCourses: data.completedCourses || 0,
      totalCertifications: data.totalCertifications || 0,
      pendingAssessments: data.pendingAssessments || 0,
      monthlyEnrollments: data.monthlyEnrollments?.length ? data.monthlyEnrollments : [
        { month: 'Current', enrollments: 0, completions: 0 }
      ],
      performanceByDepartment: data.performanceByDepartment?.length ? data.performanceByDepartment : [
        { department: 'General', avgScore: 0, participationRate: 0 }
      ]
    };
  },

  async getAnnouncements(): Promise<Announcement[]> {
    return fetchApi('/announcements');
  },

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    return fetchApi('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  }
};
