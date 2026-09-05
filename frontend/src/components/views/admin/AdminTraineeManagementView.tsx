import React, { useState, useEffect } from 'react';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { GraduationCap, Search, Filter, Eye, Award, UserPlus } from 'lucide-react';
import { User } from '../../../types';
import { fetchApi } from '../../../services/api/apiClient';
import { useApp } from '../../../context/AppContext';

export const AdminTraineeManagementView: React.FC = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [traineeList, setTraineeList] = useState<User[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'trainee', department: 'Severe Weather & Radar Division', designation: 'Scientist - C', password: '' });

  const fetchTrainees = () => {
    fetchApi('/admin/trainees').then(setTraineeList).catch(console.error);
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      showToast('User created successfully!');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'trainee', department: 'Severe Weather & Radar Division', designation: 'Scientist - C', password: '' });
      fetchTrainees();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to deregister this user? They will be permanently removed from the system.')) {
      try {
        await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
        showToast('User deregistered successfully');
        fetchTrainees();
      } catch (err) {
        console.error(err);
        showToast('Failed to deregister user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span>Trainee Officers Governance Directory</span>
          </h2>
          <p className="text-xs text-slate-400">Search trainees, inspect competency profiles, and track readiness indicators.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainee name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
            <tr>
              <th className="p-4">Officer Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Readiness Score</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {traineeList.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())).map((t) => (
              <tr key={t.id || (t as any)._id} className="hover:bg-slate-800/40">
                <td className="p-4 font-bold text-white flex items-center gap-3">
                  <img src={(t as any).avatar || (t as any).avatarUrl || 'https://via.placeholder.com/40'} alt={t.name} className="w-8 h-8 rounded-full border border-slate-700" />
                  <div>
                    <span>{t.name}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{t.email}</span>
                  </div>
                </td>
                <td className="p-4">{t.department}</td>
                <td className="p-4">{t.designation}</td>
                <td className="p-4 font-mono font-bold text-cyan-400">{t.readinessScore || 0}%</td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedTrainee(t)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDeleteUser(t.id || (t as any)._id)}
                    className="px-3 py-1 rounded bg-red-900/40 hover:bg-red-900/60 text-xs font-semibold text-red-400 border border-red-900/50"
                  >
                    Deregister
                  </button>
                </td>
              </tr>
            ))}
            {traineeList.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">No trainees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTrainee && (
        <Modal
          isOpen={!!selectedTrainee}
          onClose={() => setSelectedTrainee(null)}
          title={`Competency Audit: ${selectedTrainee.name}`}
          subtitle={selectedTrainee.department}
        >
          <div className="space-y-3 text-xs text-slate-300">
            <p><strong>Qualification:</strong> {selectedTrainee.qualification || 'N/A'}</p>
            <p><strong>Experience:</strong> {selectedTrainee.experienceYears || 0} Years</p>
            <p><strong>Readiness Rating:</strong> {selectedTrainee.readinessScore || 0}%</p>
          </div>
        </Modal>
      )}

      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Provision New User" subtitle="Create Trainee/Trainer Account">
          <form onSubmit={handleAddUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Official Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="trainee">Trainee</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Designation</label>
                <input required type="text" value={newUser.designation} onChange={e => setNewUser({...newUser, designation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <input required type="text" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input required type="text" placeholder="e.g. Secret@123" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded">Create Account</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
