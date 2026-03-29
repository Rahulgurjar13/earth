import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Project } from '../data/mockProjects';
import { Site } from '../data/mockSites';

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects/');
      return data;
    },
  });
};

export const useSites = () => {
  return useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data } = await api.get('/sites/');
      return data;
    },
  });
};

export const useSiteAnalytics = (siteId: string | number) => {
  return useQuery({
    queryKey: ['sites', siteId, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${siteId}/analytics`);
      return data;
    },
    enabled: !!siteId,
  });
};
