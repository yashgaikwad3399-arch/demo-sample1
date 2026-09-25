import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { DatabasePage } from '../pages/DatabasePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthVerificationPage } from '../pages/AuthVerificationPage';
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { ExamInstructionsPage } from '../pages/ExamInstructionsPage';
import { LiveExamPage } from '../pages/LiveExamPage';
import { ExamResultPage } from '../pages/ExamResultPage';
import { ExamHistoryPage } from '../pages/ExamHistoryPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AboutPage } from '../pages/AboutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth-verify" element={<AuthVerificationPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/instructions/:code"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamInstructionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/live/:code"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <LiveExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/result/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/history"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
