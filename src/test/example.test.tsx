import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// ---- StatusBadge ----
import StatusBadge from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="Active" />);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('renders children instead of status when provided', () => {
    render(<StatusBadge status="Carbon">Custom Text</StatusBadge>);
    expect(screen.getByText('Custom Text')).toBeTruthy();
  });

  it('applies emerald style for Active status', () => {
    const { container } = render(<StatusBadge status="Active" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-emerald-50');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('applies amber style for Draft status', () => {
    const { container } = render(<StatusBadge status="Draft" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-amber-50');
    expect(badge.className).toContain('text-amber-700');
  });

  it('applies blue style for Biodiversity type', () => {
    const { container } = render(<StatusBadge status="Biodiversity" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-blue-50');
    expect(badge.className).toContain('text-blue-700');
  });

  it('falls back to Inactive style for unknown status', () => {
    const { container } = render(<StatusBadge status="UnknownStatus" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-500');
  });
});

// ---- StatCard ----
import StatCard from '@/components/ui/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard icon={<span>🌿</span>} label="Carbon" value="1,200 tCO2" />);
    expect(screen.getByText('Carbon')).toBeTruthy();
    expect(screen.getByText('1,200 tCO2')).toBeTruthy();
  });

  it('renders trend when provided', () => {
    render(
      <StatCard
        icon={<span>📈</span>}
        label="Growth"
        value="8.2%"
        trend={{ value: '+8.2%', positive: true }}
      />,
    );
    expect(screen.getByText('+8.2%')).toBeTruthy();
  });
});

// ---- Mock data ----
import { mockProjects, carbonMonthlyData, months } from '@/data/mockProjects';
import { mockSites } from '@/data/mockSites';

describe('Mock data integrity', () => {
  it('has 5 mock projects', () => {
    expect(mockProjects.length).toBe(5);
  });

  it('has 15 mock sites', () => {
    expect(mockSites.length).toBe(15);
  });

  it('all sites reference a valid project', () => {
    const projectIds = mockProjects.map(p => p.id);
    mockSites.forEach(s => {
      expect(projectIds).toContain(s.projectId);
    });
  });

  it('has 12 months of carbon data', () => {
    expect(carbonMonthlyData.length).toBe(12);
    expect(months.length).toBe(12);
  });

  it('all projects have required fields', () => {
    mockProjects.forEach(p => {
      expect(p.name).toBeTruthy();
      expect(['Carbon', 'Biodiversity', 'Mixed']).toContain(p.type);
      expect(['Active', 'Draft', 'Inactive']).toContain(p.status);
    });
  });
});
