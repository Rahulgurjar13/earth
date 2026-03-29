import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip as CTooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { Leaf, MapPin, BarChart3, FolderOpen, Trophy, TrendingUp } from 'lucide-react';
import { carbonMonthlyData, biodiversityMonthlyData, months } from '@/data/mockProjects';
import { useProjects, useSites } from '@/hooks/useApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  CTooltip,
  Legend,
);

const Analytics = () => {
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(0 0% 100%)',
        titleColor: 'hsl(222.2 84% 4.9%)',
        bodyColor: 'hsl(215.4 16.3% 46.9%)',
        borderColor: 'hsl(214.3 31.8% 91.4%)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: 'hsl(215.4 16.3% 46.9%)', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: 'hsl(215.4 16.3% 46.9%)', font: { size: 11 } },
      },
    },
  };

  const comboData: any = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          type: 'line' as const,
          data: carbonMonthlyData,
          borderColor: 'hsl(153 60% 38%)',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          data: biodiversityMonthlyData,
          backgroundColor: 'rgba(96,165,250,0.5)',
          borderRadius: 4,
          barPercentage: 0.5,
          yAxisID: 'y1',
        },
      ],
    }),
    [],
  );

  const comboOpts: any = {
    ...chartOpts,
    scales: {
      ...chartOpts.scales,
      y: { ...chartOpts.scales.y, position: 'left' },
      y1: { ...chartOpts.scales.y, position: 'right', grid: { drawOnChartArea: false } },
    },
  };

  const donutData = {
    labels: ['Carbon', 'Biodiversity', 'Mixed'],
    datasets: [
      {
        data: [58, 27, 15],
        backgroundColor: ['hsl(153 60% 38%)', 'hsl(217 92% 54%)', '#a78bfa'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const donutOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8a9e87',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
    },
  };

  const { data: projects = [] } = useProjects();
  const { data: rawSites = [] } = useSites();

  const sites = rawSites.map(s => {
    const proj = projects.find(p => p.id === s.project_id);
    return { ...s, projectName: proj ? proj.name : 'Unknown' };
  });

  const topSites = [...sites]
    .sort((a, b) => (b.carbon_score || 0) - (a.carbon_score || 0))
    .slice(0, 5);
  const trophies = ['🥇', '🥈', '🥉', '4', '5'];

  // Heatmap data
  const heatmapValues = projects.map(p => months.map((_, i) => Math.round(Math.random() * 100)));

  const totalCarbon = sites.reduce((s, st) => s + (st.carbon_score || 0), 0);
  const avgBio = sites.length
    ? Math.round(sites.reduce((s, st) => s + (st.biodiversity_score || 0), 0) / sites.length)
    : 0;

  return (
    <DashboardLayout breadcrumb="Analytics">
      <h1 className="text-xl font-bold heading-tight text-foreground mb-5">Analytics Overview</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={<Leaf className="w-4 h-4" />}
          label="Total Carbon"
          value={`${(totalCarbon / 1000).toFixed(1)}k tCO2`}
          delay={0}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Avg Biodiversity"
          value={avgBio.toString()}
          delay={60}
        />
        <StatCard
          icon={<MapPin className="w-4 h-4" />}
          label="Total Sites"
          value={sites.length.toString()}
          delay={120}
        />
        <StatCard
          icon={<FolderOpen className="w-4 h-4" />}
          label="Active Projects"
          value={projects.filter(p => p.status === 'Active').length.toString()}
          delay={180}
        />
        <StatCard
          icon={<Trophy className="w-4 h-4" />}
          label="Best Site"
          value={topSites[0]?.name || '-'}
          delay={240}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Monthly Growth"
          value="+8.2%"
          trend={{ value: '+8.2%', positive: true }}
          delay={300}
        />
      </div>

      {/* Combo chart */}
      <div className="rounded-lg bg-white p-5 mb-6" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Portfolio Performance — Carbon (line) & Biodiversity (bars)
        </h3>
        <div className="h-[280px]">
          <Bar data={comboData} options={comboOpts} />
        </div>
      </div>

      {/* Donut + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Carbon by Project Type</h3>
          <div className="h-[260px]">
            <Doughnut data={donutData} options={donutOpts} />
          </div>
        </div>
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Sites Leaderboard</h3>
          <div className="space-y-3">
            {topSites.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border"
              >
                <span className="text-lg w-8 text-center">{trophies[i]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.projectName}</div>
                </div>
                <span className="text-sm font-bold text-stat text-primary">{s.carbon_score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-lg bg-white p-5 overflow-x-auto" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Carbon Activity Heatmap — Project × Month
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-label text-muted-foreground font-medium min-w-[160px]">
                Project
              </th>
              {months.map(m => (
                <th
                  key={m}
                  className="px-2 py-2 text-label text-muted-foreground font-medium text-center"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, pi) => (
              <tr key={p.id}>
                <td className="px-3 py-2 text-sm font-medium text-foreground">{p.name}</td>
                {heatmapValues[pi].map((v, mi) => (
                  <td key={mi} className="px-1 py-1">
                    <div
                      className="w-full h-8 rounded-md flex items-center justify-center text-[10px] font-medium"
                      style={{
                        background: `rgba(16,185,129,${(v / 100) * 0.6 + 0.04})`,
                        color: v > 50 ? '#ffffff' : 'hsl(215.4 16.3% 46.9%)',
                      }}
                    >
                      {v}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
