import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const normalized = status.toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  switch (normalized) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'VALID':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses[size]} ${className}`}>
          <CheckCircle2 className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>{normalized}</span>
        </span>
      );

    case 'REVOKED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses[size]} ${className}`}>
          <AlertTriangle className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>REVOKED</span>
        </span>
      );

    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]} ${className}`}>
          <Clock className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>PENDING REVIEW</span>
        </span>
      );

    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 ${sizeClasses[size]} ${className}`}>
          <XCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>REJECTED</span>
        </span>
      );

    case 'SUSPENDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses[size]} ${className}`}>
          <ShieldAlert className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>SUSPENDED</span>
        </span>
      );

    case 'INVALID':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 ${sizeClasses[size]} ${className}`}>
          <XCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>INVALID</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]} ${className}`}>
          <span>{status}</span>
        </span>
      );
  }
};
