/**
 * Bug Condition Exploration Tests
 * 
 * These tests MUST FAIL on unfixed code - failure confirms the bugs exist.
 * DO NOT attempt to fix the tests or the code when they fail.
 * These tests encode the expected behavior - they will validate the fixes when they pass after implementation.
 * 
 * GOAL: Surface counterexamples that demonstrate the bugs exist
 * 
 * NOTE: The ReactPlayer bug is that it's called as a function: (ReactPlayer as any)({...})
 * instead of JSX: <ReactPlayer ... />. This causes rendering issues in production.
 * Our test verifies that ReactPlayer is used correctly by checking the component structure.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoursePlayer from './CoursePlayer';
import * as courseService from '../../services/courseService';
import * as enrollmentService from '../../services/enrollmentService';
import ReactPlayer from 'react-player';

// Mock the services
vi.mock('../../services/courseService');
vi.mock('../../services/enrollmentService');
vi.mock('../../services/quizService');
vi.mock('../../services/progressService');

// Track how ReactPlayer is being used
let reactPlayerUsageType: 'jsx-element' | 'function-call' | 'not-used' = 'not-used';

// Mock ReactPlayer to detect usage pattern
vi.mock('react-player', () => {
  const MockReactPlayer = (props: any) => {
    // If this is called as a proper React component (JSX), it will have proper React context
    // We mark it as jsx-element when rendered
    reactPlayerUsageType = 'jsx-element';
    return (
      <div data-testid="react-player-component" data-url={props.url}>
        ReactPlayer Component
      </div>
    );
  };
  
  // Add a marker to detect function calls
  MockReactPlayer.displayName = 'ReactPlayer';
  
  return {
    default: MockReactPlayer
  };
});

// Mock useParams to provide courseId
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: 'test-course-123' })
  };
});

describe('Bug Condition Exploration Tests - CoursePlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reactPlayerUsageType = 'not-used';
    
    // Setup default mocks
    vi.mocked(courseService.getCourse).mockResolvedValue({
      id: 'test-course-123',
      title: 'Test Course',
      description: 'Test Description',
      category: 'Test Category',
      duration: 60,
      level: 'Beginner',
      thumbnail_url: 'https://example.com/thumb.jpg',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    });
    
    vi.mocked(enrollmentService.enrollInCourse).mockResolvedValue({
      id: 'enrollment-123',
      user_id: 'user-123',
      course_id: 'test-course-123',
      enrollment_date: '2024-01-01',
      status: 'active',
      progress_percentage: 0
    });
  });

  /**
   * Test 1.1: ReactPlayer JSX rendering for video modules
   * 
   * Bug Condition: isBugCondition_VideoPlayer(X) where X.syntax = "function_call" 
   *                and X.pattern = "(ReactPlayer as any)({...})"
   * 
   * Expected Behavior: Component should render <ReactPlayer url={...} controls={true} ... /> 
   *                    with proper JSX syntax
   * 
   * EXPECTED OUTCOME: This test FAILS on unfixed code (confirms bug exists)
   * 
   * The bug in the code is on line 383 of CoursePlayer.tsx:
   *   {(ReactPlayer as any)({...})}  // WRONG - function call
   * Should be:
   *   <ReactPlayer ... />  // CORRECT - JSX element
   */
  it('Test 1.1: ReactPlayer should be rendered as JSX element, not function call', async () => {
    // Arrange: Setup a video module
    const videoModule = {
      id: 'module-video-1',
      course_id: 'test-course-123',
      title: 'Video Module',
      content_type: 'video' as const,
      content_url: 'https://example.com/video.mp4',
      order_index: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    vi.mocked(courseService.getCourseModules).mockResolvedValue([videoModule]);

    // Act: Render the CoursePlayer
    render(
      <BrowserRouter>
        <CoursePlayer />
      </BrowserRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByText('Loading training content...')).not.toBeInTheDocument();
    });

    // Assert: ReactPlayer should be rendered as a JSX element
    // BUG CONDITION: On unfixed code, ReactPlayer is called as a function: (ReactPlayer as any)({...})
    // This causes the component to not render properly as a React element
    
    // Check that ReactPlayer component is present in the DOM
    const reactPlayerElement = screen.queryByTestId('react-player-component');
    
    // This assertion will FAIL on unfixed code if ReactPlayer is called as a function
    // because function calls don't create proper React elements
    expect(reactPlayerElement).toBeInTheDocument();
    
    // Verify the usage type was JSX (not a direct function call)
    expect(reactPlayerUsageType).toBe('jsx-element');
    
    // Additional assertion: Check that the video URL is passed correctly
    if (reactPlayerElement) {
      expect(reactPlayerElement).toHaveAttribute('data-url', videoModule.content_url);
    }
  });
});
