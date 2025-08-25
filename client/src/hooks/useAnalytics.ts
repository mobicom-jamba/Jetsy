// client/src/hooks/useAnalytics.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { Metrics, AnalyticsFilters } from "@/types/analytics";
import api from "@/lib/api";

export const useMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["metrics", filters],
    queryFn: async () => {
      const response = await api.get("/analytics/metrics", { params: filters });
      return response.data.metrics as Metrics[];
    },
  });
};

export const useCampaignMetrics = (campaignId: string, dateRange?: any) => {
  return useQuery({
    queryKey: ["campaign-metrics", campaignId, dateRange],
    queryFn: async () => {
      const response = await api.get("/analytics/metrics", {
        params: { campaignId, dateRange },
      });
      return response.data.metrics as Metrics[];
    },
    enabled: !!campaignId,
  });
};
