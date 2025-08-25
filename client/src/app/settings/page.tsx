"use client";

import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import SettingsPage from "@/components/Settings/SettingsPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Settings() {
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
      <SettingsPage />
    </MainLayout>
  );
}
