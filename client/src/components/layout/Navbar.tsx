import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Menu,
  X,
  LayoutDashboard,
  CheckCheck,
  Search,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationItem } from '../../types';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      }
    } catch {
      // Background fetch non-fatal
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setNotifDropdownOpen(false);
    if (notif.complaint?._id) {
      navigate(`/complaints/${notif.complaint._id}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'OFFICER') return '/officer/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. Official Government Top Information Bar */}
      <div className="bg-[#0F2537] text-slate-200 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C59B27] inline-block animate-pulse" />
            <span className="font-semibold tracking-wider uppercase text-[11px] text-slate-200">
              Civic Grievance Redressal Portal
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-[11px] text-slate-400 font-normal">
              Public Citizen Redressal & Transparency System
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="#main-content"
              className="hidden sm:inline-block text-slate-300 hover:text-white transition-colors"
            >
              Skip to content
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <Link
              to="/about"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-[#C59B27]" />
              Help & Citizen Charter
            </Link>
            <span className="text-slate-600">|</span>
            {/* Theme Toggle in Top Bar */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-[#C59B27] transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3 text-[#C59B27]" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-slate-300" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Gold Accent Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-[#C59B27] via-[#EAB308] to-[#C59B27] w-full" />

      {/* 2. Main Navigation Bar */}
      <div className="bg-white dark:bg-[#131E2D] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#0F2537] border border-[#C59B27] flex items-center justify-center text-[#C59B27] shadow-sm group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
                  Complaint<span className="text-[#1B365D] dark:text-blue-400">Hub</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#C59B27]/40 bg-amber-50 dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300">
                  CIVIC PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                Municipal Grievance Redressal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/'
                  ? 'text-[#1B365D] dark:text-blue-400 border-b-2 border-[#1B365D] dark:border-blue-400 pb-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1B365D] dark:hover:text-blue-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/complaints"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/complaints'
                  ? 'text-[#1B365D] dark:text-blue-400 border-b-2 border-[#1B365D] dark:border-blue-400 pb-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1B365D] dark:hover:text-blue-400'
              }`}
            >
              Explore Issues
            </Link>
            <Link
              to="/about"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === '/about'
                  ? 'text-[#1B365D] dark:text-blue-400 border-b-2 border-[#1B365D] dark:border-blue-400 pb-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1B365D] dark:hover:text-blue-400'
              }`}
            >
              How It Works
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                  location.pathname.includes('/dashboard')
                    ? 'text-[#1B365D] dark:text-blue-400 border-b-2 border-[#1B365D] dark:border-blue-400 pb-1'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1B365D] dark:hover:text-blue-400'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 relative rounded-lg text-slate-600 hover:text-[#0F2537] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-[#131E2D] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
                            Official Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300">
                              {unreadCount} pending
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#1B365D] hover:text-[#0F2537] dark:text-blue-400 flex items-center gap-1 font-semibold"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                            No notifications on file
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left ${
                                !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#1B365D] mt-1 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1.5 block font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                        <Link
                          to="/notifications"
                          className="text-xs font-semibold text-[#1B365D] hover:text-[#0F2537] dark:text-blue-400"
                          onClick={() => setNotifDropdownOpen(false)}
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prominent Report Issue CTA Button */}
                <Link
                  to="/complaints/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white shadow-xs transition-colors border border-blue-900 dark:border-blue-700"
                >
                  <PlusCircle className="w-4 h-4 text-[#C59B27]" />
                  Report an Issue
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-[#0F2537] text-[#C59B27] font-bold flex items-center justify-center text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white dark:bg-[#131E2D] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden py-1 z-50 text-left">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-[#0F2537] dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                        <div className="mt-2">
                          <Badge role={role || 'CITIZEN'} size="sm" />
                        </div>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Citizen Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Official Account Profile
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#DC2626] hover:bg-red-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-[#1B365D] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white shadow-xs transition-colors border border-blue-900"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131E2D] px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#1B365D] py-1.5"
          >
            Home
          </Link>
          <Link
            to="/complaints"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#1B365D] py-1.5"
          >
            Explore Issues
          </Link>
          <Link
            to="/about"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#1B365D] py-1.5"
          >
            How It Works / Citizen Charter
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#1B365D] py-1.5"
              >
                Dashboard
              </Link>
              <Link
                to="/complaints/new"
                className="block text-sm font-bold text-[#1B365D] dark:text-blue-400 py-1.5"
              >
                + Report New Grievance
              </Link>
              <Link
                to="/profile"
                className="block text-sm font-medium text-slate-600 dark:text-slate-400 py-1.5"
              >
                Profile & Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block text-sm font-medium text-[#DC2626] py-1.5 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex items-center gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-[#1B365D] dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2 text-xs font-bold rounded-lg bg-[#1B365D] text-white"
              >
                Register
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#C59B27]" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#1B365D]" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
