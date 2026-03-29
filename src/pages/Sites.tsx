import { useMemo, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Leaf, Bug, Layers } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProjects, useSites } from '@/hooks/useApi';

const typeIcons: Record<string, ComponentType<{ className?: string }>> = {
  Carbon: Leaf,
  Biodiversity: Bug,
  Mixed: Layers,
};

const Sites = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Carbon' | 'Biodiversity' | 'Mixed'>('All');

  const { data: rawSites = [], isLoading } = useSites();
  const { data: projects = [] } = useProjects();

  const sites = useMemo(() => {
    return rawSites.map(s => {
      const proj = projects.find(p => p.id === s.project_id);
      return { ...s, projectName: proj?.name || 'Unknown' };
    });
  }, [rawSites, projects]);

  const filtered = useMemo(() => {
    return sites.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !String(s.name || '')
            .toLowerCase()
            .includes(q) &&
          !String(s.projectName || '')
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      if (typeFilter !== 'All' && s.type !== typeFilter) return false;
      return true;
    });
  }, [sites, search, typeFilter]);

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading sites...</div>;

  return (
    <DashboardLayout breadcrumb="Sites">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Sites</h1>
          <span className="text-xs text-muted-foreground">{filtered.length} shown</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 w-52 rounded-md text-sm bg-gray-50 border-0 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['All', 'Carbon', 'Biodiversity', 'Mixed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              typeFilter === t
                ? 'bg-gray-100 text-foreground'
                : 'text-gray-400 hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(s => {
          const I = typeIcons[s.type] || MapPin;
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/sites/${s.id}`)}
              className="w-full text-left p-4 rounded-lg bg-white hover:shadow-md transition-shadow"
              style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <I className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.projectName}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={s.type} />
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {(s.area || 0).toLocaleString()} ha
                  </div>
                  <div className="text-sm font-semibold text-primary mt-1">
                    {s.carbon_score ?? 0} tCO2
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Sites;
