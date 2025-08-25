"use client";

import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import CampaignDetails from "@/components/Campaigns/CampaignDetails";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
      <CampaignDetails campaignId={params.id} />
    </MainLayout>
  );
}
