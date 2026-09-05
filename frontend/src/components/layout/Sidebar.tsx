import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Target,
  Award,
  FileText,
  UserCheck,
  PlusCircle,
  FolderPlus,
  Users,
  BarChart3,
  Megaphone,
  Settings,
  HelpCircle,
  Activity,
  Compass,
  FileSpreadsheet,
  Building,
  BrainCircuit,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const { activeTab, setActiveTab, sidebarOpen, theme, toggleTheme } = useApp();

  const traineeNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'my-learning', label: 'My Learning', icon: <BookOpen className="h-4 w-4" />, badge: 'Active' },
    { id: 'courses', label: 'Courses', icon: <Compass className="h-4 w-4" /> },
    { id: 'competencies', label: 'Competencies', icon: <Target className="h-4 w-4" /> },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: <BrainCircuit className="h-4 w-4" />, badge: 'Priority' },
    { id: 'assessments', label: 'Assessments', icon: <FileText className="h-4 w-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="h-4 w-4" /> },
    { id: 'resources', label: 'Resources', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <UserCheck className="h-4 w-4" /> }
  ];

  const trainerNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'my-courses', label: 'My Courses', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'create-course', label: 'Create Course', icon: <PlusCircle className="h-4 w-4" /> },
    { id: 'trainer-library', label: 'Trainer Library', icon: <FolderPlus className="h-4 w-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <FileText className="h-4 w-4" /> },
    { id: 'trainees', label: 'Trainees', icon: <Users className="h-4 w-4" /> },
    { id: 'performance', label: 'Performance', icon: <Activity className="h-4 w-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <UserCheck className="h-4 w-4" /> }
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="h-4 w-4" /> },
    { id: 'trainees', label: 'Trainees', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'competency-framework', label: 'Competency Framework', icon: <Target className="h-4 w-4" /> },
    { id: 'competencies', label: 'Competency Analytics', icon: <BrainCircuit className="h-4 w-4" /> },
    { id: 'trainers', label: 'Trainers & AI Matcher', icon: <UserCheck className="h-4 w-4" />, badge: 'AI Match' },
    { id: 'courses', label: 'Course Management', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'training-analytics', label: 'Training Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <FileText className="h-4 w-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
  ];

  const navItems = role === 'trainee' ? traineeNav : role === 'trainer' ? trainerNav : adminNav;

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/90 py-4 px-3 flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Role Header Banner */}
        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {(role || 'trainee').toUpperCase()} PORTAL
              </span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {role === 'trainee'
              ? 'Competency Learning Path'
              : role === 'trainer'
              ? 'Instruction & Content Authoring'
              : 'Institutional Governance & AI Analytics'}
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & Theme Switcher */}
      <div className="mt-6 border-t border-slate-800/80 pt-3 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            <span>Theme Mode</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-cyan-400">{theme}</span>
        </button>

        <div className="rounded-lg bg-slate-900/40 p-2 text-[11px] text-slate-400 flex items-center justify-between border border-slate-800/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span>Capacity Helpdesk</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
