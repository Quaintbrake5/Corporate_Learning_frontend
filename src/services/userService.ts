// Mock user service
// In a real application, this would make an API call to fetch user data

export interface UserProfile {
  id: string;
  name: string;
  subdivision: string; // e.g., 'CSD', 'CSS', 'CSI', 'CSE', 'CSL'
  role: string;
}

/**
 * Get the current user's profile
 * @returns UserProfile object
 */
export const getUserProfile = (): UserProfile => {
  // For mock data, we're returning a user in the CSD subdivision
  // This can be changed to test other subdivisions
  return {
    id: '1',
    name: 'Alex',
    subdivision: 'CSD',
    role: 'Employee'
  };
};