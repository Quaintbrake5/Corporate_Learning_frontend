import React, { useState } from 'react';
import styles from './Calendar.module.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate grid
  const gridDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridDays.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
    
    // Add some random fake events just for testing / UI purpose
    const hasEvent = [5, 12, 19, 26].includes(d);

    gridDays.push(
      <div key={`day-${d}`} className={`${styles.day} ${isToday ? styles.today : ''}`}>
        <span className={styles.dayNumber}>{d}</span>
        {hasEvent && <div className={styles.eventDot}></div>}
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
    </div>
  );
};

export default Calendar;
