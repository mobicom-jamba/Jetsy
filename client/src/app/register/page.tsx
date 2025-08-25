"use client";

import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import CampaignWizard from "@/components/Campaigns/CampaignWizard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCampaignPage() {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Campaign
        </h1>
        <CampaignWizard />
      </div>
    </MainLayout>
  );
}
