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
  Landmark,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Badge } from '../ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Citizen Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Lodged Grievances', path: '/complaints/my', icon: FileText },
    { name: 'Lodge New Grievance', path: '/complaints/new', icon: PlusCircle },
    { name: 'Official Notifications', path: '/notifications', icon: Bell },
    { name: 'Citizen Profile', path: '/profile', icon: User },
  ];

  const officerNav = [
    { name: 'Officer Overview', path: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Grievances', path: '/officer/complaints', icon: FileText },
    { name: 'Officer Profile', path: '/officer/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Analytics & KPIs', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Grievances', path: '/admin/complaints', icon: FileText },
    { name: 'Citizen & Officer Registry', path: '/admin/users', icon: Users },
    { name: 'Grievance Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Municipal Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const currentNav =
    role === 'ADMIN' ? adminNav : role === 'OFFICER' ? officerNav : citizenNav;

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F6] dark:bg-[#0B111E] text-[#1E293B] dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Government Administrative Sidebar */}
          <aside className="w-full lg:w-64 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs shrink-0">
            {/* User Official Identity Capsule */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="w-11 h-11 rounded-lg bg-[#0F2537] border border-[#C59B27] text-[#C59B27] font-bold flex items-center justify-center text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs truncate text-[#0F2537] dark:text-white uppercase tracking-tight">
                  {user?.name}
                </h4>
                <div className="mt-1">
                  <Badge role={role || 'CITIZEN'} size="sm" />
                </div>
              </div>
            </div>

            {/* Navigation Section Label */}
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1B365D] text-white shadow-xs border-l-4 border-[#C59B27]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#0F2537] dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Portal Help Box */}
            <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-[#0F2537] dark:text-slate-200 mb-1">
                <Landmark className="w-3.5 h-3.5 text-[#C59B27]" />
                Public Service Desk
              </div>
              <p className="leading-snug">
                Track status, upload resolution proofs, or escalate overdue issues according to SLA.
              </p>
            </div>

            {/* Logout Action */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};
