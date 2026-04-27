
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode, faMicrochip, faShip, faPlay } from '@fortawesome/free-solid-svg-icons';
import styles from './CourseList.module.css';

const courses = [
  {
    id: 1,
    title: 'Operating System Security',
    type: 'Mandatory',
    progress: 75,
    icon: faLaptopCode,
    color: 'var(--primary-blue)',
    bg: 'rgba(0, 51, 102, 0.05)'
  },
  {
    id: 2,
    title: 'Artificial Intelligence Basics',
    type: 'Elective',
    progress: 30,
    icon: faMicrochip,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.05)'
  },
  {
    id: 3,
    title: 'Maritime Dangerous Goods',
    type: 'Mandatory',
    progress: 0,
    icon: faShip,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.05)'
  }
];

const CourseList = () => {
  return (
    <div className={styles.widgetCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>My Courses</h3>
        <div className={styles.filters}>
          <select className={styles.select} aria-label="Select Course Type">
            <option>All Types</option>
            <option>Mandatory</option>
            <option>Elective</option>
          </select>
        </div>
      </div>
      
      <div className={styles.courseGrid}>
        {courses.map(course => (
          <div key={course.id} className={styles.courseCard} style={{ backgroundColor: course.bg }}>
            <div className={styles.courseHeader}>
              <div className={styles.iconWrapper} style={{ color: course.color }}>
                <FontAwesomeIcon icon={course.icon} />
              </div>
              <span className={styles.badge} style={{ 
                backgroundColor: course.type === 'Mandatory' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(144, 238, 144, 0.2)',
                color: course.type === 'Mandatory' ? '#ef4444' : '#2e7d32'
              }}>
                {course.type}
              </span>
            </div>
            
            <div className={styles.courseBody}>
              <h4 className={styles.courseTitle}>{course.title}</h4>
              <div className={styles.progressContainer}>
                <div className={styles.progressInfo}>
                  <span className={styles.progressText}>Progress</span>
                  <span className={styles.progressPerc}>{course.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${course.progress}%`, backgroundColor: course.color }}></div>
                </div>
              </div>
            </div>
            
            <button className={styles.continueBtn} style={{ backgroundColor: course.color }} type="button" aria-label="Continue Course">
              <FontAwesomeIcon icon={faPlay} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
