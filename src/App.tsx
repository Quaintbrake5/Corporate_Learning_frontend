import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Dashboard from './pages/Dashboard/Dashboard';
import Courses from './pages/Courses/Courses';
import CoursePlayer from './pages/CoursePlayer/CoursePlayer';
import Schedule from './pages/Schedule/Schedule';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Verify from './pages/Verify/Verify';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Admin Components
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import UserManagement from './pages/Admin/Users/UserManagement';
import CourseManagement from './pages/Admin/Courses/CourseManagement';
import EnrollmentManagement from './pages/Admin/Enrollments/EnrollmentManagement';
import DepartmentManagement from './pages/Admin/Departments/DepartmentManagement';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="enrollments" element={<EnrollmentManagement />} />
              <Route path="departments" element={<DepartmentManagement />} />
            </Route>

            {/* Learner/Manager Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          </Routes>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
