/**
 * Preservation Property Tests for CORS and API Behavior
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * These tests verify that existing CORS and API behavior is preserved
 * for non-buggy inputs (non-enrollment endpoints, authenticated requests, error handling).
 * 
 * IMPORTANT: These tests should PASS on UNFIXED code to establish baseline behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import MockAdapter from 'axios-mock-adapter';
import api from './api';

describe('Preservation Property Tests - CORS and API Behavior', () => {
  let mock: MockAdapter;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let originalMode: string | undefined;

  beforeEach(() => {
    mock = new MockAdapter(api);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Store original mode
    originalMode = import.meta.env.MODE;
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    consoleLogSpy.mockRestore();
    // Restore original mode
    if (originalMode !== undefined) {
      import.meta.env.MODE = originalMode;
    }
    localStorage.clear();
  });

  /**
   * Property 1: Authenticated requests include Authorization header
   * **Validates: Requirement 3.1**
   * 
   * For any API endpoint (excluding enrollment), when a valid JWT token exists,
   * the request SHALL include the Authorization header with Bearer token.
   */
  it('Property: Authenticated requests include Authorization header', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/courses', '/dashboard/stats', '/modules/123', '/users/me'),
        fc.uuid(),
        async (endpoint, token) => {
          // Setup: Store token in localStorage
          localStorage.setItem('access_token', token);

          // Track if Authorization header was set correctly
          let authHeaderCorrect = false;

          // Mock successful response
          mock.onGet(endpoint).reply((config) => {
            // Check Authorization header
            authHeaderCorrect = config.headers?.Authorization === `Bearer ${token}`;
            return [200, { data: 'success' }];
          });

          // Execute: Make API request
          await api.get(endpoint);

          // Verify: Authorization header was present and correct
          expect(authHeaderCorrect).toBe(true);
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property 2: 401 responses clear localStorage and redirect to login
   * **Validates: Requirement 3.2**
   * 
   * For any API endpoint that returns 401 Unauthorized,
   * the system SHALL clear localStorage and redirect to login page.
   */
  it('Property: 401 responses clear localStorage and redirect to login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/courses', '/dashboard/stats', '/modules/123', '/users/me'),
        fc.uuid(),
        async (endpoint, token) => {
          // Setup: Store token and user data in localStorage
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@example.com' }));

          // Mock 401 response
          mock.onGet(endpoint).reply(401, { detail: 'Unauthorized' });

          // Mock window.location.replace using Object.defineProperty
          let redirectUrl: string | null = null;
          const originalLocation = window.location;
          delete (window as any).location;
          window.location = {
            ...originalLocation,
            replace: vi.fn((url: string) => {
              redirectUrl = url;
            }) as any,
          };

          // Execute: Make API request (should trigger 401 handler)
          // The interceptor returns a never-resolving promise, so we race it with a timeout
          const requestPromise = api.get(endpoint);
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 100));
          
          await Promise.race([requestPromise, timeoutPromise]);

          // Verify: localStorage is cleared
          expect(localStorage.getItem('access_token')).toBeNull();
          expect(localStorage.getItem('user')).toBeNull();

          // Verify: Redirect to login was called
          expect(redirectUrl).toBe('/login');

          // Cleanup
          window.location = originalLocation;
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);

  /**
   * Property 3: Development mode logs request/response details
   * **Validates: Requirement 3.3**
   * 
   * For any API request in development mode,
   * the system SHALL log request and response details to console.
   */
  it('Property: Development mode logs request/response details', async () => {
    // Set development mode
    import.meta.env.MODE = 'development';

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/courses', '/dashboard/stats', '/modules/123'),
        fc.constantFrom('GET', 'POST', 'PUT'),
        async (endpoint, method) => {
          // Mock successful response
          if (method === 'GET') {
            mock.onGet(endpoint).reply(200, { data: 'success' });
          } else if (method === 'POST') {
            mock.onPost(endpoint).reply(200, { data: 'success' });
          } else if (method === 'PUT') {
            mock.onPut(endpoint).reply(200, { data: 'success' });
          }

          // Clear previous console logs
          consoleLogSpy.mockClear();

          // Execute: Make API request
          if (method === 'GET') {
            await api.get(endpoint);
          } else if (method === 'POST') {
            await api.post(endpoint, {});
          } else if (method === 'PUT') {
            await api.put(endpoint, {});
          }

          // Verify: Console logs were called
          expect(consoleLogSpy).toHaveBeenCalled();
          
          // Verify: Request log includes method and URL
          const requestLog = consoleLogSpy.mock.calls.find(call => 
            call[0] === '[API Request]'
          );
          expect(requestLog).toBeDefined();
          expect(requestLog?.[2]).toContain(endpoint);

          // Verify: Response log includes status and URL
          const responseLog = consoleLogSpy.mock.calls.find(call => 
            call[0] === '[API Response]'
          );
          expect(responseLog).toBeDefined();
          expect(responseLog?.[1]).toBe(200);
          expect(responseLog?.[2]).toContain(endpoint);
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property 4: GET /courses endpoint works with CORS
   * **Validates: Requirements 3.1-3.3**
   * 
   * For any GET request to /courses endpoint with valid authentication,
   * the request SHALL complete successfully with proper headers.
   */
  it('Property: GET /courses endpoint works with CORS', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 100 }),
        async (token, page, pageSize) => {
          // Setup: Store token in localStorage
          localStorage.setItem('access_token', token);

          // Track if Authorization header was set correctly
          let authHeaderCorrect = false;

          // Mock successful response
          mock.onGet('/courses').reply((config) => {
            // Verify Authorization header
            authHeaderCorrect = config.headers?.Authorization === `Bearer ${token}`;

            return [200, {
              items: [],
              total: 0,
              page: config.params?.page || page,
              page_size: config.params?.page_size || pageSize,
              total_pages: 0
            }];
          });

          // Execute: Make API request
          const response = await api.get('/courses', {
            params: { page, page_size: pageSize }
          });

          // Verify: Authorization header was correct
          expect(authHeaderCorrect).toBe(true);

          // Verify: Response is successful
          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('items');
          expect(response.data).toHaveProperty('total');
        }
      ),
      { numRuns: 3 }
    );
  });

  /**
   * Property 5: Other API endpoints handle CORS consistently
   * **Validates: Requirements 3.1-3.3**
   * 
   * For any non-enrollment API endpoint with valid authentication,
   * the request SHALL complete successfully with consistent behavior.
   */
  it('Property: Other API endpoints handle CORS consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/courses/123',
          '/modules/456',
          '/users/me',
          '/departments',
          '/events'
        ),
        fc.uuid(),
        async (endpoint, token) => {
          // Setup: Store token in localStorage
          localStorage.setItem('access_token', token);

          // Track if Authorization header was set correctly
          let authHeaderCorrect = false;

          // Mock successful response
          mock.onGet(endpoint).reply((config) => {
            // Verify Authorization header is present
            authHeaderCorrect = config.headers?.Authorization === `Bearer ${token}`;
            return [200, { id: '123', data: 'success' }];
          });

          // Execute: Make API request
          const response = await api.get(endpoint);

          // Verify: Authorization header was correct
          expect(authHeaderCorrect).toBe(true);

          // Verify: Response is successful
          expect(response.status).toBe(200);
          expect(response.data).toBeDefined();
        }
      ),
      { numRuns: 3 }
    );
  });
});
