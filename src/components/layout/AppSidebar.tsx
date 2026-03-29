import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Map,
  FolderOpen,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { icon: LayoutGrid, label: 'Overview', path: '/dashboard' },
  { icon: Map, label: 'Map View', path: '/map' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Globe, label: 'Sites', path: '/sites' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-white border-r border-gray-200/80 transition-all duration-200 hidden md:flex ${
        collapsed ? 'w-[60px]' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3.5">
        <Logo collapsed={collapsed} />
      </div>

      {/* User */}
      {!collapsed && (
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-[11px] font-semibold">
              {user?.name
                ?.split(' ')
                .map(n => n[0])
                .join('') || 'RG'}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-foreground truncate">
                {user?.name || 'Rahul Gurjar'}
              </div>
              <div className="text-[11px] text-muted-foreground">Member</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-1 px-2 space-y-px overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-2.5 text-[13px] font-medium transition-colors duration-100 relative ${
                collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-[7px]'
              } rounded-md ${
                active
                  ? 'text-primary bg-emerald-50'
                  : 'text-gray-500 hover:text-foreground hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Carbon Budget */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-md bg-gray-50">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            Monthly Quota
          </div>
          <div className="w-full h-1 rounded-full bg-gray-200 mb-1.5">
            <div className="h-full rounded-full bg-primary" style={{ width: '67%' }} />
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-foreground font-medium">4,821</span>
            <span className="text-gray-400"> / 7,200 tCO2</span>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="border-t border-gray-100 px-2 py-2 space-y-px">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={`w-full flex items-center gap-2.5 rounded-md text-[13px] font-medium text-gray-400 hover:text-red-500 transition-colors ${
            collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-[7px]'
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2.5 rounded-md text-[13px] text-gray-400 hover:text-foreground transition-colors ${
            collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-[7px]'
          }`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
