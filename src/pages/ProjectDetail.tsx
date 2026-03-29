import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Plus,
  Leaf,
  Bug,
  Layers,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as CTooltip,
  RadialLinearScale,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { carbonMonthlyData, months } from '@/data/mockProjects';
import { useProjects, useSites } from '@/hooks/useApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  CTooltip,
  RadialLinearScale,
);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { data: allSites = [] } = useSites();

  const project = projects.find(p => String(p.id) === id);
  const sites = allSites.filter(s => String(s.project_id) === id);

  if (!project)
    return <div className="p-8 text-center text-muted-foreground">Loading project...</div>;

  const lineData = {
    labels: months,
    datasets: [
      {
        data: carbonMonthlyData,
        borderColor: 'hsl(160 84% 28%)',
        backgroundColor: 'rgba(5,150,105,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const radarData = {
    labels: ['Flora', 'Fauna', 'Soil', 'Water', 'Air', 'Carbon'],
    datasets: [
      {
        data: [78, 65, 82, 70, 74, 88],
        borderColor: 'hsl(160 84% 28%)',
        backgroundColor: 'rgba(5,150,105,0.08)',
        borderWidth: 1.5,
        pointRadius: 3,
        pointBackgroundColor: 'hsl(160 84% 28%)',
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  const radarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        grid: { color: '#f3f4f6' },
        angleLines: { color: '#f3f4f6' },
        pointLabels: { color: '#9ca3af', font: { size: 11 } },
        ticks: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  const TypeIcon = { Carbon: Leaf, Biodiversity: Bug, Mixed: Layers }[project.type] || Leaf;

  return (
    <DashboardLayout breadcrumb={`Projects / ${project.name}`}>
      {/* Header */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Projects
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold heading-tight text-foreground">{project.name}</h1>
            <StatusBadge status={project.type} />
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mb-3">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: MapPin, text: project.country },
              {
                icon: Calendar,
                text: `Started ${new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
              },
              { icon: User, text: project.owner },
              ...(project.verified ? [{ icon: CheckCircle, text: 'Verified' }] : []),
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground bg-gray-50"
              >
                <Icon className="w-3 h-3" />
                {text}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="h-8 px-3 rounded-md text-sm text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Edit Project
          </button>
          <button className="h-8 px-3 rounded-md bg-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Site
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<MapPin className="w-4 h-4" />}
          label="Sites"
          value={sites.length.toString()}
          delay={0}
        />
        <StatCard
          icon={<Leaf className="w-4 h-4" />}
          label="Carbon"
          value={`${sites.reduce((s, st) => s + (st.carbon_score || 0), 0).toLocaleString()} tCO2`}
          delay={80}
        />
        <StatCard
          icon={<Bug className="w-4 h-4" />}
          label="Biodiversity"
          value={(sites.length
            ? sites.reduce((s, st) => s + (st.biodiversity_score || 0), 0) / sites.length
            : 0
          ).toFixed(1)}
          delay={160}
        />
        <StatCard
          icon={<TypeIcon className="w-4 h-4" />}
          label="Area"
          value={`${sites.reduce((s, st) => s + (st.area || 0), 0).toLocaleString()} ha`}
          delay={240}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Carbon Trend — 12 Months</h3>
          <div className="h-[220px]">
            <Line data={lineData} options={chartOpts} />
          </div>
        </div>
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Biodiversity Radar</h3>
          <div className="h-[220px]">
            <Radar data={radarData} options={radarOpts} />
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="rounded-lg bg-white overflow-hidden" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-foreground">Sites</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  'Site Name',
                  'Area (ha)',
                  'Carbon',
                  'Biodiversity',
                  'NDVI',
                  'Status',
                  'Last Updated',
                ].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sites.map(s => (
                <tr
                  key={s.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/sites/${s.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 text-foreground tabular-nums">{s.area.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-foreground tabular-nums">{s.carbon_score}</td>
                  <td className="px-4 py-2.5 text-foreground tabular-nums">{s.biodiversity_score}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">-</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
