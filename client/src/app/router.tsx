import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Guards
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute, PublicRoute, RoleRoute } from '../components/layout/RouteGuards';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ComplaintsExplorerPage } from '../pages/public/ComplaintsExplorerPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Citizen Pages
import { CitizenDashboardPage } from '../pages/citizen/CitizenDashboardPage';
import { MyComplaintsPage } from '../pages/citizen/MyComplaintsPage';
import { ReportComplaintPage } from '../pages/citizen/ReportComplaintPage';
import { ComplaintDetailsPage } from '../pages/citizen/ComplaintDetailsPage';
import { ProfilePage } from '../pages/citizen/ProfilePage';
import { NotificationsPage } from '../pages/citizen/NotificationsPage';

// Officer Pages
import { OfficerDashboardPage } from '../pages/officer/OfficerDashboardPage';
import { OfficerComplaintsPage } from '../pages/officer/OfficerComplaintsPage';
import { OfficerProfilePage } from '../pages/officer/OfficerProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminComplaintsPage } from '../pages/admin/AdminComplaintsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminDepartmentsPage } from '../pages/admin/AdminDepartmentsPage';

export const router = createBrowserRouter([
  // Public and General Routes
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/complaints', element: <ComplaintsExplorerPage /> },
      { path: '/complaints/:id', element: <ComplaintDetailsPage /> },
      {
        path: '/login',
        element: (
          <PublicRoute restricted>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute restricted>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: '/complaints/new',
        element: (
          <ProtectedRoute>
            <ReportComplaintPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Citizen Dashboard Routes
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <CitizenDashboardPage /> },
      { path: '/complaints/my', element: <MyComplaintsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/notifications', element: <NotificationsPage /> },
    ],
  },

  // Officer Workspace Routes
  {
    element: (
      <RoleRoute allowedRoles={['OFFICER']}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      { path: '/officer/dashboard', element: <OfficerDashboardPage /> },
      { path: '/officer/complaints', element: <OfficerComplaintsPage /> },
      { path: '/officer/profile', element: <OfficerProfilePage /> },
    ],
  },

  // Admin Portal Routes
  {
    element: (
      <RoleRoute allowedRoles={['ADMIN']}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      { path: '/admin/dashboard', element: <AdminDashboardPage /> },
      { path: '/admin/complaints', element: <AdminComplaintsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/categories', element: <AdminCategoriesPage /> },
      { path: '/admin/departments', element: <AdminDepartmentsPage /> },
      { path: '/admin/profile', element: <ProfilePage /> },
    ],
  },

  // Catch-all Redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
