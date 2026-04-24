import React, { useEffect, useState } from 'react';
import adminService from '../../../services/adminService';
import type { AdminUser } from '../../../services/adminService';
import Modal from '../../../components/ui/Modal';
import UserForm from './UserForm';
import styles from './UserManagement.module.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

   const fetchUsers = async () => {
     try {
       setLoading(true);
       setError(null);
       const data = await adminService.getUsers(1, 100);
       setUsers(data.items);
     } catch (err: unknown) {
       let message = 'Failed to load users';
       if (err && typeof err === 'object' && 'response' in err) {
         const response = (err as { response: { data?: any } }).response;
         if (response?.data) {
           // Handle detail as either string or array
           if (response.data.detail) {
             if (Array.isArray(response.data.detail)) {
               // Join array elements into a single string
               message = response.data.detail.join(' ');
             } else {
               message = String(response.data.detail);
             }
           }
         }
       }
       setError(message);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: AdminUser) => {
    if (!globalThis.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await adminService.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err: unknown) {
      let message = 'Failed to delete user';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchUsers(); // Refresh list
  };

  const getDepartmentName = (id: number) => {
    const map: Record<number, string> = {
      1: 'CSS (Security)',
      2: 'CSI (IMT/IT)',
      3: 'CSD (Digital)',
      4: 'CSL (Logistics)',
      5: 'CSE (Estates)',
    };
    return map[id] || `Unknown (${id})`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>User Management</h2>
        <button className={styles.addButton} onClick={handleAdd}>
          <i className="fa-solid fa-user-plus"></i> Add User
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{getDepartmentName(user.department_id)}</td>
                  <td>
                    <span className={[styles.roleBadge, styles['role_' + user.role]].join(' ')}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.is_verified ? (
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}><i className="fa-solid fa-check-circle" style={{marginRight: '4px'}}></i>Verified</span>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 600 }}><i className="fa-solid fa-clock" style={{marginRight: '4px'}}></i>Pending</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton}`} 
                        title="Edit"
                        onClick={() => handleEdit(user)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`} 
                        title="Delete"
                        onClick={() => handleDelete(user)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        width="500px"
      >
        <UserForm
          user={selectedUser}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
