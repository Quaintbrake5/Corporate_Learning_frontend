import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { getCourseModules } from '../../../services/courseService';
import type { Module } from '../../../services/courseService';
import styles from './ModuleManager.module.css';

interface ModuleManagerProps {
  courseId: string;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ courseId }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New module form state
  const [newModule, setNewModule] = useState({
    title: '',
    content_type: 'video',
    content_url: '',
    order_index: 0
  });

  const fetchModules = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourseModules(courseId);
      // Sort by order_index
      setModules(data.toSorted((a, b) => a.order_index - b.order_index));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) {
          setError(response.data.detail);
        } else {
          setError('Failed to load modules');
        }
      } else {
        setError('Failed to load modules');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    setNewModule(prev => ({ ...prev, order_index: modules.length }));
  }, [modules.length]);

  const handleAddModule = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await adminService.createModule(courseId, newModule);
      setNewModule({ title: '', content_type: 'video', content_url: '', order_index: modules.length + 1 });
      setShowAddForm(false);
      fetchModules();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) {
          setError(response.data.detail);
        } else {
          setError('Failed to create module');
        }
      } else {
        setError('Failed to create module');
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!globalThis.confirm('Delete this module?')) return;
    try {
      await adminService.deleteModule(moduleId);
      fetchModules();
    } catch (err: unknown) {
      console.error('Delete module error:', err);
      setError('Failed to delete module');
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Course Content</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.submitBtn}
          style={{ backgroundColor: showAddForm ? '#666' : '#90ee90', color: '#003366' }}
        >
          {showAddForm ? 'Cancel' : 'Add Module'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddModule} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="module-title" className={styles.label}>Module Title</label>
            <input 
              id="module-title"
              className={styles.input}
              value={newModule.title}
              onChange={e => setNewModule({...newModule, title: e.target.value})}
              required
              placeholder="e.g. Introduction to Security"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label htmlFor="module_type" className={styles.label}>Type</label>
              <select 
                id="module_type"
                className={styles.select}
                value={newModule.content_type}
                onChange={e => setNewModule({...newModule, content_type: e.target.value})}
                aria-label="Module Content Type"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="scorm">SCORM Package</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="module_order" className={styles.label}>Order Index</label>
              <input 
                id="module_order"
                type="number"
                className={styles.input}
                value={newModule.order_index}
                onChange={e => setNewModule({...newModule, order_index: Number.parseInt(e.target.value)})}
                required
                aria-label="Module Order Index"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="module_url" className={styles.label}>Content URL</label>
            <input 
              id="module_url"
              className={styles.input}
              value={newModule.content_url}
              onChange={e => setNewModule({...newModule, content_url: e.target.value})}
              placeholder="https://..."
              aria-label="Module Content URL"
            />
          </div>
          <div className={styles.footer}>
            <button type="submit" className={styles.submitBtn}>Save Module</button>
          </div>
        </form>
      )}

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading ? <p>Loading modules...</p> : (
        <div className={styles.moduleList}>
          {modules.map((m) => (
            <div key={m.id} className={styles.moduleItem}>
              <div className={styles.moduleInfo}>
                <div className={styles.orderBadge}>{m.order_index}</div>
                <div className={styles.moduleMeta}>
                  <h4>{m.title} <span className={styles.contentType}>{m.content_type}</span></h4>
                  <p>{m.content_url || 'No URL specified'}</p>
                </div>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteModule(m.id)}
                  title="Delete Module"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
          {modules.length === 0 && !showAddForm && (
            <div className={styles.emptyState}>No modules added yet for this course.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleManager;
