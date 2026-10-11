import React from 'react';
import { ComplaintStatus, PriorityLevel, UserRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'neutral' | 'success' | 'warning' | 'danger';
  status?: ComplaintStatus;
  priority?: PriorityLevel;
  role?: UserRole;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  priority,
  role,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
  };

  let colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let displayText = children;

  if (status) {
    switch (status) {
      case 'SUBMITTED':
        colorStyles = 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
        displayText = 'Submitted';
        break;
      case 'UNDER_REVIEW':
        colorStyles = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
        displayText = 'Under Review';
        break;
      case 'ASSIGNED':
        colorStyles = 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
        displayText = 'Assigned';
        break;
      case 'IN_PROGRESS':
        colorStyles = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
        displayText = 'In Progress';
        break;
      case 'RESOLVED':
        colorStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
        displayText = 'Resolved';
        break;
      case 'CLOSED':
        colorStyles = 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        displayText = 'Closed';
        break;
      case 'REJECTED':
        colorStyles = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
        displayText = 'Rejected';
        break;
      case 'DUPLICATE':
        colorStyles = 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
        displayText = 'Duplicate';
        break;
      case 'CANCELLED':
        colorStyles = 'bg-zinc-100 text-zinc-600 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400';
        displayText = 'Cancelled';
        break;
    }
  } else if (priority) {
    switch (priority) {
      case 'LOW':
        colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        displayText = 'Low Priority';
        break;
      case 'MEDIUM':
        colorStyles = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
        displayText = 'Medium Priority';
        break;
      case 'HIGH':
        colorStyles = 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300';
        displayText = 'High Priority';
        break;
      case 'CRITICAL':
        colorStyles = 'bg-rose-50 text-rose-700 border border-rose-300 font-bold dark:bg-rose-950/60 dark:text-rose-300';
        displayText = 'Critical Priority';
        break;
    }
  } else if (role) {
    switch (role) {
      case 'ADMIN':
        colorStyles = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
        displayText = 'Admin';
        break;
      case 'OFFICER':
        colorStyles = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        displayText = 'Officer';
        break;
      case 'CITIZEN':
        colorStyles = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        displayText = 'Citizen';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        colorStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        break;
      case 'warning':
        colorStyles = 'bg-amber-50 text-amber-700 border border-amber-200';
        break;
      case 'danger':
        colorStyles = 'bg-rose-50 text-rose-700 border border-rose-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeStyles[size]} ${colorStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {displayText}
    </span>
  );
};
