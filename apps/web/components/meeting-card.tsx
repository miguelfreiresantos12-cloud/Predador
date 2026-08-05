"use client";

import Link from "next/link";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  started_at: string;
  duration_seconds: number;
  status: string;
  summary?: string;
  evaluation?: { overall_score: number };
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const score = meeting.evaluation?.overall_score;
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="rounded-xl border border-border bg-card p-5 hover:border-accent/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-foreground truncate pr-2">{meeting.title}</h3>
          {score !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              score >= 8 ? "bg-positive/10 text-positive" :
              score >= 6 ? "bg-info/10 text-info" :
              "bg-danger/10 text-danger"
            }`}>
              <TrendingUp className="h-3 w-3" />{score}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(meeting.started_at).toLocaleDateString("pt-BR")}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.floor(meeting.duration_seconds / 60)}min</span>
        </div>
        {meeting.summary && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{meeting.summary}</p>
        )}
      </div>
    </Link>
  );
}
