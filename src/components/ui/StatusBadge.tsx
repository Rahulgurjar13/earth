import { type ReactNode } from 'react';

interface StatusBadgeProps {
  status: string;
  children?: ReactNode;
}

const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Monitoring: 'bg-emerald-50 text-emerald-700',
    Draft: 'bg-amber-50 text-amber-700',
    Pending: 'bg-amber-50 text-amber-700',
    Inactive: 'bg-gray-100 text-gray-500',
    Carbon: 'bg-emerald-50 text-emerald-700',
    Biodiversity: 'bg-blue-50 text-blue-700',
    Mixed: 'bg-violet-50 text-violet-700',
    Conservation: 'bg-emerald-50 text-emerald-700',
    Good: 'bg-emerald-50 text-emerald-700',
    Fair: 'bg-amber-50 text-amber-700',
    Poor: 'bg-red-50 text-red-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${styles[status] || styles.Inactive}`}
    >
      {children || status}
    </span>
  );
};

export default StatusBadge;
