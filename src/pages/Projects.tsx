import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List, Leaf, Bug, Layers, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProjects, useSites } from '@/hooks/useApi';
import api from '@/services/api';
import { type Project } from '@/data/mockProjects';

const typeIcons: Record<string, ComponentType<{ className?: string }>> = {
  Carbon: Leaf,
  Biodiversity: Bug,
  Mixed: Layers,
};

const Projects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'Carbon' as Project['type'],
    country: '',
    carbon: '',
  });

  const { data: projects = [], isLoading, refetch } = useProjects();
  const { data: sites = [] } = useSites();

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'All' && p.type !== typeFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    return true;
  });

  const handleCreateProject = async () => {
    try {
      await api.post('/projects/', newProject);
      setShowModal(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout breadcrumb="Projects">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Projects</h1>
          <span className="text-xs text-muted-foreground">
            {projects.length} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 w-44 rounded-md text-sm bg-gray-50 border-0 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
            />
          </div>
          <div className="flex rounded-md bg-gray-100 p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-white shadow-sm text-foreground' : 'text-gray-400'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-white shadow-sm text-foreground' : 'text-gray-400'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-8 px-3 rounded-md bg-primary text-white font-medium text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['All', 'Carbon', 'Biodiversity', 'Mixed'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? 'bg-gray-100 text-foreground' : 'text-gray-400 hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
        <span className="w-px bg-border mx-1" />
        {['All', 'Active', 'Draft', 'Inactive'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-gray-100 text-foreground' : 'text-gray-400 hover:text-foreground'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        className={
          view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-2'
        }
      >
        {filtered.map(p => {
          const Icon = typeIcons[p.type] || Leaf;
          const projectSites = sites.filter(s => s.project_id === p.id);
          const projectCarbon = projectSites.reduce((s, st) => s + (st.carbon_score || 0), 0);
          return (
            <div
              key={p.id}
              className="rounded-lg bg-white p-4 cursor-pointer group hover:shadow-md transition-shadow"
              style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-muted-foreground">
                  <Icon className="w-4 h-4" />
                </span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{p.name}</h3>
              <div className="text-xs text-muted-foreground mb-3">
                {projectSites.length} sites · {projectCarbon.toLocaleString()} tCO₂
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(p.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[480px] mx-4 rounded-lg p-6 bg-white animate-fade-in"
            style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground">New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Name</label>
                <input
                  value={newProject.name}
                  onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Amazon Reforestation"
                  className="w-full h-9 px-3 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Carbon', 'Biodiversity', 'Mixed'] as const).map(t => {
                    const I = typeIcons[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setNewProject(p => ({ ...p, type: t }))}
                        className={`p-2.5 rounded-md border text-center transition-all ${newProject.type === t ? 'border-primary bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <I
                          className={`w-5 h-5 mx-auto mb-1 ${newProject.type === t ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span
                          className={`text-xs font-medium ${newProject.type === t ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {t}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the project..."
                  className="w-full px-3 py-2 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Country</label>
                  <input
                    value={newProject.country}
                    onChange={e => setNewProject(p => ({ ...p, country: e.target.value }))}
                    placeholder="e.g. Brazil"
                    className="w-full h-9 px-3 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Target Carbon</label>
                  <input
                    type="number"
                    value={newProject.carbon}
                    onChange={e => setNewProject(p => ({ ...p, carbon: e.target.value }))}
                    placeholder="e.g. 10000"
                    className="w-full h-9 px-3 rounded-md text-sm bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="h-9 px-3 rounded-md text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="h-9 px-4 rounded-md bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Create Project →
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Projects;
