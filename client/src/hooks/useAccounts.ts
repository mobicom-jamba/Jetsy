// client/src/hooks/useAccounts.ts
("use client");

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MetaAccount } from "@/types/auth";
import api from "@/lib/api";

export const useMetaAccounts = () => {
  return useQuery({
    queryKey: ["meta-accounts"],
    queryFn: async () => {
      const response = await api.get("/accounts");
      return response.data.accounts as MetaAccount[];
    },
  });
};

export const useConnectMetaAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.get("/auth/meta/connect");
      window.location.href = response.data.authUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meta-accounts"] });
    },
  });
};
