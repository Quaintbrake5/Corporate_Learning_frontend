import React, { useState, useEffect } from 'react';
import type { Subdivision, AdminUser } from '../../../services/adminService';
import adminService from '../../../services/adminService';
import Modal from '../../../components/ui/Modal';
import styles from './SubdivisionManagement.module.css';

const SubdivisionManagement: React.FC = () => {
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subdivision | null>(null);
  const [newLeadId, setNewLeadId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subsData = await adminService.getSubdivisions();
      setSubdivisions(subsData);
      const usersData = await adminService.getUsers(1, 1000);
      setAllUsers(usersData.users);
    } catch (err: unknown) {
      let message = 'Failed to load subdivisions or users';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditLead = (sub: Subdivision) => {
    setSelectedSub(sub);
    setNewLeadId(sub.lead_id || '');
    setIsModalOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedSub) return;
    try {
      setLoading(true);
      setError(null);
      await adminService.updateSubdivision(selectedSub.id, {
        lead_id: newLeadId || undefined
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      let message = 'Failed to update subdivision lead';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'No Lead Assigned';
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : `ID: ${userId}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Subdivision Management</h2>
      </div>

      {error && (
        <div className={styles.error} style={{ color: '#d32f2f', background: '#fff0f0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading && subdivisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
          <p>Loading subdivisions...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {subdivisions.map(sub => (
            <div key={sub.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{sub.name}</h3>
                <span className={styles.badge}>ID: {sub.id}</span>
              </div>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Current Lead:</span>
                  <span className={styles.value}>{getUserName(sub.lead_id)}</span>
                </div>
              </div>
              <button 
                className={styles.editBtn}
                onClick={() => handleEditLead(sub)}
              >
                <i className="fa-solid fa-user-tie"></i> Change Lead
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Change Lead for ${selectedSub?.name}`}
        width="450px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="lead-select" style={{ fontWeight: 600, color: '#003366', fontSize: '0.9rem' }}>
              Select Manager or Admin
            </label>
            <select 
              id="lead-select"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9fafc' }}
              value={newLeadId}
              onChange={(e) => setNewLeadId(e.target.value)}
              aria-label="Select Subdivision Lead"
            >
              <option value="">-- No Lead Assigned --</option>
              {allUsers
                .filter(u => u.role === 'manager' || u.role === 'admin')
                .map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))
              }
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              style={{ padding: '0.75rem 1.25rem', border: '1px solid #ddd', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#003366', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              onClick={handleUpdateLead}
              disabled={loading}
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Update Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubdivisionManagement;
