import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { getCourse, getCourseModules, type Course, type Module } from '../../services/courseService';
import styles from './CoursePlayer.module.css';

interface ApiError {
  response?: {
    status?: number;
    data?: { detail?: string };
  };
}

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
   
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeModule) {
      console.log('--- Course Player Debug ---');
      console.log('Active Module:', activeModule.title);
      console.log('Content Type:', activeModule.content_type);
      console.log('Content URL:', activeModule.content_url);
      console.log('---------------------------');
    }
  }, [activeModule]);

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
        if (Array.isArray(modulesData) && modulesData.length > 0) {
          setModules(modulesData);
          setActiveModule(modulesData[0]);
        } else {
          setModules([]);
          setError('No training modules found for this course. You might not have the required permissions.');
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        console.error('Failed to load course data:', err);
        if (error.response?.status === 403) {
          setError('Access Denied: You do not have permission to view this course content.');
        } else {
          setError('Failed to load course content. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

   if (loading) return <div className={styles.loading}>Loading training content...</div>;
   if (error || !course) return <div className={styles.error}>{error || 'Course not found'}</div>;

   // Calculate module index safely
   const moduleIndex = Array.isArray(modules) && activeModule ? modules.indexOf(activeModule) : -1;
   const moduleNumber = moduleIndex === -1 ? 0 : moduleIndex + 1;
   const totalModules = Array.isArray(modules) ? modules.length : 0;

   const renderContent = () => {
     if (!activeModule) return null;

     switch (activeModule.content_type) {
        case 'video':
          if (!activeModule.content_url) {
            return (
              <div className={styles.unsupported}>
                <i className="fa-solid fa-video-slash"></i>
                <p>No video URL provided for this module.</p>
              </div>
            );
          }
          return (
            <div className={styles.videoWrapper}>
                <ReactPlayer
                  src={activeModule.content_url}
                  controls
                  width="100%"
                  height="100%"
                  className={styles.videoFrame}
                  playing={true}
                  onError={(e) => {
                    console.error('ReactPlayer Error:', e);
                    setError('Format not supported or link is broken. Check console for details.');
                  }}
                  config={{
                    html: {
                      controlsList: 'nodownload',
                      style: { width: '100%', height: '100%', objectFit: 'contain' }
                    }
                  }}
                />
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
          <div className={styles.headerContainer}>
            <div className={styles.headerLeft}>
              <button onClick={() => window.close()} className={styles.backBtn}>
                <i className="fa-solid fa-xmark"></i> Close Player
              </button>
              <div className={styles.divider}></div>
              <h1 className={styles.courseTitle}>{course.title}</h1>
            </div>
            <div className={styles.headerRight}>
               <span className={styles.moduleBadge}>Module {moduleNumber} of {totalModules}</span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.layoutContainer}>
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
              {Array.isArray(modules) ? modules.map((m, index) => (
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
              )) : []}
            </div>
            </aside>
          </div>
        </main>
      </div>
   );
};

export default CoursePlayer;