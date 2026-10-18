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
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-tight',
    md: 'px-2.5 py-1 text-xs font-medium tracking-tight',
  };

  let colorStyles = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let displayText = children;

  if (status) {
    switch (status) {
      case 'SUBMITTED':
        colorStyles = 'bg-amber-50 text-[#B45309] border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
        displayText = 'Submitted';
        break;
      case 'UNDER_REVIEW':
        colorStyles = 'bg-sky-50 text-[#0369A1] border border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
        displayText = 'Under Review';
        break;
      case 'ASSIGNED':
        colorStyles = 'bg-indigo-50 text-[#4338CA] border border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
        displayText = 'Assigned';
        break;
      case 'IN_PROGRESS':
        colorStyles = 'bg-blue-50 text-[#1B365D] border border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 font-semibold';
        displayText = 'In Progress';
        break;
      case 'RESOLVED':
        colorStyles = 'bg-emerald-50 text-[#047857] border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-semibold';
        displayText = 'Resolved';
        break;
      case 'CLOSED':
        colorStyles = 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        displayText = 'Closed';
        break;
      case 'REJECTED':
        colorStyles = 'bg-rose-50 text-[#B91C1C] border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
        displayText = 'Rejected';
        break;
      case 'DUPLICATE':
        colorStyles = 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
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
        colorStyles = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';
        displayText = 'Low Priority';
        break;
      case 'MEDIUM':
        colorStyles = 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
        displayText = 'Medium Priority';
        break;
      case 'HIGH':
        colorStyles = 'bg-orange-50 text-orange-800 border border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 font-semibold';
        displayText = 'High Priority';
        break;
      case 'CRITICAL':
        colorStyles = 'bg-rose-50 text-rose-800 border border-rose-300 font-bold dark:bg-rose-950/60 dark:text-rose-300';
        displayText = 'Critical Priority';
        break;
    }
  } else if (role) {
    switch (role) {
      case 'ADMIN':
        colorStyles = 'bg-[#0F2537] text-white border border-[#C59B27] dark:bg-slate-800 dark:text-amber-300 font-semibold';
        displayText = 'Administrator';
        break;
      case 'OFFICER':
        colorStyles = 'bg-[#1B365D] text-white border border-blue-400 dark:bg-blue-950 dark:text-blue-200 font-semibold';
        displayText = 'Civic Officer';
        break;
      case 'CITIZEN':
        colorStyles = 'bg-slate-100 text-[#1B365D] dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium';
        displayText = 'Citizen';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        colorStyles = 'bg-emerald-50 text-[#047857] border border-emerald-300';
        break;
      case 'warning':
        colorStyles = 'bg-amber-50 text-[#B45309] border border-amber-300';
        break;
      case 'danger':
        colorStyles = 'bg-rose-50 text-[#B91C1C] border border-rose-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md select-none ${sizeStyles[size]} ${colorStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayText}
    </span>
  );
};
