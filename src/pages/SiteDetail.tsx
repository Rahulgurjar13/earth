import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Ruler,
  Calendar,
  FileDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip as CTooltip,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useSites, useSiteAnalytics, useProjects } from '@/hooks/useApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  CTooltip,
);

const SiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawSites = [], isLoading: sitesLoading } = useSites();
  const { data: projects = [] } = useProjects();
  const { data: analytics, isLoading: analyticsLoading } = useSiteAnalytics(id as string);

  const rawSite = rawSites.find(s => String(s.id) === id);
  const project = projects.find(p => p.id === rawSite?.project_id);
  const site = rawSite ? { ...rawSite, projectName: project?.name || 'Unknown' } : null;

  const d = analytics || {
    months: ['Jan', 'Feb', 'Mar'],
    carbon: [0, 0, 0],
    biodiversity: [0, 0, 0],
    ndvi: [0, 0, 0],
    rainfall: [0, 0, 0],
    temperature: [0, 0, 0],
    quality: ['Pending', 'Pending', 'Pending'],
  };

  if (sitesLoading || analyticsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading site...</div>;
  }

  if (!site) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Site not found.
        <div className="mt-4">
          <button
            onClick={() => navigate('/sites')}
            className="h-9 px-4 rounded-lg text-sm font-medium text-foreground border hover:bg-muted/10 transition-colors"
          >
            Back to Sites
          </button>
        </div>
      </div>
    );
  }

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

  const carbonChart = {
    labels: d.months,
    datasets: [
      {
        data: d.carbon,
        borderColor: 'hsl(153 60% 38%)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const bioChart = {
    labels: d.months,
    datasets: [
      {
        data: d.biodiversity,
        backgroundColor: 'hsl(153 60% 38%)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const ndviChart = {
    labels: d.months,
    datasets: [
      {
        data: d.ndvi,
        borderColor: 'hsl(217 92% 68%)',
        backgroundColor: 'rgba(96,165,250,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const rainfallChart = {
    labels: d.months,
    datasets: [
      {
        label: 'Rainfall',
        data: d.rainfall,
        backgroundColor: 'rgba(96,165,250,0.5)',
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  return (
    <DashboardLayout breadcrumb={`Projects > ${site.projectName} > ${site.name}`}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold heading-tight text-foreground">{site.name}</h1>
            <StatusBadge status={site.type} />
            <StatusBadge status={site.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground bg-muted/30 border"
            >
              <MapPin className="w-3 h-3" />
              {site.region}, {site.country}
            </span>
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground bg-muted/30 border"
            >
              <Ruler className="w-3 h-3" />
              {(site.area || 0).toLocaleString()} ha
            </span>
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground bg-muted/30 border"
            >
              <Calendar className="w-3 h-3" />
              Added -
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="h-9 px-4 rounded-lg text-sm font-medium text-foreground border hover:bg-muted/10 transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
          <button
            className="h-9 px-4 rounded-lg text-sm font-medium text-foreground border hover:bg-muted/10 transition-colors"
          >
            Edit Site
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Carbon Score"
          value={`${site.carbon_score} tCO2`}
          trend={{ value: '+4.2%', positive: true }}
          delay={0}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Biodiversity Index"
          value={`${site.biodiversity_score} / 100`}
          trend={{ value: '+1.1%', positive: true }}
          delay={80}
        />
        <StatCard
          icon={<TrendingDown className="w-4 h-4" />}
          label="NDVI Average"
          value={(site.ndvi || 0).toFixed(2)}
          trend={{ value: '-0.02', positive: false }}
          delay={160}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Carbon Captured — Monthly</h3>
          <div className="h-[220px]">
            <Line data={carbonChart} options={chartOpts} />
          </div>
        </div>
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Biodiversity Score — Monthly
          </h3>
          <div className="h-[220px]">
            <Bar data={bioChart} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">NDVI Over Time</h3>
          <div className="h-[220px]">
            <Line data={ndviChart} options={chartOpts} />
          </div>
        </div>
        <div className="rounded-lg bg-white p-5" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Rainfall Distribution</h3>
          <div className="h-[220px]">
            <Bar data={rainfallChart} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg bg-white overflow-hidden" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 3px 0 rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 flex items-center justify-between border-b">
          <h3 className="text-sm font-semibold text-foreground">Monthly Analytics Records</h3>
          <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            <FileDown className="w-3 h-3" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  'Month',
                  'Carbon (tCO2)',
                  'Biodiversity',
                  'NDVI',
                  'Rainfall (mm)',
                  'Temp (°C)',
                  'Quality',
                ].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-label text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.months.map((m, i) => (
                <tr
                  key={m}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground">{m}</td>
                  <td className="px-5 py-3 text-stat text-foreground">{d.carbon[i]}</td>
                  <td className="px-5 py-3 text-stat text-foreground">{d.biodiversity[i]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.ndvi[i]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.rainfall[i]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.temperature[i]}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={d.quality[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteDetail;
