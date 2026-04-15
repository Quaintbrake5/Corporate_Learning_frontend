import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourse, getCourseModules, type Course, type Module } from '../../services/courseService';
import styles from './CoursePlayer.module.css';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const [courseData, modulesData] = await Promise.all([
          getCourse(courseId),
          getCourseModules(courseId)
        ]);
        setCourse(courseData);
        setModules(modulesData);
        if (modulesData.length > 0) {
          setActiveModule(modulesData[0]);
        }
      } catch (err) {
        console.error('Failed to load course data:', err);
        setError('Failed to load course content.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div className={styles.loading}>Loading training content...</div>;
  if (error || !course) return <div className={styles.error}>{error || 'Course not found'}</div>;

  const renderContent = () => {
    if (!activeModule) return null;

    switch (activeModule.content_type) {
      case 'video':
        return (
          <div className={styles.videoWrapper}>
            <iframe
              src={activeModule.content_url || ''}
              title={activeModule.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoFrame}
            ></iframe>
          </div>
        );
      case 'pdf':
        return (
          <div className={styles.pdfWrapper}>
            <iframe
              src={activeModule.content_url || ''}
              title={activeModule.title}
              className={styles.pdfFrame}
            ></iframe>
          </div>
        );
      default:
        return <div className={styles.unsupported}>Unsupported content type: {activeModule.content_type}</div>;
    }
  };

  return (
    <div className={styles.playerPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => window.close()} className={styles.backBtn}>
            <i className="fa-solid fa-xmark"></i> Close Player
          </button>
          <div className={styles.divider}></div>
          <h1 className={styles.courseTitle}>{course.title}</h1>
        </div>
        <div className={styles.headerRight}>
           <span className={styles.moduleBadge}>Module {modules.indexOf(activeModule!) + 1} of {modules.length}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.contentArea}>
          {renderContent()}
          <div className={styles.contentInfo}>
             <h2>{activeModule?.title}</h2>
             <p>{course.description}</p>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Course Content</h3>
          <div className={styles.moduleList}>
            {modules.map((m, index) => (
              <button
                key={m.id}
                className={`${styles.moduleItem} ${activeModule?.id === m.id ? styles.active : ''}`}
                onClick={() => setActiveModule(m)}
              >
                <div className={styles.moduleNumber}>{index + 1}</div>
                <div className={styles.moduleMeta}>
                  <span className={styles.moduleItemTitle}>{m.title}</span>
                  <span className={styles.moduleType}>
                    <i className={m.content_type === 'video' ? 'fa-solid fa-circle-play' : 'fa-solid fa-file-pdf'}></i>
                    {m.content_type.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CoursePlayer;
