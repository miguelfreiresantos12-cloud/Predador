"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { MetricCard } from "@/components/metric-card";
import { MeetingList } from "@/components/meeting-list";
import { UploadAudio } from "@/components/upload-audio";
import { BriefingCard } from "@/components/briefing-card";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Painel de prospecção e coaching comercial
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Calls hoje"
            value="3"
            trend="+1"
            trendUp
          />
          <MetricCard
            title="Nota média"
            value="7.8"
            trend="+0.3"
            trendUp
          />
          <MetricCard
            title="Tempo médio"
            value="24min"
            trend="-2min"
            trendUp={false}
          />
          <MetricCard
            title="Conversão"
            value="42%"
            trend="+5%"
            trendUp
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UploadAudio />
            <MeetingList />
          </div>
          <div>
            <BriefingCard />
          </div>
        </div>
      </main>
    </div>
  );
}
