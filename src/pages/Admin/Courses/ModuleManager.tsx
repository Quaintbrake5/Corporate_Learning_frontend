import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { getCourseModules } from '../../../services/courseService';
import type { Module } from '../../../services/courseService';
import { convertToEmbedUrl } from '../../../utils/videoUrlUtils';

import AssessmentForm from './AssessmentForm';
import styles from './ModuleManager.module.css';

interface ModuleManagerProps {
  courseId: string;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ courseId }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedModuleForAssessment, setSelectedModuleForAssessment] = useState<Module | null>(null);
   
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
      const safeData = Array.isArray(data) ? data : [];
      setModules([...safeData].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string | Array<{ msg: string }> } } };
      const detail = errorObj.response?.data?.detail;
      let message = 'Failed to load modules';
      if (Array.isArray(detail)) {
        message = detail.map(d => d.msg).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    setNewModule(prev => ({ ...prev, order_index: (modules || []).length }));
  }, [modules]);

  const handleAddModule = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      setError(null);
      // Convert empty string to null for content_url when it's empty
      const contentUrlToSend = newModule.content_url.trim() === ''
        ? undefined
        : convertToEmbedUrl(newModule.content_url);
      await adminService.createModule(courseId, {
        ...newModule,
        content_url: contentUrlToSend
      });
      setNewModule({ title: '', content_type: 'video', content_url: '', order_index: (modules || []).length + 1 });
      setShowAddForm(false);
      fetchModules();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string | Array<{ msg?: string; type?: string; loc?: unknown[] }> } } };
      const detail = errorObj.response?.data?.detail;
      // Log the full detail for debugging
      console.log('[Module Creation Error] Full error detail:', detail);
      let message = 'Failed to create module';
      if (Array.isArray(detail)) {
        message = detail.map(d => d.msg || JSON.stringify(d)).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      }
      setError(message);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!globalThis.confirm('Delete this module?')) return;
    try {
      await adminService.deleteModule(moduleId);
      fetchModules();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string | Array<{ msg: string }> } } };
      const detail = errorObj.response?.data?.detail;
      let message = 'Failed to delete module';
      if (Array.isArray(detail)) {
        message = detail.map(d => d.msg).join(', ');
      } else if (typeof detail === 'string') {
        message = detail;
      }
      setError(message);
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
                 onChange={e => {
                   const value = e.target.value;
                   setNewModule({...newModule, order_index: value === '' ? 0 : Number.parseInt(value) || 0});
                 }}
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
           {(modules || []).map((m) => (
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
                 <button 
                   className={styles.assessmentBtn}
                   onClick={() => {
                     setSelectedModuleForAssessment(m);
                     setShowAssessmentForm(true);
                   }}
                   title="Manage Assessment"
                 >
                   <i className="fa-solid fa-list-check"></i>
                 </button>
               </div>
             </div>
           ))}
           {(modules || []).length === 0 && !showAddForm && (
             <div className={styles.emptyState}>No modules added yet for this course.</div>
           )}
         </div>
       )}
       
       {/* Assessment Form Modal */}
       {showAssessmentForm && selectedModuleForAssessment && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
           <div style={{ background: 'white', borderRadius: '8px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
             <AssessmentForm 
               module={selectedModuleForAssessment} 
               onAssessmentSaved={() => {
                 setShowAssessmentForm(false);
                 setSelectedModuleForAssessment(null);
               }}
             />
           </div>
         </div>
       )}
    </div>
  );
};

export default ModuleManager;
