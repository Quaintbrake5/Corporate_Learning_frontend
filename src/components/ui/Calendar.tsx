import React, { useState, useEffect } from 'react';
import { getEventsForMonth } from '../../services/eventService';
import type { Event } from '../../services/eventService';
import styles from './Calendar.module.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

interface CalendarProps {
  onDateClick?: (date: Date, events: Event[]) => void;
  onAddEvent?: (date: Date) => void;
  refreshTrigger?: number;
}

const Calendar: React.FC<CalendarProps> = ({ 
  onDateClick, 
  onAddEvent,
  refreshTrigger 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const monthEvents = await getEventsForMonth(year, month + 1);
        setEvents(monthEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [year, month, refreshTrigger]);

  const getEventsForDay = (day: number): Event[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const dayEvents = getEventsForDay(day);
    
    if (onDateClick) {
      onDateClick(clickedDate, dayEvents);
    }
  };

  const handleAddEventClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    const clickedDate = new Date(year, month, day);
    if (onAddEvent) {
      onAddEvent(clickedDate);
    }
  };

  const hasUserEvents = (dayEvents: Event[]): boolean => {
    return dayEvents.some(e => e.event_type === 'user');
  };

  const hasAdminEvents = (dayEvents: Event[]): boolean => {
    return dayEvents.some(e => e.event_type === 'admin');
  };

  const gridDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridDays.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
    const dayEvents = getEventsForDay(d);
    const hasUser = hasUserEvents(dayEvents);
    const hasAdmin = hasAdminEvents(dayEvents);
    
    gridDays.push(
      <div 
        key={`day-${d}`} 
        className={`${styles.day} ${isToday ? styles.today : ''} ${dayEvents.length > 0 ? styles.hasEvents : ''}`}
        onClick={() => handleDayClick(d)}
        onDoubleClick={(e) => handleAddEventClick(e, d)}
        title="Double-click to add event"
      >
        <span className={styles.dayNumber}>{d}</span>
        <div className={styles.eventDots}>
          {hasUser && <span className={`${styles.eventDot} ${styles.userEvent}`}></span>}
          {hasAdmin && <span className={`${styles.eventDot} ${styles.adminEvent}`}></span>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={styles.navButton} title="Previous Month" aria-label="Previous Month">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className={styles.monthTitle}>{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className={styles.navButton} title="Next Month" aria-label="Next Month">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div className={styles.grid}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayOfWeek}>{day}</div>
        ))}
        {gridDays}
      </div>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <span>Loading events...</span>
        </div>
      )}
    </div>
  );
};

export default Calendar;