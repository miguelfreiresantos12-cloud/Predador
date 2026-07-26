"use client";

import { useBriefing } from "@/hooks/use-briefing";
import { Newspaper, Loader2 } from "lucide-react";

export function BriefingCard() {
  const { briefing, isLoading } = useBriefing();

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Briefing do dia
        </h2>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
      ) : briefing ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{briefing.summary}</p>
          {briefing.opportunities && (
            <div>
              <h4 className="text-xs font-medium text-positive mb-1">Oportunidades</h4>
              <p className="text-sm text-muted-foreground">{briefing.opportunities}</p>
            </div>
          )}
          {briefing.suggestions && (
            <div>
              <h4 className="text-xs font-medium text-info mb-1">Sugestões</h4>
              <p className="text-sm text-muted-foreground">{briefing.suggestions}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum briefing disponível ainda.</p>
      )}
    </div>
  );
}
