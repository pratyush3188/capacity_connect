import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../common/Badge';
import { BookOpen, GraduationCap, Briefcase, Award, Star, Shield, Edit2, Check, X } from 'lucide-react';
import { fetchApi } from '../../../services/api/apiClient';
import { useApp } from '../../../context/AppContext';

export const TrainerProfileView: React.FC = () => {
  const { user, login } = useAuth();
  const { showToast } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    qualification: user?.qualification || '',
    experienceYears: user?.experienceYears || 0,
    department: user?.department || '',
    designation: user?.designation || '',
    skills: user?.skills?.join(', ') || '',
    certifications: user?.certifications?.join(', ') || ''
  });

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
      };
      const updatedUser = await fetchApi('/trainers/me/profile', { method: 'PUT', body: JSON.stringify(payload) });
      
      // Update local auth context
      login(updatedUser.token || localStorage.getItem('token') || '', updatedUser);
      showToast('Profile updated successfully!');
      setIsEditing(false);
    } catch (e: any) {
      showToast(e.message || 'Error updating profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full">
            <img
              src={user?.avatar || (user as any)?.avatarUrl || 'https://via.placeholder.com/150'}
              alt={user?.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-2xl"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                  <Badge variant="emerald" icon={<BookOpen className="h-3 w-3" />}>
                    WMO MASTER TRAINER
                  </Badge>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300">
                    <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500">
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-700 text-xs font-bold text-white hover:bg-slate-600">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Designation</label>
                    <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Department</label>
                    <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{user?.designation || 'Instructor'}</p>
                  <p className="text-xs text-slate-400">{user?.department || 'General'} • {user?.email}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span>Academic Credentials & Expertise</span>
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Highest Qualification</span>
              {isEditing ? (
                <input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
              ) : (
                <span className="text-slate-200">{user?.qualification || 'Not Specified'}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Instruction Experience (Years)</span>
              {isEditing ? (
                <input type="number" min="0" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
              ) : (
                <span className="text-slate-200">{user?.experienceYears || 0} Years Senior Research & Teaching</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Specialist Subjects Taught</span>
              {isEditing ? (
                <input type="text" placeholder="e.g. Radar, Python, Climatology (comma separated)" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user?.skills?.length ? user.skills.map((s: string, i: number) => (
                    <span key={i} className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                      {s}
                    </span>
                  )) : <span className="text-slate-500 italic">No subjects specified</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Certifications & International Recognition</span>
          </h3>
          {isEditing ? (
            <div>
              <label className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Certifications (comma separated)</label>
              <textarea rows={4} value={formData.certifications} onChange={e => setFormData({...formData, certifications: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
            </div>
          ) : (
            <ul className="space-y-2 text-xs text-slate-300">
              {user?.certifications?.length ? user.certifications.map((cert: string, i: number) => (
                <li key={i} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span>{cert}</span>
                  <Badge variant="amber">VERIFIED</Badge>
                </li>
              )) : <span className="text-slate-500 italic">No certifications added</span>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
