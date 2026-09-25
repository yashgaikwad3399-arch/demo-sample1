import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Server,
  ShieldCheck,
  BookOpen,
  Info,
  Activity,
  Database,
  KeyRound,
  LogOut,
  User as UserIcon,
  LogIn,
  Calendar,
} from 'lucide-react';
import { getHealthStatus } from '../../services/api';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let isMounted = true;
    async function checkServer() {
      try {
        const res = await getHealthStatus();
        if (isMounted) {
          setServerOnline(res.status === 'online');
        }
      } catch (err) {
        if (isMounted) {
          setServerOnline(false);
        }
      }
    }
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link id="brand-logo" to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block leading-tight">
                SMART EXAM PORTAL
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase block">
                Full-Stack IT Project
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav id="header-nav" className="hidden lg:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/database" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                Database (Step 2)
              </span>
            </NavLink>
            <NavLink to="/auth-verify" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Auth & JWT (Step 3)
              </span>
            </NavLink>
            <NavLink to="/student" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Student Portal
              </span>
            </NavLink>
            {user?.role === 'STUDENT' && (
              <NavLink to="/student/history" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Exam History (Step 7)
                </span>
              </NavLink>
            )}
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Admin Portal
              </span>
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500" />
                Architecture
              </span>
            </NavLink>
          </nav>

          {/* Right Header Auth Controls */}
          <div className="flex items-center gap-3">
            {/* Backend health status badge */}
            <div className="hidden sm:flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              {serverOnline === null ? (
                <StatusBadge status="pending" label="Checking..." />
              ) : serverOnline ? (
                <StatusBadge status="online" label="Online" />
              ) : (
                <StatusBadge status="disconnected" label="Connecting..." />
              )}
            </div>

            {/* Authentication States */}
            {isAuthenticated && user ? (
              <div id="user-session-widget" className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight flex items-center justify-end gap-1.5">
                    <span>{user.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        user.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user.roll_number || user.email}
                  </span>
                </div>

                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  title="Sign out of examination portal"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div id="auth-actions-group" className="flex items-center gap-2">
                <Link
                  id="header-login-btn"
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  id="header-register-btn"
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
