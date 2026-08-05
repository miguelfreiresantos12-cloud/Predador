import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PADRÃO DE AUTENTICAÇÃO DIFERENTE DO RESTO DO CODEBASE:
// process-meeting e coach-chat confiam num user_id vindo indiretamente (via FK
// de uma linha já existente) ou direto do body da requisição, sem validar o
// JWT de quem chamou. Aqui fazemos diferente de propósito, porque essa function
// grava leads novos a partir de dado nenhum pré-existente — não há nenhuma FK
// pra confiar. O user_id NUNCA vem do body: ele é extraído validando o JWT do
// header Authorization com um client autenticado via SUPABASE_ANON_KEY
// (supabase.auth.getUser()). Só depois de validado é que usamos o client com
// SUPABASE_SERVICE_ROLE_KEY (que ignora RLS) para as operações de banco.

const PROMPT_ANALYZE_LEAD = `Você é um analista de pré-vendas (SDR) sênior, especialista em qualificação de leads B2B.

Você vai receber o nome, link e um trecho de busca (snippet) de uma empresa encontrada no Google. Analise se é uma empresa real e relevante para prospecção, considerando o ICP (Perfil de Cliente Ideal) da DC:

- Faturamento entre R$2M e R$50M/ano
- Já investe em marketing digital, mas não mede ROI de forma estruturada
- Tem equipe interna buscando metodologia de vendas/marketing
- Valoriza decisão orientada por dados

Retorne APENAS um JSON estrito com esta estrutura:

{
  "qualified": true,
  "website": "URL do site da empresa, ou null se não identificado",
  "social": "principal rede social encontrada (Instagram/LinkedIn/Facebook), ou null se não identificado",
  "phone": "telefone de contato da empresa, se identificado no site/snippet (formato brasileiro, ex: (27) 3232-1234 ou (27) 99999-9999), ou null se não encontrado",
  "digital_signals": "sinais de presença digital observados (ex: site desatualizado, anúncios ativos, blog parado, sem redes sociais, etc.)",
  "revenue_estimate": "estimativa de faturamento anual — deixe explícito que é uma ESTIMATIVA, ex: 'Estimativa: R$5-10M/ano, baseado em porte aparente do site e operação'",
  "commercial_structure": "estrutura comercial aparente, ex: 'time de vendas próprio visível no site', 'sem estrutura comercial identificável', 'aparenta ser terceirizada'",
  "momento_gatilho": "troca de agência",
  "fit_score": 0,
  "matched_criteria": ["lista dos critérios do ICP acima que essa empresa atende, em texto curto"],
  "notes": "motivo do fit (ou não-fit) + uma dica prática de abordagem para o vendedor"
}

Regras para "fit_score": use uma escala de 0 a 100 (não 0 a 10). 0 = nenhum fit com o ICP, 100 = fit perfeito em todos os critérios. Empresas com fit forte devem ficar na faixa 70-100; fit moderado, 40-69; fit fraco, 0-39.

Regras para "momento_gatilho": use exatamente um destes quatro valores, o que for mais provável pelas evidências disponíveis: "troca de agência", "entrada no digital", "time desalinhado", "não identificado".

Regras para "qualified": marque true somente se for uma empresa real (não diretório, marketplace, notícia, blog genérico ou página de terceiros) e que tenha relação plausível com o nicho pesquisado. Caso contrário, marque false e explique brevemente em "notes" por que foi descartada — nesse caso os demais campos podem ficar vazios ou null.

Responda APENAS em JSON válido, sem markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nicho, cidade, meta } = await req.json();
    if (!nicho || !cidade || !meta) {
      return new Response(JSON.stringify({ error: "nicho, cidade e meta são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqKey = Deno.env.get("GROQ_API_KEY")!;
    const serperKey = Deno.env.get("SERPER_API_KEY")!;

    // 1. Validar o JWT de quem chamou e extrair o user_id real (nunca confiar no body)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header é obrigatório" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido ou expirado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // 2. Client com service role para as operações de banco (ignora RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Buscar empresas no Serper e qualificar com Groq até bater a meta
    const query = `${nicho} em ${cidade}`;
    const qualifiedLeads = [];
    const maxAttempts = meta * 4;
    let attempts = 0;
    let page = 1;
    let candidates = [];

    while (qualifiedLeads.length < meta && attempts < maxAttempts) {
      if (candidates.length === 0) {
        console.log(`DEBUG buscando no Serper: "${query}" (página ${page})`);

        const serperResponse = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ q: query, gl: "br", hl: "pt-br", page }),
        });

        if (!serperResponse.ok) {
          const errText = await serperResponse.text();
          throw new Error("Erro na busca do Serper: " + errText);
        }

        const serperData = await serperResponse.json();
        candidates = serperData.organic || [];
        page++;

        if (candidates.length === 0) {
          console.log(`DEBUG Serper sem mais resultados, encerrando busca com ${qualifiedLeads.length}/${meta} leads`);
          break;
        }
      }

      const candidate = candidates.shift();
      attempts++;

      try {
        // 4. Analisar o candidato com Groq (fit em relação ao ICP da DC)
        const analysisResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: PROMPT_ANALYZE_LEAD },
              {
                role: "user",
                content: `Nome: ${candidate.title}\nLink: ${candidate.link}\nTrecho: ${candidate.snippet || ""}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!analysisResponse.ok) {
          const errText = await analysisResponse.text();
          console.log(`DEBUG Groq falhou para "${candidate.title}":`, errText);
          continue;
        }

        const analysisData = await analysisResponse.json();
        const analysis = JSON.parse(analysisData.choices[0].message.content);

        if (!analysis.qualified) {
          console.log(`DEBUG "${candidate.title}" não qualificado:`, analysis.notes);
          continue;
        }

        // 5. Inserir o lead qualificado
        const { data: lead, error: insertError } = await supabase
          .from("leads")
          .insert({
            user_id: userId,
            nicho,
            cidade,
            meta_diaria: meta,
            name: candidate.title,
            website: analysis.website || candidate.link,
            social: analysis.social,
            phone: analysis.phone,
            digital_signals: analysis.digital_signals,
            revenue_estimate: analysis.revenue_estimate,
            commercial_structure: analysis.commercial_structure,
            momento_gatilho: analysis.momento_gatilho,
            fit_score: analysis.fit_score,
            matched_criteria: analysis.matched_criteria || [],
            notes: analysis.notes,
          })
          .select()
          .single();

        if (insertError) {
          console.log(`DEBUG erro ao inserir lead "${candidate.title}":`, insertError.message);
          continue;
        }

        qualifiedLeads.push(lead);
      } catch (candidateError) {
        console.log(`DEBUG erro ao processar candidato "${candidate.title}":`, candidateError.message);
        continue;
      }
    }

    // 6. Retornar os leads criados
    return new Response(
      JSON.stringify({ success: true, leads: qualifiedLeads }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao gerar leads:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
