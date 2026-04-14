import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CourseCard from '../../components/ui/CourseCard';
import { getCourses, type Course } from '../../services/courseService';
import styles from './Courses.module.css';

const subdivisionMap: Record<string, string> = {
  '1': 'CS',
  '2': 'ENG',
  '3': 'OPS',
  '4': 'FIN',
  '5': 'HR',
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

const mapSubdivision = (value: string): string => {
  return subdivisionMap[value] || value;
};

const Courses: React.FC = () => {
  const [mandatoryCourses, setMandatoryCourses] = useState<Course[]>([]);
  const [electiveCourses, setElectiveCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const [mandatoryRes, electiveRes] = await Promise.all([
          getCourses(1, 10, true) as any,
          getCourses(1, 10, false) as any,
        ]);
        setMandatoryCourses(mandatoryRes?.items || (Array.isArray(mandatoryRes) ? mandatoryRes : []));
        setElectiveCourses(electiveRes?.items || (Array.isArray(electiveRes) ? electiveRes : []));
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (error) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => globalThis.window.location.reload()}>Try Again</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Courses</h1>
          <p className={styles.subtitle}>Explore and manage all your learning activities.</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading courses...</div>
        ) : (
          <>
            <section className={styles.section}>
              <h2>Mandatory Training</h2>
              <div className={styles.grid}>
                {mandatoryCourses.length > 0 ? (
                  mandatoryCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      subdivision={mapSubdivision(course.subdivision_owner)}
                      duration={formatDuration(course.duration_in_minutes)}
                      isMandatory={course.is_mandatory}
                    />
                  ))
                ) : (
                  <p>No mandatory courses found.</p>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Elective Courses</h2>
              <div className={styles.grid}>
                {electiveCourses.length > 0 ? (
                  electiveCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      subdivision={mapSubdivision(course.subdivision_owner)}
                      duration={formatDuration(course.duration_in_minutes)}
                    />
                  ))
                ) : (
                  <p>No elective courses found.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
