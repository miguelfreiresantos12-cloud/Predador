"use client";

import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  momento_gatilho?: string;
  fit_score?: number;
}

export function LeadRow({ lead }: { lead: Lead }) {
  const score = lead.fit_score;

  const parts: { key: string; node: React.ReactNode }[] = [
    { key: "name", node: <span className="text-foreground font-medium">{lead.name}</span> },
  ];

  if (lead.phone) {
    parts.push({ key: "phone", node: <span>{lead.phone}</span> });
  }

  if (score !== undefined && score !== null) {
    parts.push({
      key: "score",
      node: (
        <span className={`font-semibold ${
          score >= 70 ? "text-positive" :
          score >= 40 ? "text-warning" :
          "text-danger"
        }`}>
          {score}
        </span>
      ),
    });
  }

  if (lead.website) {
    parts.push({ key: "website", node: <span>{lead.website}</span> });
  }

  if (lead.momento_gatilho) {
    parts.push({ key: "gatilho", node: <span>{lead.momento_gatilho}</span> });
  }

  return (
    <Link
      href={`/prospection/${lead.id}`}
      className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
    >
      {parts.map((part, i) => (
        <span key={part.key} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="text-border">—</span>}
          {part.node}
        </span>
      ))}
    </Link>
  );
}
