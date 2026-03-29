import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Map, FolderOpen, BarChart3, Settings } from 'lucide-react';

const items = [
  { icon: LayoutGrid, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
      style={{
        background: 'hsl(120 25% 4% / 0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex justify-around py-2">
        {items.map(({ icon: Icon, label, path }) => {
          const active = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
