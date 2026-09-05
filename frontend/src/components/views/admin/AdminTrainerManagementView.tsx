import React, { useState } from 'react';
import { Badge } from '../../common/Badge';
import { useApp } from '../../../context/AppContext';
import { trainerService } from '../../../services/api/trainerService';
import { UserCheck, Sparkles, Star, Search, Filter, Award, CheckCircle, Cpu } from 'lucide-react';
import { TrainerMatchResult } from '../../../types';

export const AdminTrainerManagementView: React.FC = () => {
  const { showToast } = useApp();

  const [subject, setSubject] = useState<string>('Radar Meteorology');
  const [requiredCompetency, setRequiredCompetency] = useState<string>('Radar Meteorology & Doppler Interpretation');
  const [targetCourse, setTargetCourse] = useState<string>('MET-401 Advanced Doppler Radar');
  const [matchedTrainers, setMatchedTrainers] = useState<TrainerMatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const results = await trainerService.matchTrainers(subject, requiredCompetency);
    setMatchedTrainers(results);
    setIsSearching(false);
    showToast(`AI Matcher evaluated ${results.length} senior instructors`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-400" />
            <span>Trainer Management & Smart AI Matching System</span>
          </h2>
          <p className="text-xs text-slate-400">Match course requirements with senior scientists & master trainers based on competency profiles.</p>
        </div>
      </div>

      {/* SMART MATCHING FORM TOOL CARD */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            "Find Best Trainer" Competency Matcher Tool
          </h3>
        </div>

        <form onSubmit={handleMatch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Radar Meteorology">Radar Meteorology</option>
              <option value="Numerical Modeling">Numerical Modeling</option>
              <option value="Satellite Data">Satellite Data</option>
              <option value="AI/ML in Earth Sciences">AI/ML in Earth Sciences</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Competency Level</label>
            <select
              value={requiredCompetency}
              onChange={(e) => setRequiredCompetency(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Radar Meteorology & Doppler Interpretation">Radar Doppler Interpretation (L4+)</option>
              <option value="Numerical Weather Prediction (NWP) Modeling">NWP WRF Modeling (L4+)</option>
              <option value="Satellite Data Assimilation">INSAT Data Assimilation (L5)</option>
              <option value="AI/ML in Extreme Weather Forecasting">AI Nowcasting Models (L4+)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course Assignment</label>
            <select
              value={targetCourse}
              onChange={(e) => setTargetCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="MET-401 Advanced Doppler Radar">MET-401 Advanced Doppler Radar</option>
              <option value="NWP-502 Operational WRF Modeling">NWP-502 Operational WRF Modeling</option>
              <option value="SAT-305 INSAT Satellite Applications">SAT-305 INSAT Satellite Applications</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSearching ? 'Calculating Competency Vector Match...' : 'Calculate Optimal Trainer Rankings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* RANKED MATCH RESULTS CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Ranked Master Instructors ({matchedTrainers.length} Found)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matchedTrainers.map((t, idx) => (
            <div
              key={t.trainerId}
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between"
            >
              <span className="absolute top-2 right-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400">
                Rank #{idx + 1}
              </span>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img src={t.trainerAvatar} alt={t.trainerName} className="h-12 w-12 rounded-full object-cover ring-2 ring-cyan-500/30" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.trainerName}</h4>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {t.rating} / 5.0
                    </span>
                  </div>
                </div>

                {/* Match score bar */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mb-3 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Competency Fit Score</span>
                  <span className="text-xl font-extrabold text-cyan-400">{t.matchScore}% Match</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Specialist Domains</span>
                  <div className="flex flex-wrap gap-1">
                    {t.expertise.map((exp, i) => (
                      <span key={i} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>• {t.experienceYears} Years Operational Experience</p>
                  <p>• {t.coursesTaught} Courses Authored</p>
                  <p className="text-emerald-400 font-semibold">• Availability: {t.availability}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => showToast(`Assigned ${t.trainerName} to ${targetCourse}`)}
                  className="w-full rounded-lg bg-purple-600 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-all shadow-md"
                >
                  Assign to Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
