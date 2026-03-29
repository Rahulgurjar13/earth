import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

const StatCard = ({ icon, label, value, trend, delay = 0 }: StatCardProps) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`rounded-lg bg-white p-4 transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
      style={{
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {trend && (
          <span
            className={`ml-auto flex items-center gap-0.5 text-[11px] font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {trend.positive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
};

export default StatCard;
