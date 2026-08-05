"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLead } from "@/hooks/use-lead";
import { Sidebar } from "@/components/sidebar";
import { Loader2, ArrowLeft, Calendar, MapPin, Tag, Globe, Share2, Zap, Phone } from "lucide-react";

export default function LeadDetailPage() {
  const { id } = useParams();
  const { lead, isLoading } = useLead(id as string);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (!lead) return null;

  const score = lead.fit_score;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <Link href="/prospection" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Voltar
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{lead.nicho}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{lead.cidade}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs uppercase tracking-wider">{lead.status}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Análise de fit</h2>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">Sinais digitais</h3>
                <p className="text-sm text-muted-foreground">{lead.digital_signals || "Não identificado"}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-1">Estimativa de faturamento</h3>
                <p className="text-sm text-muted-foreground">{lead.revenue_estimate || "Não estimado"}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-1">Estrutura comercial</h3>
                <p className="text-sm text-muted-foreground">{lead.commercial_structure || "Não identificada"}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Momento gatilho</h3>
                <p className="text-sm text-muted-foreground">{lead.momento_gatilho || "Não identificado"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Notas</h2>
              <p className="text-sm leading-relaxed text-foreground/90">{lead.notes || "Sem notas"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fit Score</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${
                    score >= 70 ? "text-positive" :
                    score >= 40 ? "text-warning" :
                    "text-danger"
                  }`}>{score ?? "—"}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Critérios atendidos</h2>
              {lead.matched_criteria?.length ? (
                <div className="flex flex-wrap gap-2">
                  {lead.matched_criteria.map((criterion: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-secondary text-xs text-foreground">
                      {criterion}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum critério identificado</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contato</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate">
                      {lead.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Site não identificado</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.social || "Rede social não identificada"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.phone || "Telefone não identificado"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
