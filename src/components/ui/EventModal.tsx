import React, { useState, useEffect, useRef } from 'react';
import { updateEvent, deleteEvent } from '../../services/eventService';
import type { Event } from '../../services/eventService';
import { useAppSelector } from '../../store/hooks';
import styles from './EventModal.module.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  events: Event[];
  onEventCreated?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  events,
  onEventCreated
}) => {
  const user = useAppSelector(state => state.auth.user);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_all_day: false,
    event_type: 'user' as 'user' | 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setEditingEvent(null);
      setIsAddingEvent(false);
      setError(null);
      // Reset form when modal opens
      const defaultStartTime = selectedDate 
        ? new Date(selectedDate).setHours(9, 0, 0, 0)
        : Date.now();
      const defaultEndTime = selectedDate
        ? new Date(selectedDate).setHours(10, 0, 0, 0)
        : Date.now();
        
      setFormData({
        title: '',
        description: '',
        start_time: new Date(defaultStartTime).toISOString().slice(0, 16),
        end_time: new Date(defaultEndTime).toISOString().slice(0, 16),
        is_all_day: false,
        event_type: 'user'
      });
    }
  }, [isOpen, selectedDate]);


  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: startDate.toISOString().slice(0, 16),
      end_time: endDate.toISOString().slice(0, 16),
      is_all_day: event.is_all_day,
      event_type: event.event_type
    });
  };

  const handleDelete = async (eventId: string) => {
    if (!globalThis.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setLoading(true);
      await deleteEvent(eventId);
      onEventCreated?.();
      onClose();
    } catch (err) {
      setError('Failed to delete event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
       await updateEvent(editingEvent!.id, {
         title: formData.title,
         description: formData.description || undefined,
         start_time: formData.start_time + ":00",
         end_time: formData.end_time + ":00",
         is_all_day: formData.is_all_day
       });
      
      onEventCreated?.();
      setEditingEvent(null);
     } catch (err: unknown) {
       setError('Failed to update event');
       console.error('Update event error:', err);
       if (err && typeof err === 'object' && 'response' in err) {
         const response = (err as { response: { status: number; data: unknown } }).response;
         console.error('Response status:', response.status);
         console.error('Response data:', response.data);
       }
     } finally {
       setLoading(false);
     }
  };

  const handleAddEvent = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

     try {
       setLoading(true);
       setError(null);
       
       console.log('Creating event with data:', {
         title: formData.title,
         description: formData.description || undefined,
         start_time: formData.start_time,
         end_time: formData.end_time,
         is_all_day: formData.is_all_day,
         event_type: formData.event_type
       });
       
       // Validate datetime format
       const startTime = formData.start_time;
       const endTime = formData.end_time;
       console.log('Start time format check:', startTime, typeof startTime);
       console.log('End time format check:', endTime, typeof endTime);
       
        // Check if strings are in expected ISO format (simplified)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        console.log('Start time matches ISO regex:', isoRegex.test(startTime));
        console.log('End time matches ISO regex:', isoRegex.test(endTime));
       
       const { createEvent } = await import('../../services/eventService');
       await createEvent({
         title: formData.title,
         description: formData.description || undefined,
         start_time: formData.start_time + ":00",
         end_time: formData.end_time + ":00",
         is_all_day: formData.is_all_day,
         event_type: formData.event_type
       });
      
      onEventCreated?.();
      onClose();
      } catch (err: unknown) {
        setError('Failed to create event');
        console.error('Create event error:', err);
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as { response: { status: number; data: unknown } }).response;
          console.error('Response status:', response.status);
          console.error('Response data:', response.data);
        }
     } finally {
       setLoading(false);
     }
  };

  const isOwnEvent = (event: Event): boolean => {
    return event.creator_id === user?.id || user?.role === 'admin';
  };



  const renderEventList = () => (
    <>
      <div className={styles.eventsHeader}>
        <h3>Events ({events.length})</h3>
        <button 
          className={styles.addButton}
          onClick={() => setIsAddingEvent(true)}
          title="Add New Event"
          aria-label="Add New Event"
        >
          <i className="fa-solid fa-plus"></i> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No events for this day.</p>
          <p className={styles.hint}>Double-click a date on the calendar to add an event.</p>
        </div>
      ) : (
        <div className={styles.eventsList}>
          {events.map(event => (
            <div 
              key={event.id} 
              className={`${styles.eventCard} ${event.event_type === 'admin' ? styles.adminEvent : styles.userEvent}`}
            >
              <div className={styles.eventHeader}>
                <span className={styles.eventType}>
                  {event.event_type === 'admin' ? 'Organization' : 'Personal'}
                </span>
                {isOwnEvent(event) && (
                  <div className={styles.eventActions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(event)}
                      title="Edit event"
                      aria-label="Edit event"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(event.id)}
                      title="Delete event"
                      aria-label="Delete event"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              <h4 className={styles.eventTitle}>{event.title}</h4>
              {event.description && (
                <p className={styles.eventDescription}>{event.description}</p>
              )}
              <div className={styles.eventTime}>
                <i className="fa-solid fa-clock"></i>
                {event.is_all_day 
                  ? 'All Day' 
                  : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderEditForm = () => (
    <form onSubmit={handleSave} className={styles.eventForm}>
      <h3>Edit Event</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="edit-title">Title *</label>
        <input
          id="edit-title"
          type="text"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          placeholder="Event title"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="edit-description">Description</label>
        <textarea
          id="edit-description"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Event description (optional)"
          rows={3}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="edit-start">Start Time *</label>
          <input
            id="edit-start"
            type="datetime-local"
            value={formData.start_time}
            onChange={e => setFormData({...formData, start_time: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-end">End Time *</label>
          <input
            id="edit-end"
            type="datetime-local"
            value={formData.end_time}
            onChange={e => setFormData({...formData, end_time: e.target.value})}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel} htmlFor="edit-all-day">
          <input
            id="edit-all-day"
            type="checkbox"
            checked={formData.is_all_day}
            onChange={e => setFormData({...formData, is_all_day: e.target.checked})}
          />
          {" "}All Day Event
        </label>
      </div>

      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={() => setEditingEvent(null)}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  const renderAddForm = () => (
    <form onSubmit={handleAddEvent} className={styles.eventForm}>
      <h3>Add New Event</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="add-title">Title *</label>
        <input
          id="add-title"
          type="text"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          placeholder="Event title"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="add-description">Description</label>
        <textarea
          id="add-description"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Event description (optional)"
          rows={3}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="add-start">Start Time *</label>
          <input
            id="add-start"
            type="datetime-local"
            value={formData.start_time}
            onChange={e => setFormData({...formData, start_time: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="add-end">End Time *</label>
          <input
            id="add-end"
            type="datetime-local"
            value={formData.end_time}
            onChange={e => setFormData({...formData, end_time: e.target.value})}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel} htmlFor="add-all-day">
          <input
            id="add-all-day"
            type="checkbox"
            checked={formData.is_all_day}
            onChange={e => setFormData({...formData, is_all_day: e.target.checked})}
          />
          {" "}All Day Event
        </label>
      </div>

      {user?.role === 'admin' && (
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel} htmlFor="add-org-event">
            <input
              id="add-org-event"
              type="checkbox"
              checked={formData.event_type === 'admin'}
              onChange={e => setFormData({
                ...formData, 
                event_type: e.target.checked ? 'admin' : 'user'
              })}
            />
            {" "}Organization Event (visible to all users)
          </label>
        </div>
      )}

      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={() => setIsAddingEvent(false)}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );

  const renderContent = () => {
    if (editingEvent) return renderEditForm();
    if (isAddingEvent) return renderAddForm();
    return renderEventList();
  };

  return (
    <dialog 
      ref={dialogRef}
      className={styles.modalContent} 
      aria-modal="true"
      onCancel={() => {
        onClose();
      }}
    >
      <div className={styles.modalHeader}>
        <h2 id="modal-title">{formatDate(selectedDate)}</h2>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          title="Close Modal"
          aria-label="Close Modal"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className={styles.modalBody}>
        {error && <div className={styles.error}>{error}</div>}

        {renderContent()}
      </div>
    </dialog>
  );
};

export default EventModal;
