import React, { useState, useEffect } from 'react';
import { Badge } from '../../common/Badge';
import { BrainCircuit, AlertTriangle, Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { fetchApi } from '../../../services/api/apiClient';

export const CompetencyAnalyticsView: React.FC = () => {
  const { showToast } = useApp();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi('/admin/analytics/competency-heatmap');
        setHeatmapData(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Extract unique departments from the dynamic data
  const departments = Array.from(new Set(heatmapData.map(d => d.department)));

  // Calculate top skill gaps across the organization
  const topSkillGaps = [...heatmapData]
    .filter(item => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((item, idx) => ({
      id: `gap-${idx}`,
      competencyName: item.competency,
      department: item.department,
      currentLevel: item.currentAvg,
      requiredLevel: item.requiredAvg,
      priority: item.gap >= 1.5 ? 'High' : 'Medium',
      affectedTraineesCount: item.traineeCount
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            <span>Organizational Competency Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">Departmental skill level diagnostics vs required institutional benchmarks.</p>
        </div>

        <button
          onClick={() => showToast('Exported Organizational Competency Report (CSV)')}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics Data</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10">Loading analytics...</div>
      ) : (
        <>
          {/* DEPARTMENT COMPETENCY SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {departments.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 py-6 bg-slate-900/60 rounded-xl border border-slate-800">
                No competency data found. Trainees need to be assessed first.
              </div>
            ) : (
              departments.map((dept) => {
                const deptData = heatmapData.filter((h) => h.department === dept);
                const avgCurrent = (deptData.reduce((acc, curr) => acc + curr.currentAvg, 0) / deptData.length).toFixed(1);
                const avgRequired = (deptData.reduce((acc, curr) => acc + curr.requiredAvg, 0) / deptData.length).toFixed(1);
                const traineeCount = deptData[0]?.traineeCount || 0;

                return (
                  <div key={dept} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{dept}</h3>
                        <span className="text-xs text-slate-400">{traineeCount} Personnel Assessed</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Divisional Avg</span>
                        <span className="text-sm font-extrabold text-cyan-400">Level {avgCurrent} / {avgRequired}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {deptData.map((item) => {
                        const isMet = item.gap <= 0.3;
                        const pct = Math.min(100, Math.round((item.currentAvg / item.requiredAvg) * 100));

                        return (
                          <div key={item.competency} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-slate-200">{item.competency}</span>
                              <Badge variant={isMet ? 'emerald' : item.gap > 1.0 ? 'rose' : 'amber'}>
                                Current L{item.currentAvg} (Target L{item.requiredAvg})
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isMet ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">
                                {isMet ? 'Met' : `Gap: -${item.gap}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Top Organization Skill Gaps List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Top Priority Organizational Skill Deficits</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topSkillGaps.length === 0 ? (
                <div className="col-span-3 text-center text-slate-500 py-6 border border-dashed border-slate-800 rounded-lg">
                  No significant skill gaps found across the organization.
                </div>
              ) : (
                topSkillGaps.map((sg) => (
                  <div key={sg.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={sg.priority === 'High' ? 'rose' : 'amber'}>
                        Priority: {sg.priority}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{sg.affectedTraineesCount} officers</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{sg.competencyName}</h4>
                    <p className="text-[11px] text-slate-400">Department: {sg.department}</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                      <span className="text-slate-400">Current Level: {sg.currentLevel}</span>
                      <span className="text-rose-400 font-bold">Target: {sg.requiredLevel}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
