import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_COACH_CHAT = `Você é um coach comercial sênior e mentor pessoal. Você tem acesso às memórias e histórico do usuário.

Use o contexto fornecido para dar respostas personalizadas, estratégicas e acionáveis.

Diretrizes:
- Seja direto e prático
- Use dados do histórico quando relevante
- Sugira ações concretas
- Mantenha tom profissional mas encorajador
- Se não souber algo, seja honesto`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, message } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqKey = Deno.env.get("GROQ_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar as últimas 20 memórias do usuário
    const { data: memories, error: memoriesError } = await supabase
      .from("memories")
      .select("content, type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (memoriesError) {
      throw new Error("Erro ao buscar memórias: " + memoriesError.message);
    }

    // 2. Buscar as últimas 5 calls do usuário
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select("title, summary, sentiment, started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(5);

    if (meetingsError) {
      throw new Error("Erro ao buscar calls: " + meetingsError.message);
    }

    // 3. Buscar a última avaliação do usuário (via join com meetings)
    const { data: lastEvaluation, error: evaluationError } = await supabase
      .from("evaluations")
      .select("overall_score, feedback, meetings!inner(user_id, started_at)")
      .eq("meetings.user_id", userId)
      .order("started_at", { referencedTable: "meetings", ascending: false })
      .limit(1)
      .maybeSingle();

    if (evaluationError) {
      throw new Error("Erro ao buscar avaliação: " + evaluationError.message);
    }

    // 4. Montar o contexto em texto
    const memoriesText = memories?.length
      ? memories.map((m) => `- [${m.type}] ${m.content}`).join("\n")
      : "Nenhuma memória registrada ainda.";

    const meetingsText = meetings?.length
      ? meetings
          .map(
            (m) =>
              `- ${m.title} (${m.started_at}) | sentimento: ${m.sentiment}\n  Resumo: ${m.summary}`
          )
          .join("\n")
      : "Nenhuma call registrada ainda.";

    const evaluationText = lastEvaluation
      ? `Nota geral: ${lastEvaluation.overall_score}\nFeedback: ${JSON.stringify(lastEvaluation.feedback)}`
      : "Nenhuma avaliação registrada ainda.";

    const context = `## Memórias do usuário\n${memoriesText}\n\n## Últimas calls\n${meetingsText}\n\n## Última avaliação\n${evaluationText}`;

    // 5. Chamar a API da Groq
    const chatResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: PROMPT_COACH_CHAT },
          { role: "system", content: context },
          { role: "user", content: message },
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      throw new Error("Erro no chat: " + errText);
    }

    const chatData = await chatResponse.json();
    const reply = chatData.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no coach chat:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
