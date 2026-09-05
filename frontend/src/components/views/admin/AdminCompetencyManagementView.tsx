import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { fetchApi } from '../../../services/api/apiClient';
import { useApp } from '../../../context/AppContext';
import { BookOpen, Plus, Settings, Trash2 } from 'lucide-react';

export const AdminCompetencyManagementView: React.FC = () => {
  const { showToast } = useApp();
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [newComp, setNewComp] = useState({ name: '', category: 'Meteorology', description: '', globalRequiredLevel: 3 });
  const [assignData, setAssignData] = useState({ traineeId: '', competencyId: '', requiredLevel: 3 });

  const loadData = async () => {
    try {
      const comps = await fetchApi('/admin/competencies');
      setCompetencies(comps || []);
      const users = await fetchApi('/admin/trainees');
      setTrainees(users || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/admin/competencies', { method: 'POST', body: JSON.stringify(newComp) });
      showToast('Competency created successfully!');
      setShowAddModal(false);
      setNewComp({ name: '', category: 'Meteorology', description: '', globalRequiredLevel: 3 });
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Error creating competency');
    }
  };

  const handleAssignCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.traineeId || !assignData.competencyId) {
      return showToast('Please select both Trainee and Competency');
    }
    try {
      await fetchApi('/admin/competencies/assign', { method: 'POST', body: JSON.stringify(assignData) });
      showToast('Competency target assigned to Trainee!');
      setShowAssignModal(false);
    } catch (e: any) {
      showToast(e.message || 'Error assigning competency');
    }
  };

  const handleDeleteCompetency = async (id: string) => {
    if (confirm('Are you sure you want to delete this competency? It will be removed from all users.')) {
      try {
        await fetchApi(`/admin/competencies/${id}`, { method: 'DELETE' });
        showToast('Competency deleted successfully');
        loadData();
      } catch (e: any) {
        showToast(e.message || 'Error deleting competency');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <span>Master Competency Framework</span>
          </h2>
          <p className="text-xs text-slate-400">Define organizational competencies and assign required levels to trainees.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500">
            <Plus className="h-4 w-4" /> Add Competency
          </button>
          <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500">
            <Settings className="h-4 w-4" /> Assign Targets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competencies.map(comp => (
          <div key={comp._id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 relative group hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold text-cyan-400">{comp.category}</span>
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 text-[10px] px-2 py-1 rounded text-slate-300">
                  Global Req: L{comp.globalRequiredLevel || 3}
                </div>
                <button onClick={() => handleDeleteCompetency(comp._id)} className="text-slate-500 hover:text-rose-400 transition-colors" title="Delete Competency">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-bold text-white pt-1">{comp.name}</h3>
            <p className="text-xs text-slate-400">{comp.description}</p>
          </div>
        ))}
        {competencies.length === 0 && (
          <div className="col-span-3 text-center py-10 text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
            No competencies defined. Create one to get started.
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Competency" subtitle="Add to organizational framework">
          <form onSubmit={handleCreateCompetency} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Competency Name</label>
              <input required type="text" value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Category Domain</label>
                <select value={newComp.category} onChange={e => setNewComp({...newComp, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                  <option value="Meteorology">Meteorology</option>
                  <option value="Climatology">Climatology</option>
                  <option value="Instrumentation">Instrumentation</option>
                  <option value="IT & Data">IT & Data</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Global Required Level</label>
                <input required type="number" min="1" max="5" value={newComp.globalRequiredLevel} onChange={e => setNewComp({...newComp, globalRequiredLevel: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Description</label>
              <textarea required rows={3} value={newComp.description} onChange={e => setNewComp({...newComp, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded">Save Competency</button>
          </form>
        </Modal>
      )}

      {showAssignModal && (
        <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Target Level" subtitle="Set required competency for trainee">
          <form onSubmit={handleAssignCompetency} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select Trainee Officer</label>
              <select required value={assignData.traineeId} onChange={e => setAssignData({...assignData, traineeId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="">-- Choose Trainee --</option>
                {trainees.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Select Competency</label>
              <select required value={assignData.competencyId} onChange={e => setAssignData({...assignData, competencyId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="">-- Choose Competency --</option>
                {competencies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Required Level Target (1 to 5)</label>
              <input required type="number" min="1" max="5" value={assignData.requiredLevel} onChange={e => setAssignData({...assignData, requiredLevel: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded">Assign Target Level</button>
          </form>
        </Modal>
      )}
    </div>
  );
};
