"use client";

import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import CampaignList from "@/components/Campaigns/CampaignList";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CampaignsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <MainLayout>
      <CampaignList />
    </MainLayout>
  );
}
