import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ('STUDENT' | 'ADMIN')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div id="auth-loading-state" className="flex flex-col items-center justify-center min-h-[400px] py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying security credentials...</p>
      </div>
    );
  }

  // 1. Unauthenticated users cannot access protected routes -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based authorization: check if user possesses permitted role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div id="forbidden-error-container" className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">403 Forbidden - Access Denied</h2>
            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Role-Based Access Control</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Your account role (<strong className="text-slate-900 font-semibold">{user.role}</strong>) does not have sufficient clearance to access this module.
          This route is restricted strictly to: <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">{allowedRoles.join(', ')}</code>.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 mb-6 space-y-1">
          <div><span className="font-semibold text-slate-700">Authenticated User:</span> {user.name} ({user.email})</div>
          <div><span className="font-semibold text-slate-700">Active Role:</span> <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{user.role}</span></div>
          {user.roll_number && (
            <div><span className="font-semibold text-slate-700">Roll Number:</span> {user.roll_number}</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            id="forbidden-redirect-btn"
            to={user.role === 'ADMIN' ? '/admin' : '/student'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Student Portal'}</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
