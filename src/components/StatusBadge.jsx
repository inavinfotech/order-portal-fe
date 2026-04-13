import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusConfig = {
  created: {
    label: 'Created',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200'
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.created;

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all duration-200 uppercase tracking-tighter",
      config.bg,
      config.text,
      config.border
    )}>
      {config.label}
    </div>
  );
};

export default StatusBadge;
