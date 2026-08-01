"use client";

import { useMeetings } from "@/hooks/use-meetings";
import { Sidebar } from "@/components/sidebar";
import { MeetingCard } from "@/components/meeting-card";
import { Loader2 } from "lucide-react";

export default function MeetingsPage() {
  const { meetings, isLoading } = useMeetings();
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Calls</h1>
          <p className="text-muted-foreground text-sm mt-1">Histórico completo de atendimentos</p>
        </header>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings?.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        )}
      </main>
    </div>
  );
}
