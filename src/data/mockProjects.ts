export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'Carbon' | 'Biodiversity' | 'Mixed';
  status: 'Active' | 'Draft' | 'Inactive';
  country: string;
  sites: number;
  carbon: number;
  biodiversity: number;
  area: number;
  owner: string;
  verificationProgress: number;
  startDate: string;
  lastUpdated: string;
  verified: boolean;
}

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Amazon Reforestation',
    description:
      'Large-scale reforestation project across the Brazilian Amazon basin, restoring degraded pastureland to native forest ecosystems.',
    type: 'Carbon',
    status: 'Active',
    country: 'Brazil',
    sites: 12,
    carbon: 18400,
    biodiversity: 84,
    area: 24800,
    owner: 'Alex Johnson',
    verificationProgress: 78,
    startDate: '2024-01-15',
    lastUpdated: '2025-06-15',
    verified: true,
  },
  {
    id: 'proj-2',
    name: 'Kerala Wetlands',
    description:
      'Conservation and restoration of critical wetland ecosystems along the Kerala backwaters for biodiversity preservation.',
    type: 'Biodiversity',
    status: 'Active',
    country: 'India',
    sites: 8,
    carbon: 9200,
    biodiversity: 71,
    area: 12400,
    owner: 'Alex Johnson',
    verificationProgress: 62,
    startDate: '2024-03-20',
    lastUpdated: '2025-06-12',
    verified: true,
  },
  {
    id: 'proj-3',
    name: 'Borneo Peatland',
    description:
      'Peatland rewetting and conservation initiative in Indonesian Borneo, preventing carbon emissions from peat degradation.',
    type: 'Mixed',
    status: 'Active',
    country: 'Indonesia',
    sites: 15,
    carbon: 12800,
    biodiversity: 63,
    area: 31200,
    owner: 'Alex Johnson',
    verificationProgress: 45,
    startDate: '2024-02-01',
    lastUpdated: '2025-06-10',
    verified: false,
  },
  {
    id: 'proj-4',
    name: 'Sahel Agroforestry',
    description:
      'Farmer-managed natural regeneration and agroforestry across the Sahel belt, combining food security with carbon sequestration.',
    type: 'Carbon',
    status: 'Draft',
    country: 'Niger',
    sites: 6,
    carbon: 5400,
    biodiversity: 54,
    area: 8600,
    owner: 'Alex Johnson',
    verificationProgress: 22,
    startDate: '2024-06-10',
    lastUpdated: '2025-06-08',
    verified: false,
  },
  {
    id: 'proj-5',
    name: 'Congo Basin Reserve',
    description:
      "Protected area management and community-based conservation in the Congo Basin rainforest, the world's second largest tropical forest.",
    type: 'Biodiversity',
    status: 'Inactive',
    country: 'DR Congo',
    sites: 9,
    carbon: 2491,
    biodiversity: 41,
    area: 18900,
    owner: 'Alex Johnson',
    verificationProgress: 15,
    startDate: '2024-05-05',
    lastUpdated: '2025-05-30',
    verified: false,
  },
];

export const carbonMonthlyData = [
  2100, 2800, 3200, 2900, 3800, 4200, 3900, 4800, 5100, 4600, 5400, 5800,
];
export const biodiversityMonthlyData = [65, 68, 66, 71, 70, 74, 73, 78, 76, 80, 79, 82];
export const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
