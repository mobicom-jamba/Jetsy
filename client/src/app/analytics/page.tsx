"use client";

import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import AnalyticsDashboard from "@/components/Analytics/AnalyticsDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsPage() {
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
      <AnalyticsDashboard />
    </MainLayout>
  );
}
