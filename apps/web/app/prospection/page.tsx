"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { LeadCard } from "@/components/lead-card";
import { useGenerateLeads } from "@/hooks/use-generate-leads";
import { useLeads } from "@/hooks/use-leads";
import { Loader2, Search } from "lucide-react";

export default function ProspectionPage() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [meta, setMeta] = useState(10);

  const { generateLeads, isGenerating, error } = useGenerateLeads();
  const { leads, isLoading } = useLeads();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nicho.trim() || !cidade.trim() || !meta || isGenerating) return;
    try {
      await generateLeads({ nicho: nicho.trim(), cidade: cidade.trim(), meta });
    } catch {
      // erro já exposto via `error` do hook
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Prospecção</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gere uma lista de leads qualificados por nicho e cidade
          </p>
        </header>

        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Nicho</label>
              <input
                type="text"
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                disabled={isGenerating}
                placeholder="ex: imobiliárias"
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={isGenerating}
                placeholder="ex: Vitória, ES"
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meta</label>
              <input
                type="number"
                min={1}
                value={meta}
                onChange={(e) => setMeta(Number(e.target.value))}
                disabled={isGenerating}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Gerar lista de hoje
            </button>
          </form>
          {isGenerating && (
            <p className="mt-4 text-sm text-muted-foreground">
              Buscando e analisando empresas, isso pode levar alguns minutos...
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-danger">
              Erro ao gerar leads: {error.message}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : leads?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum lead gerado ainda.</p>
        )}
      </main>
    </div>
  );
}
