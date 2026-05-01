# Corporate Learning Platform (CLP)

> A modern, enterprise-grade e-learning platform built for NLNG HR Management, enabling seamless course management, employee training, and learning analytics.

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.0-646CFF.svg)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11.2-764ABC.svg)](https://redux-toolkit.js.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [User Roles & Permissions](#user-roles--permissions)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Routing](#routing)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Corporate Learning Platform (CLP) is a comprehensive frontend application designed to facilitate employee training and development within organizations. Built with modern web technologies, it provides distinct interfaces for learners, managers, and administrators to manage courses, track progress, and facilitate organizational learning.

### Related Repositories

- **Backend**: [Corporate_Learning_backend](https://github.com/Quaintbrake5/Corporate_Learning_backend/)

### Key Capabilities

- **Multi-role Support**: Distinct interfaces for Learners, Managers, and Administrators
- **Course Management**: Create, organize, and deliver multimedia learning content
- **Progress Tracking**: Real-time monitoring of learner progress and completion rates
- **Department-based Learning**: Department-specific and cross-departmental course assignments
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Secure Authentication**: JWT-based authentication with email verification

---

## ✨ Features

### For Learners

- 📚 **Course Catalog**: Browse and enroll in available courses
- 🎥 **Interactive Course Player**: Video, document, and multimedia content support
- 📊 **Progress Dashboard**: Track learning progress and achievements
- 📅 **Schedule Management**: View upcoming courses and deadlines
- ✅ **Assessments**: Complete quizzes and evaluations

### For Administrators

- 👥 **User Management**: Create, update, and manage user accounts
- 📖 **Course Management**: Full CRUD operations for courses and modules
- 🏢 **Department Management**: Organize users by departments
- 📝 **Enrollment Management**: Assign courses to users and departments
- 📈 **Analytics Dashboard**: Monitor platform usage and learning outcomes

### For Managers

- 👀 **Team Oversight**: Monitor team member progress
- 📊 **Reporting**: Generate reports on team learning activities
- 🎯 **Course Recommendations**: Suggest courses to team members

---

## 🛠 Tech Stack

### Core Technologies

- **React 19.2.4** - UI library with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 8.0.0** - Lightning-fast build tool
- **Redux Toolkit 2.11.2** - State management
- **React Router DOM 7.13.1** - Client-side routing

### UI & Styling

- **CSS Modules** - Scoped styling
- **Framer Motion 12.38.0** - Animations
- **Lucide React 0.577.0** - Icon library
- **FontAwesome 7.2.0** - Additional icons
- **Recharts 3.8.1** - Data visualization

### Additional Libraries

- **Axios 1.14.0** - HTTP client
- **React Player 3.4.0** - Video playback
- **Clerk React 6.1.3** - Authentication (optional)

### Development Tools

- **ESLint** - Code linting
- **Babel React Compiler** - Performance optimization
- **TypeScript ESLint** - TypeScript-specific linting

---

## 📁 Project Structure

```
clp/
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   └── NLNG logo.jpg
├── src/
│   ├── assets/               # Images and media
│   ├── components/           # Reusable components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components (Cards, Modals, etc.)
│   ├── pages/                # Page components
│   │   ├── Admin/            # Admin panel pages
│   │   │   ├── Courses/
│   │   │   ├── Dashboard/
│   │   │   ├── Departments/
│   │   │   ├── Enrollments/
│   │   │   └── Users/
│   │   ├── CoursePlayer/     # Course viewing interface
│   │   ├── Courses/          # Course catalog
│   │   ├── Dashboard/        # Learner dashboard
│   │   ├── Login/            # Authentication
│   │   ├── Register/         # User registration
│   │   ├── Schedule/         # Calendar view
│   │   └── Verify/           # Email verification
│   ├── routes/               # Route configurations
│   ├── services/             # API service layer
│   │   ├── api.ts            # Axios instance & interceptors
│   │   ├── authService.ts    # Authentication APIs
│   │   ├── courseService.ts  # Course APIs
│   │   ├── adminService.ts   # Admin APIs
│   │   ├── enrollmentService.ts
│   │   ├── progressService.ts
│   │   └── userService.ts
│   ├── store/                # Redux store
│   │   ├── store.ts          # Store configuration
│   │   └── authSlice.ts      # Auth state slice
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── eslint.config.js          # ESLint configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- Backend API running (default: `http://localhost:8001`)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd clp
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8001/api/v1

# Clerk Authentication (Optional)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | No |

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production Build
npm run build        # Build for production (TypeScript check + Vite build)

# Code Quality
npm run lint         # Run ESLint to check code quality

# Preview
npm run preview      # Preview production build locally
```

---

## 👤 User Roles & Permissions

### Learner

- View assigned courses
- Enroll in available courses
- Track personal progress
- Complete assessments
- View schedule and deadlines

### Manager

- All Learner permissions
- View team member progress
- Generate team reports
- Recommend courses to team

### Administrator

- Full system access
- User management (CRUD)
- Course management (CRUD)
- Department management
- Enrollment management
- System analytics and reporting

---

## 🔌 API Integration

### Base Configuration

The application uses Axios for HTTP requests with automatic JWT token injection:

```typescript
// Base URL: http://localhost:8001/api/v1
// Authentication: Bearer token in Authorization header
```

### API Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify` - Email verification

#### Courses

- `GET /courses` - List courses (paginated)
- `GET /courses/:id` - Get course details
- `GET /courses/:id/modules` - Get course modules

#### Admin

- `GET /admin/users` - List users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Interceptors

**Request Interceptor**: Automatically attaches JWT token to all requests
**Response Interceptor**: Handles 401 errors and redirects to login

---

## 🗄 State Management

### Redux Store Structure

```typescript
{
  auth: {
    token: string | null,
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean
  }
}
```

### Auth Slice Actions

- `setCredentials` - Store user credentials after login
- `setLoading` - Update loading state
- `logout` - Clear user session
- `updateUser` - Update user profile

### Usage Example

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';

const user = useSelector((state: RootState) => state.auth.user);
const dispatch = useDispatch();

const handleLogout = () => {
  dispatch(logout());
};
```

---

## 🛣 Routing

### Public Routes

- `/login` - User login
- `/register` - User registration
- `/verify` - Email verification

### Protected Routes (Learner/Manager)

- `/` - Dashboard
- `/courses` - Course catalog
- `/course/:courseId` - Course player
- `/schedule` - Schedule calendar

### Admin Routes (Admin only)

- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/courses` - Course management
- `/admin/enrollments` - Enrollment management
- `/admin/departments` - Department management

### Route Protection

```typescript
// Learner/Manager protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Admin protection
<AdminProtectedRoute>
  <AdminLayout />
</AdminProtectedRoute>
```

---

## 💻 Development Guidelines

### Code Style

- Use **TypeScript** for all new files
- Follow **functional components** with hooks
- Use **CSS Modules** for component styling
- Implement **error boundaries** for error handling
- Write **type-safe** code with proper interfaces

### Component Structure

```typescript
// ComponentName.tsx
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  title: string;
  onAction: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction }) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default ComponentName;
```

### Service Layer Pattern

```typescript
// services/exampleService.ts
import api from './api';

export interface ExampleData {
  id: string;
  name: string;
}

export const getExamples = async (): Promise<ExampleData[]> => {
  const response = await api.get<ExampleData[]>('/examples');
  return response.data;
};
```

### Best Practices

1. **Separation of Concerns**: Keep business logic in services, UI logic in components
2. **Type Safety**: Define interfaces for all data structures
3. **Error Handling**: Use try-catch blocks and display user-friendly error messages
4. **Loading States**: Show loading indicators during async operations
5. **Accessibility**: Use semantic HTML and ARIA attributes
6. **Performance**: Lazy load routes and components where appropriate

---

## 🤝 Contributing

### Workflow

1. Create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. Push to the branch

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is proprietary software developed for NLNG HR Management.

---

## 📞 Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ for NLNG HR Management**
