import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Topbar = ({ breadcrumb }: { breadcrumb?: string }) => {
  const user = useAuthStore(s => s.user);

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 border-b border-gray-200/80 bg-white">
      <div className="text-sm text-muted-foreground font-medium">{breadcrumb || 'Overview'}</div>

      <div className="hidden sm:flex items-center relative">
        <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
        <input
          placeholder="Search projects, sites..."
          className="w-64 h-8 pl-8 pr-3 rounded-md text-sm bg-gray-50 border-0 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-[11px] font-semibold">
          {user?.name
            ?.split(' ')
            .map(n => n[0])
            .join('') || 'RG'}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
