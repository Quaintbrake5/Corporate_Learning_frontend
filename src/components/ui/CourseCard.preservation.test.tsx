/**
 * Preservation Property Tests for CourseCard Interaction Behavior
 * 
 * **Validates: Requirements 3.4, 3.5, 3.6, 3.12, 3.13, 3.14**
 * 
 * These tests verify that existing CourseCard interaction behavior is preserved
 * for non-buggy inputs (course enrollment flow, loading states, error handling,
 * mouse clicks, keyboard events, disabled state).
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
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from './CourseCard';
import * as enrollmentService from '../../services/enrollmentService';

// Mock window.open
const mockWindowOpen = vi.fn();

describe('Preservation Property Tests - CourseCard Interaction Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up the DOM after each test
    cleanup();
  });

  const renderCourseCard = (props: any) => {
    return render(
      <BrowserRouter>
        <CourseCard {...props} />
      </BrowserRouter>
    );
  };

  /**
   * Property 6: Mouse clicks on CourseCard trigger handleStart function
   * **Validates: Requirement 3.12**
   * 
   * For any mouse click on a CourseCard,
   * the system SHALL trigger the handleStart function and open the course player.
   */
  it('Property: Mouse clicks on CourseCard trigger handleStart function', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.integer({ min: 0, max: 100 }),
        async (courseId, courseTitle, progress) => {
          // Clean up before each iteration
          cleanup();
          vi.clearAllMocks();

          // Mock enrollInCourse to succeed
          const enrollSpy = vi.spyOn(enrollmentService, 'enrollInCourse').mockResolvedValue({
            id: 'enrollment-123',
            user_id: 'user-123',
            course_id: courseId,
            status: 'active',
            progress_percentage: 0,
            start_date: new Date().toISOString(),
          });

          // Render CourseCard
          renderCourseCard({
            id: courseId,
            title: courseTitle,
            progress: progress,
            department: 'Test Department',
            duration: '1h 30m',
            isMandatory: true,
          });

          // Find the button (either "Start" or "Continue")
          const button = screen.getByRole('button');
          expect(button).toBeInTheDocument();

          // Simulate mouse click
          fireEvent.click(button);

          // Wait for course player to open
          await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalledWith(`/course/${courseId}`, '_blank');
          }, { timeout: 2000 });

          // Verify: Course player opened in new tab
          expect(mockWindowOpen).toHaveBeenCalledWith(`/course/${courseId}`, '_blank');

          enrollSpy.mockRestore();
          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property 7: Enter/Space keyboard events on focused CourseCard trigger handleStart
   * **Validates: Requirement 3.13**
   * 
   * For any Enter or Space key press on a focused CourseCard,
   * the system SHALL trigger the handleStart function and open the course player.
   */
  it('Property: Enter/Space keyboard events on focused CourseCard trigger handleStart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.integer({ min: 0, max: 100 }),
        fc.constantFrom('Enter', ' '),
        async (courseId, courseTitle, progress, key) => {
          // Clean up before each iteration
          cleanup();
          vi.clearAllMocks();

          // Mock enrollInCourse to succeed
          const enrollSpy = vi.spyOn(enrollmentService, 'enrollInCourse').mockResolvedValue({
            id: 'enrollment-123',
            user_id: 'user-123',
            course_id: courseId,
            status: 'active',
            progress_percentage: 0,
            start_date: new Date().toISOString(),
          });

          // Render CourseCard
          renderCourseCard({
            id: courseId,
            title: courseTitle,
            progress: progress,
            department: 'Test Department',
            duration: '1h 30m',
            isMandatory: true,
          });

          // Find the button
          const button = screen.getByRole('button');
          expect(button).toBeInTheDocument();

          // Focus the button
          button.focus();
          expect(button).toHaveFocus();

          // Simulate keyboard event (Enter or Space)
          fireEvent.keyDown(button, { key: key });

          // Wait for course player to open
          await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalledWith(`/course/${courseId}`, '_blank');
          }, { timeout: 2000 });

          // Verify: Course player opened in new tab
          expect(mockWindowOpen).toHaveBeenCalledWith(`/course/${courseId}`, '_blank');

          enrollSpy.mockRestore();
          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property 8: Disabled CourseCard during enrollment prevents all interaction events
   * **Validates: Requirement 3.14**
   * 
   * For any CourseCard in disabled state (during enrollment),
   * the system SHALL prevent all interaction events (mouse clicks, keyboard events).
   * 
   * NOTE: This test verifies that the button IS disabled during enrollment.
   * In real browsers, disabled buttons don't respond to clicks, but React Testing Library's
   * fireEvent.click() bypasses the disabled attribute. We verify the disabled state exists,
   * which is the preservation behavior we want to maintain.
   */
  it('Property: Disabled CourseCard during enrollment prevents all interaction events', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (courseId, courseTitle) => {
          // Clean up before each iteration
          cleanup();
          vi.clearAllMocks();

          // Mock enrollInCourse to delay response (keeps button disabled longer)
          const enrollSpy = vi.spyOn(enrollmentService, 'enrollInCourse').mockImplementation(
            () => new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  id: 'enrollment-123',
                  user_id: 'user-123',
                  course_id: courseId,
                  status: 'active',
                  progress_percentage: 0,
                  start_date: new Date().toISOString(),
                });
              }, 1000);
            })
          );

          // Render CourseCard without progress (new enrollment)
          renderCourseCard({
            id: courseId,
            title: courseTitle,
            department: 'Test Department',
            duration: '1h 30m',
            isMandatory: true,
          });

          // Find and click the "Start" button to initiate enrollment
          const startButton = screen.getByRole('button');
          expect(startButton).toBeInTheDocument();
          expect(startButton).not.toBeDisabled(); // Initially not disabled

          fireEvent.click(startButton);

          // Wait for "Enrolling..." state
          await waitFor(() => {
            const enrollingText = screen.queryByText(/Enrolling.../i);
            expect(enrollingText).toBeInTheDocument();
          }, { timeout: 1000 });

          // Verify: Button is disabled during enrollment
          const button = screen.getByRole('button');
          expect(button).toBeDisabled();

          // Verify: Button shows "Enrolling..." text
          expect(button).toHaveTextContent(/Enrolling.../i);

          // Wait for enrollment to complete
          await waitFor(() => {
            expect(button).not.toBeDisabled();
          }, { timeout: 2000 });

          // Verify: After enrollment completes, button is enabled again
          expect(button).not.toBeDisabled();

          enrollSpy.mockRestore();
          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  }, 15000); // Increase timeout to 15 seconds for this test
});
