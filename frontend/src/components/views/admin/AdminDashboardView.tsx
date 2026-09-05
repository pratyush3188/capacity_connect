import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { Badge } from '../../common/Badge';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Award,
  FileText,
  TrendingUp,
  BrainCircuit,
  UserCheck,
  Megaphone,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { analyticsService, AnalyticsSummary } from '../../../services/api/analyticsService';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useApp();

  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    analyticsService.getOverviewAnalytics().then(setData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-slate-900 to-blue-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Institutional Governance & Capacity Directorate</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Executive Directorate Dashboard • {user?.name}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              {user?.designation} • IMD / Ministry of Earth Sciences
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('competencies')}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Competency Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>Find Best Trainer AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Trainees"
          value={data?.totalTrainees ?? 0}
          subtitle="Active Learner Pool"
          change="+12% YoY"
          changeType="positive"
          icon={<GraduationCap className="h-4 w-4" />}
          accentColor="cyan"
        />
        <StatCard
          title="Total Trainers"
          value={data?.totalTrainers ?? 0}
          subtitle="Registered Faculty"
          change="Updated"
          changeType="positive"
          icon={<UserCheck className="h-4 w-4" />}
          accentColor="emerald"
        />
        <StatCard
          title="Active Courses"
          value={data?.activeCourses ?? 0}
          subtitle="Catalog"
          change="Expanding"
          changeType="positive"
          icon={<BookOpen className="h-4 w-4" />}
          accentColor="blue"
        />
        <StatCard
          title="Completed Courses"
          value={data?.completedCourses ?? 0}
          subtitle="Batch 2025-26"
          change="Tracked"
          changeType="positive"
          icon={<CheckCircle2 className="h-4 w-4" />}
          accentColor="purple"
        />
        <StatCard
          title="Total Certifications"
          value={data?.totalCertifications ?? 0}
          subtitle="Issued"
          icon={<Award className="h-4 w-4" />}
          accentColor="amber"
        />
        <StatCard
          title="Pending Audits"
          value={data?.pendingAssessments ?? 0}
          subtitle="Requires Review"
          change="Action Req"
          changeType="negative"
          icon={<FileText className="h-4 w-4" />}
          accentColor="amber"
        />
      </div>

      {/* Quick Access Grid: Dept Performance & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span>Department Competency & Participation Metrics</span>
              </h3>
              <button onClick={() => setActiveTab('training-analytics')} className="text-xs font-semibold text-purple-400 hover:underline">
                Full Analytics
              </button>
            </div>

            <div className="space-y-3">
              {data?.performanceByDepartment.map((dept, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{dept.department}</span>
                    <span className="text-cyan-400">Participation: {dept.participationRate}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${dept.avgScore}%` }} />
                    </div>
                    <span className="font-mono text-slate-300 font-bold">{dept.avgScore}% Avg Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Executive Directives */}
        <div className="space-y-4">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-400" />
              <span>National Capacity Directives</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Q4 National Skill Drive active. 42 officers require INSAT-3DR satellite data assimilation level upgrade before cyclone season.
            </p>
            <button
              onClick={() => setActiveTab('competencies')}
              className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Inspect Skill Deficits</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
