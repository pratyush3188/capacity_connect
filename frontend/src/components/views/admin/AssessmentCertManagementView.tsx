import React, { useState, useEffect } from 'react';
import { Badge } from '../../common/Badge';
import { Award, Shield, FileText } from 'lucide-react';
import { fetchApi } from '../../../services/api/apiClient';

export const AssessmentCertManagementView: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [certsRes, assessRes] = await Promise.all([
          fetchApi('/admin/certificates'),
          fetchApi('/admin/assessments')
        ]);
        setCertificates(certsRes || []);
        setAssessments(assessRes || []);
      } catch (error) {
        console.error('Failed to load certificates/assessments:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          <span>Certifications & Assessment Audit Management</span>
        </h2>
        <p className="text-xs text-slate-400">Institutional records of certified officers and pending qualification approvals.</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10">Loading audit records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Issued Institutional Certificates</span>
            </h3>

            <div className="space-y-2">
              {certificates.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  No certificates issued yet.
                </div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert._id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{cert.userId?.name || 'Unknown User'}</h4>
                      <span className="text-[10px] text-cyan-400 block">{cert.courseId?.title || 'Unknown Course'}</span>
                    </div>
                    <Badge variant="cyan">{cert.certificateCode || cert._id.substring(0, 8)}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Assessment Audits</span>
            </h3>

            <div className="space-y-2">
              {assessments.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  No assessments configured yet.
                </div>
              ) : (
                assessments.map((asm) => (
                  <div key={asm._id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{asm.title}</h4>
                      <span className="text-[10px] text-slate-400 block">Pass Threshold: {asm.passingScore}%</span>
                    </div>
                    <Badge variant="purple">{asm.difficulty || 'Medium'}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
