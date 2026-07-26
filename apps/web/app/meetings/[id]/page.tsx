"use client";

import { useParams } from "next/navigation";
import { useMeeting } from "@/hooks/use-meeting";
import { Sidebar } from "@/components/sidebar";
import { EvaluationRadar } from "@/components/evaluation-radar";
import { Loader2, Clock, Calendar, User, Building2 } from "lucide-react";

export default function MeetingDetailPage() {
  const { id } = useParams();
  const { meeting, evaluation, isLoading } = useMeeting(id as string);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (!meeting) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{meeting.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(meeting.started_at).toLocaleDateString("pt-BR")}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{Math.floor(meeting.duration_seconds / 60)}min</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{meeting.client?.name || "Cliente"}</span>
            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{meeting.client?.company || "Empresa"}</span>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Transcrição</h2>
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap max-h-[400px] overflow-y-auto">{meeting.transcription || "Transcrição não disponível"}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Resumo</h2>
              <p className="text-sm leading-relaxed text-foreground/90">{meeting.summary || "Resumo não disponível"}</p>
            </div>
          </div>
          <div className="space-y-6">
            {evaluation && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Avaliação</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-accent">{evaluation.overall_score}</span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <EvaluationRadar evaluation={evaluation} />
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Feedback do Coach</h2>
                  <div className="space-y-4">
                    <div><h3 className="text-sm font-medium text-positive mb-1">O que foi excelente</h3><p className="text-sm text-muted-foreground">{evaluation.feedback?.excellent || "N/A"}</p></div>
                    <div><h3 className="text-sm font-medium text-destructive mb-1">O que precisa melhorar</h3><p className="text-sm text-muted-foreground">{evaluation.feedback?.improve || "N/A"}</p></div>
                    <div><h3 className="text-sm font-medium text-info mb-1">Próximos passos</h3><p className="text-sm text-muted-foreground">{evaluation.feedback?.next_steps || "N/A"}</p></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
