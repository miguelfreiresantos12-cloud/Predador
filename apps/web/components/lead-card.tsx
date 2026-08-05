"use client";

import Link from "next/link";
import { Globe, Share2, Zap, TrendingUp } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  website?: string;
  social?: string;
  momento_gatilho?: string;
  fit_score?: number;
  notes?: string;
}

export function LeadCard({ lead }: { lead: Lead }) {
  const score = lead.fit_score;
  return (
    <Link href={`/prospection/${lead.id}`}>
      <div className="rounded-xl border border-border bg-card p-5 hover:border-accent/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-foreground truncate pr-2">{lead.name}</h3>
          {score !== undefined && score !== null && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              score >= 70 ? "bg-positive/10 text-positive" :
              score >= 40 ? "bg-warning/10 text-warning" :
              "bg-danger/10 text-danger"
            }`}>
              <TrendingUp className="h-3 w-3" />{score}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {lead.momento_gatilho && (
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{lead.momento_gatilho}</span>
          )}
          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-accent transition-colors"
            >
              <Globe className="h-3 w-3" />Site
            </a>
          )}
          {lead.social && (
            <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{lead.social}</span>
          )}
        </div>
        {lead.notes && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{lead.notes}</p>
        )}
      </div>
    </Link>
  );
}
