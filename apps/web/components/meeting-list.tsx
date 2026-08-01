"use client";

import { useMeetings } from "@/hooks/use-meetings";
import { MeetingCard } from "./meeting-card";
import { Loader2 } from "lucide-react";

export function MeetingList() {
  const { meetings, isLoading } = useMeetings();
  const recent = meetings?.slice(0, 6);

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Calls recentes
      </h2>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recent?.map((m) => <MeetingCard key={m.id} meeting={m} />)}
        </div>
      )}
    </div>
  );
}
