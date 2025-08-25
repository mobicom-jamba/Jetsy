// client/src/hooks/useCampaigns.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Campaign, CreateCampaignData } from "@/types/campaign";
import api from "@/lib/api";

export const useCampaigns = (filters?: any) => {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: async () => {
      const response = await api.get("/campaigns", { params: filters });
      return response.data.campaigns as Campaign[];
    },
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const response = await api.get(`/campaigns/${id}`);
      return response.data.campaign as Campaign;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const response = await api.post("/campaigns", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/campaigns/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};
