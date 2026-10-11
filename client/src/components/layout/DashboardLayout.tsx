import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderTree,
  Building2,
  Bell,
  User,
  PlusCircle,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Navbar } from './Navbar';
import { Badge } from '../ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', path: '/complaints/my', icon: FileText },
    { name: 'Report Issue', path: '/complaints/new', icon: PlusCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const officerNav = [
    { name: 'Officer Overview', path: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Complaints', path: '/officer/complaints', icon: FileText },
    { name: 'Officer Profile', path: '/officer/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Analytics & KPIs', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Complaints', path: '/admin/complaints', icon: FileText },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const currentNav =
    role === 'ADMIN' ? adminNav : role === 'OFFICER' ? officerNav : citizenNav;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs shrink-0">
            {/* User Info Capsule */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                  {user?.name}
                </h4>
                <div className="mt-1">
                  <Badge role={role || 'CITIZEN'} size="sm" />
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard' || item.path === '/admin/dashboard' || item.path === '/officer/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
