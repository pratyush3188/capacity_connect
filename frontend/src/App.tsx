import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Breadcrumb } from './components/layout/Breadcrumb';
import { LoginPage } from './components/views/auth/LoginPage';

// Trainee Views
import { TraineeDashboardView } from './components/views/trainee/TraineeDashboardView';
import { MyLearningView } from './components/views/trainee/MyLearningView';
import { CompetencyProfileView } from './components/views/trainee/CompetencyProfileView';
import { SkillGapView } from './components/views/trainee/SkillGapView';
import { CourseCatalogView } from './components/views/trainee/CourseCatalogView';
import { AssessmentsView } from './components/views/trainee/AssessmentsView';
import { CertificatesView } from './components/views/trainee/CertificatesView';
import { TraineeProfileView } from './components/views/trainee/TraineeProfileView';

// Trainer Views
import { TrainerDashboardView } from './components/views/trainer/TrainerDashboardView';
import { MyCoursesView } from './components/views/trainer/MyCoursesView';
import { CreateCourseView } from './components/views/trainer/CreateCourseView';
import { TrainerLibraryView } from './components/views/trainer/TrainerLibraryView';
import { TrainerAssessmentsView } from './components/views/trainer/TrainerAssessmentsView';
import { TraineePerformanceView } from './components/views/trainer/TraineePerformanceView';
import { FeedbackView } from './components/views/trainer/FeedbackView';
import { TrainerProfileView } from './components/views/trainer/TrainerProfileView';

// Admin Views
import { AdminDashboardView } from './components/views/admin/AdminDashboardView';
import { CompetencyAnalyticsView } from './components/views/admin/CompetencyAnalyticsView';
import { TrainingAnalyticsView } from './components/views/admin/TrainingAnalyticsView';
import { AdminCourseManagementView } from './components/views/admin/AdminCourseManagementView';
import { AdminTrainerManagementView } from './components/views/admin/AdminTrainerManagementView';
import { AdminTraineeManagementView } from './components/views/admin/AdminTraineeManagementView';
import { AssessmentCertManagementView } from './components/views/admin/AssessmentCertManagementView';
import { AnnouncementsView } from './components/views/admin/AnnouncementsView';
import { ReportsView } from './components/views/admin/ReportsView';
import { SettingsView } from './components/views/admin/SettingsView';
import { AdminCompetencyManagementView } from './components/views/admin/AdminCompetencyManagementView';

import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { activeTab, toastMessage } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    if (role === 'trainee') {
      switch (activeTab) {
        case 'dashboard': return <TraineeDashboardView />;
        case 'my-learning': return <MyLearningView />;
        case 'courses': return <CourseCatalogView />;
        case 'competencies': return <CompetencyProfileView />;
        case 'skill-gap': return <SkillGapView />;
        case 'assessments': return <AssessmentsView />;
        case 'certificates': return <CertificatesView />;
        case 'resources': return <MyLearningView />;
        case 'profile': return <TraineeProfileView />;
        default: return <TraineeDashboardView />;
      }
    }

    if (role === 'trainer') {
      switch (activeTab) {
        case 'dashboard': return <TrainerDashboardView />;
        case 'my-courses': return <MyCoursesView />;
        case 'create-course': return <CreateCourseView />;
        case 'trainer-library': return <TrainerLibraryView />;
        case 'assessments': return <TrainerAssessmentsView />;
        case 'trainees': return <TraineePerformanceView />;
        case 'performance': return <TraineePerformanceView />;
        case 'feedback': return <FeedbackView />;
        case 'profile': return <TrainerProfileView />;
        default: return <TrainerDashboardView />;
      }
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboardView />;
        case 'users': return <AdminTraineeManagementView />;
        case 'trainees': return <AdminTraineeManagementView />;
        case 'trainers': return <AdminTrainerManagementView />;
        case 'courses': return <AdminCourseManagementView />;
        case 'competency-framework': return <AdminCompetencyManagementView />;
        case 'competencies': return <CompetencyAnalyticsView />;
        case 'training-analytics': return <TrainingAnalyticsView />;
        case 'assessments': return <AssessmentCertManagementView />;
        case 'certifications': return <AssessmentCertManagementView />;
        case 'reports': return <ReportsView />;
        case 'announcements': return <AnnouncementsView />;
        case 'settings': return <SettingsView />;
        default: return <AdminDashboardView />;
      }
    }

    return <TraineeDashboardView />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <Breadcrumb />
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
