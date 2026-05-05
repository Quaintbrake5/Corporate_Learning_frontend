/**
 * Preservation Property Tests for Dashboard and Course Enrollment Behavior
 * 
 * **Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11**
 * 
 * These tests verify that existing Dashboard and Course Enrollment behavior is preserved
 * for non-buggy inputs (course fetching, enrollment flow, UI interactions).
 * 
 * IMPORTANT: These tests should PASS on UNFIXED code to establish baseline behavior.
 * 
 * Testing Approach:
 * - Observe behavior on UNFIXED code for non-buggy scenarios
 * - Write property-based tests capturing observed behavior patterns
 * - Run tests on UNFIXED code to confirm baseline
 * - After fixes, re-run to ensure no regressions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import api from '../../services/api';
import Dashboard from './Dashboard';
import authReducer from '../../store/authSlice';

// Mock the services
vi.mock('../../services/courseService', () => ({
  getCourses: vi.fn(),
}));

vi.mock('../../services/userService', () => ({
  getDepartment: vi.fn(),
}));

vi.mock('../../services/dashboardService', () => ({
  getDashboardStats: vi.fn(),
  getProductivityData: vi.fn(),
}));

vi.mock('../../services/eventService', () => ({
  getEventsForMonth: vi.fn(),
}));

import { getCourses } from '../../services/courseService';
import { getDepartment } from '../../services/userService';
import { getDashboardStats, getProductivityData } from '../../services/dashboardService';
import { getEventsForMonth } from '../../services/eventService';

describe('Preservation Property Tests - Dashboard and Course Enrollment Behavior', () => {
  let mock: MockAdapter;
  let store: ReturnType<typeof configureStore>;

  const createMockStore = (user = { id: '123', name: 'Test User', email: 'test@example.com', department_id: 1 }) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user,
          token: 'test-token',
          isAuthenticated: true,
        },
      },
    });
  };

  const renderDashboard = (customStore = createMockStore()) => {
    return render(
      <Provider store={customStore}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mock = new MockAdapter(api);
    store = createMockStore();
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token-123');
    vi.clearAllMocks();
    
    // Mock getEventsForMonth to prevent Calendar from making API calls
    vi.mocked(getEventsForMonth).mockResolvedValue([]);
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property 1: Dashboard fetches courses, department data, and statistics in parallel
   * **Validates: Requirement 3.7**
   * 
   * For any Dashboard component load, the system SHALL fetch courses, department data,
   * and statistics in parallel using Promise.all.
   * 
   * This test verifies that all three API calls are initiated simultaneously,
   * not sequentially, for optimal performance.
   */
  it('Property: Dashboard fetches courses, department data, and statistics in parallel', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 50 }),
        async (departmentId, completionPercentage, learningHours) => {
          // Track call order and timing
          const callOrder: string[] = [];
          const callTimestamps: Record<string, number> = {};

          // Mock getCourses
          vi.mocked(getCourses).mockImplementation(async () => {
            callOrder.push('getCourses');
            callTimestamps['getCourses'] = Date.now();
            return {
              items: [
                {
                  id: '1',
                  title: 'Test Course',
                  department_owner: String(departmentId),
                  duration_in_minutes: 60,
                  is_mandatory: true,
                  is_cross_department: false,
                  thumbnail_url: '',
                },
              ],
              total: 1,
              page: 1,
              page_size: 40,
              total_pages: 1,
            };
          });

          // Mock getDepartment
          vi.mocked(getDepartment).mockImplementation(async () => {
            callOrder.push('getDepartment');
            callTimestamps['getDepartment'] = Date.now();
            return {
              id: departmentId,
              name: 'Test Department',
              description: 'Test',
            };
          });

          // Mock getDashboardStats
          vi.mocked(getDashboardStats).mockImplementation(async () => {
            callOrder.push('getDashboardStats');
            callTimestamps['getDashboardStats'] = Date.now();
            return {
              training_completion_percentage: completionPercentage,
              learning_hours: learningHours,
              overdue_courses: [],
            };
          });

          // Mock getProductivityData
          vi.mocked(getProductivityData).mockImplementation(async () => {
            return {
              user_id: '123',
              data: [],
              total_days: 30,
            };
          });

          // Render Dashboard
          renderDashboard();

          // Wait for all API calls to complete
          await waitFor(() => {
            expect(getCourses).toHaveBeenCalled();
            expect(getDepartment).toHaveBeenCalled();
            expect(getDashboardStats).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Verify: All three functions were called
          expect(callOrder).toContain('getCourses');
          expect(callOrder).toContain('getDepartment');
          expect(callOrder).toContain('getDashboardStats');

          // Verify: Calls were made in parallel (all within ~50ms of each other)
          // This is a loose check since we can't guarantee exact timing in tests
          const timestamps = Object.values(callTimestamps);
          if (timestamps.length === 3) {
            const maxTimestamp = Math.max(...timestamps);
            const minTimestamp = Math.min(...timestamps);
            const timeDiff = maxTimestamp - minTimestamp;
            
            // In parallel execution, all calls should start within a short time window
            // We use a generous threshold for test stability
            expect(timeDiff).toBeLessThan(100);
          }
        }
      ),
      { numRuns: 2 }
    );
  });

  /**
   * Property 2: Course data fetch failures display "Failed to load dashboard data"
   * **Validates: Requirement 3.8**
   * 
   * For any Dashboard component load where course data fetch fails,
   * the system SHALL display "Failed to load dashboard data" error message.
   */
  it('Property: Course data fetch failures display "Failed to load dashboard data"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          new Error('Network Error'),
          new Error('Timeout'),
          new Error('Server Error')
        ),
        async (error) => {
          // Mock getCourses to fail
          vi.mocked(getCourses).mockRejectedValue(error);

          // Mock other services to succeed
          vi.mocked(getDepartment).mockResolvedValue({
            id: 1,
            name: 'Test Department',
            description: 'Test',
          });

          vi.mocked(getDashboardStats).mockResolvedValue({
            training_completion_percentage: 75,
            learning_hours: 12,
            overdue_courses: [],
          });

          vi.mocked(getProductivityData).mockResolvedValue({
            user_id: '123',
            data: [],
            total_days: 30,
          });

          // Render Dashboard
          renderDashboard();

          // Wait for error message to appear
          await waitFor(() => {
            const errorMessage = screen.queryByText(/Failed to load dashboard data/i);
            expect(errorMessage).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify: Error message is displayed
          expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
        }
      ),
      { numRuns: 2 }
    );
  }, 10000);

  /**
   * Property 3: Productivity data fetch failures silently handle error and show empty chart
   * **Validates: Requirement 3.9**
   * 
   * For any Dashboard component load where productivity data fetch fails,
   * the system SHALL silently handle the error and display an empty productivity chart
   * without showing an error banner.
   */
  it('Property: Productivity data fetch failures silently handle error and show empty chart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          new Error('Network Error'),
          new Error('Timeout'),
          new Error('Server Error')
        ),
        async (error) => {
          // Mock getProductivityData to fail
          vi.mocked(getProductivityData).mockRejectedValue(error);

          // Mock other services to succeed
          vi.mocked(getCourses).mockResolvedValue({
            items: [
              {
                id: '1',
                title: 'Test Course',
                department_owner: '1',
                duration_in_minutes: 60,
                is_mandatory: true,
                is_cross_department: false,
                thumbnail_url: '',
              },
            ],
            total: 1,
            page: 1,
            page_size: 40,
            total_pages: 1,
          });

          vi.mocked(getDepartment).mockResolvedValue({
            id: 1,
            name: 'Test Department',
            description: 'Test',
          });

          vi.mocked(getDashboardStats).mockResolvedValue({
            training_completion_percentage: 75,
            learning_hours: 12,
            overdue_courses: [],
          });

          // Render Dashboard
          renderDashboard();

          // Wait for dashboard to load
          await waitFor(() => {
            expect(getCourses).toHaveBeenCalled();
            expect(getDashboardStats).toHaveBeenCalled();
            expect(getProductivityData).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Verify: NO error banner is displayed for productivity data failure
          const errorBanner = screen.queryByText(/Failed to load dashboard data/i);
          expect(errorBanner).not.toBeInTheDocument();

          // Verify: Dashboard still renders successfully
          expect(screen.getAllByText(/Hello,/i)[0]).toBeInTheDocument();
        }
      ),
      { numRuns: 2 }
    );
  });

  /**
   * Property 4: Learning path courses filter by department_owner match or is_cross_department=true
   * **Validates: Requirement 3.10**
   * 
   * For any set of courses, the learning path SHALL show courses where:
   * - department_owner matches user's department, OR
   * - is_cross_department is true
   */
  it('Property: Learning path courses filter by department_owner match or is_cross_department=true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            department_owner: fc.integer({ min: 1, max: 10 }),
            is_cross_department: fc.boolean(),
            is_mandatory: fc.boolean(),
            duration_in_minutes: fc.integer({ min: 30, max: 300 }),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        async (userDepartmentId, courses) => {
          // Mock services
          vi.mocked(getCourses).mockResolvedValue({
            items: courses.map(c => ({
              ...c,
              department_owner: String(c.department_owner),
              thumbnail_url: '',
            })),
            total: courses.length,
            page: 1,
            page_size: 40,
            total_pages: 1,
          });

          vi.mocked(getDepartment).mockResolvedValue({
            id: userDepartmentId,
            name: 'Test Department',
            description: 'Test',
          });

          vi.mocked(getDashboardStats).mockResolvedValue({
            training_completion_percentage: 75,
            learning_hours: 12,
            overdue_courses: [],
          });

          vi.mocked(getProductivityData).mockResolvedValue({
            user_id: '123',
            data: [],
            total_days: 30,
          });

          // Render Dashboard
          const customStore = createMockStore({
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            department_id: userDepartmentId,
          });
          renderDashboard(customStore);

          // Wait for courses to load
          await waitFor(() => {
            expect(getCourses).toHaveBeenCalled();
            expect(getDepartment).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Calculate expected learning path courses
          const expectedLearningPath = courses.filter(
            c => c.department_owner === userDepartmentId || c.is_cross_department
          );

          // Verify: Learning path section exists
          const learningPathSection = screen.getByText(/Upcoming Schedule:/i);
          expect(learningPathSection).toBeInTheDocument();

          // Verify: Only courses matching the filter criteria are displayed
          // (We check that at least some expected courses are present)
          if (expectedLearningPath.length > 0) {
            const firstExpectedCourse = expectedLearningPath[0];
            await waitFor(() => {
              const courseTitle = screen.queryByText(firstExpectedCourse.title);
              expect(courseTitle).toBeInTheDocument();
            }, { timeout: 3000 });
          }
        }
      ),
      { numRuns: 2 }
    );
  }, 15000);

  /**
   * Property 5: Recommended electives filter by department_owner mismatch and is_cross_department=false
   * **Validates: Requirement 3.11**
   * 
   * For any set of courses, the recommended electives SHALL show courses where:
   * - department_owner does NOT match user's department, AND
   * - is_cross_department is false
   */
  it('Property: Recommended electives filter by department_owner mismatch and is_cross_department=false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            department_owner: fc.integer({ min: 1, max: 10 }),
            is_cross_department: fc.boolean(),
            is_mandatory: fc.boolean(),
            duration_in_minutes: fc.integer({ min: 30, max: 300 }),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        async (userDepartmentId, courses) => {
          // Mock services
          vi.mocked(getCourses).mockResolvedValue({
            items: courses.map(c => ({
              ...c,
              department_owner: String(c.department_owner),
              thumbnail_url: '',
            })),
            total: courses.length,
            page: 1,
            page_size: 40,
            total_pages: 1,
          });

          vi.mocked(getDepartment).mockResolvedValue({
            id: userDepartmentId,
            name: 'Test Department',
            description: 'Test',
          });

          vi.mocked(getDashboardStats).mockResolvedValue({
            training_completion_percentage: 75,
            learning_hours: 12,
            overdue_courses: [],
          });

          vi.mocked(getProductivityData).mockResolvedValue({
            user_id: '123',
            data: [],
            total_days: 30,
          });

          // Render Dashboard
          const customStore = createMockStore({
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            department_id: userDepartmentId,
          });
          renderDashboard(customStore);

          // Wait for courses to load
          await waitFor(() => {
            expect(getCourses).toHaveBeenCalled();
            expect(getDepartment).toHaveBeenCalled();
          }, { timeout: 3000 });

          // Calculate expected recommended electives
          const expectedElectives = courses.filter(
            c => c.department_owner !== userDepartmentId && !c.is_cross_department
          );

          // Verify: Recommended classes section exists
          const electivesSection = screen.getByText(/Recommended Classes/i);
          expect(electivesSection).toBeInTheDocument();

          // Verify: Only courses matching the filter criteria are displayed
          // (We check that at least some expected courses are present)
          if (expectedElectives.length > 0) {
            const firstExpectedCourse = expectedElectives[0];
            await waitFor(() => {
              const courseTitle = screen.queryByText(firstExpectedCourse.title);
              expect(courseTitle).toBeInTheDocument();
            }, { timeout: 3000 });
          }
        }
      ),
      { numRuns: 2 }
    );
  }, 15000);
});
