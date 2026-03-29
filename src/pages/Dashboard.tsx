import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Wind, Bug, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as CTooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { carbonMonthlyData, months } from '@/data/mockProjects';
import { useAuthStore } from '@/store/authStore';
import { useProjects, useSites } from '@/hooks/useApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, CTooltip);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: sites = [], isLoading: isSitesLoading } = useSites();

  const chartData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          data: carbonMonthlyData,
          borderColor: 'hsl(160 84% 28%)',
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
            g.addColorStop(0, 'rgba(5,150,105,0.08)');
            g.addColorStop(1, 'rgba(5,150,105,0)');
            return g;
          },
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: 'hsl(160 84% 28%)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 1.5,
        },
      ],
    }),
    [],
  );

  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111',
        bodyColor: '#666',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
      },
    },
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
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const activities = [
    { text: 'New site added to Amazon Reforestation', time: '2h ago' },
    { text: 'Analytics report generated', time: '5h ago' },
    { text: 'Kerala Wetlands score dropped by 3pts', time: '1d ago' },
    { text: 'Borneo Peatland verification complete', time: '2d ago' },
  ];

  return (
    <DashboardLayout breadcrumb="Overview">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Leaf className="w-3.5 h-3.5" />}
          label="Projects"
          value={isProjectsLoading ? '–' : projects.length.toString()}
          trend={{ value: '+3', positive: true }}
          delay={0}
        />
        <StatCard
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Active Sites"
          value={isSitesLoading ? '–' : sites.length.toString()}
          trend={{ value: '+12', positive: true }}
          delay={60}
        />
        <StatCard
          icon={<Wind className="w-3.5 h-3.5" />}
          label="Carbon Captured"
          value={`${sites.reduce((s, st) => s + (st.carbon_score || 0), 0).toLocaleString()} tCO₂`}
          trend={{ value: '+8.2%', positive: true }}
          delay={120}
        />
        <StatCard
          icon={<Bug className="w-3.5 h-3.5" />}
          label="Avg Biodiversity"
          value={
            sites.length
              ? (
                  sites.reduce((s, st) => s + (st.biodiversity_score || 0), 0) / sites.length
                ).toFixed(1)
              : '0.0'
          }
          trend={{ value: '-1.2%', positive: false }}
          delay={180}
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-5 mb-6" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Carbon Captured</h3>
          <span className="text-xs text-muted-foreground">Last 12 months</span>
        </div>
        <div className="h-[220px]">
          <Line data={chartData} options={chartOpts} />
        </div>
      </div>

      {/* Activity + Projects side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-0">
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground leading-tight">{a.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Table */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Projects</h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Type', 'Sites', 'Carbon', 'Status'].map(h => (
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
                {projects.slice(0, 5).map(p => {
                  const projectSites = sites.filter(s => s.project_id === p.id);
                  const projectCarbon = projectSites.reduce(
                    (s, st) => s + (st.carbon_score || 0),
                    0,
                  );
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.type} />
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                        {projectSites.length}
                      </td>
                      <td className="px-4 py-2.5 text-foreground font-medium tabular-nums">
                        {projectCarbon.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
