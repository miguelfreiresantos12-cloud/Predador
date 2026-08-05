import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_ANALYZE_MEETING = `Você é um coach comercial sênior especialista na metodologia SPIN Selling (Neil Rackham), com 20 anos de experiência treinando equipes de vendas de alta performance.

Analise a transcrição da ligação de vendas sob a ótica do SPIN Selling e retorne um JSON estrito com a seguinte estrutura:

{
  "summary": "Resumo em português em 3 parágrafos cobrindo: contexto, principais pontos discutidos, e resultado",
  "sentiment": "positive|neutral|negative",
  "objections": ["lista de objeções identificadas"],
  "opportunities": ["oportunidades de negócio identificadas"],
  "tasks": ["tarefas pendentes mencionadas"],
  "spin_analysis": {
    "situation_questions": { "score": 0, "examples": ["perguntas de situação identificadas"], "feedback": "avaliação de como o vendedor mapeou o contexto atual do cliente" },
    "problem_questions": { "score": 0, "examples": ["perguntas de problema identificadas"], "feedback": "avaliação de como o vendedor descobriu dores do cliente" },
    "implication_questions": { "score": 0, "examples": ["perguntas de implicação identificadas"], "feedback": "avaliação de como o vendedor ampliou a percepção de urgência do problema" },
    "need_payoff_questions": { "score": 0, "examples": ["perguntas de necessidade de solução identificadas"], "feedback": "avaliação de como o vendedor levou o cliente a verbalizar o valor da solução" }
  },
  "evaluation": {
    "rapport": 0,
    "active_listening": 0,
    "empathy": 0,
    "discovery": 0,
    "control": 0,
    "argumentation": 0,
    "objections_handling": 0,
    "clarity": 0,
    "confidence": 0,
    "closing": 0,
    "next_steps": 0
  },
  "overall_score": 0,
  "feedback": {
    "excellent": "O que foi excelente na ligação, com exemplos específicos da transcrição, incluindo uso do SPIN",
    "improve": "O que precisa melhorar, com sugestões práticas de quais perguntas SPIN faltaram ou poderiam ter sido melhores",
    "next_steps": "Próximos passos recomendados pelo coach"
  }
}

Critérios de avaliação SPIN (0-10 cada):
- Perguntas de Situação: o vendedor entendeu o contexto atual do cliente sem parecer interrogatório?
- Perguntas de Problema: o vendedor descobriu dificuldades reais, insatisfações ou dores?
- Perguntas de Implicação: o vendedor ajudou o cliente a perceber a gravidade/consequências do problema?
- Perguntas de Necessidade de Solução: o vendedor fez o cliente verbalizar os benefícios de resolver o problema, em vez de simplesmente apresentar a solução?

Critérios de avaliação geral (0-10 cada):
- Rapport: Conexão inicial, quebra-gelo, ambiente confortável
- Escuta Ativa: Proporção fala/escuta, paráfrases, confirmações
- Empatia: Reconhecimento de emoções, validação, preocupação genuína
- Descoberta: Qualidade das perguntas, profundidade, descoberta de dor real (correlacionado ao SPIN)
- Controle: Direcionamento da conversa, evitar dispersões, manter foco
- Argumentação: Clareza, relevância, provas sociais, cases
- Objeções: Antecipação, escuta, reframe, confirmação de superação
- Clareza: Comunicação objetiva, sem jargões, fácil entendimento
- Confiança: Confiança transmitida, postura, tom de voz (inferido do texto)
- Fechamento: Tentativas de avanço, propostas, pedidos de decisão
- Próximos Passos: Definição clara de ações, responsáveis, prazos

Regras:
- Seja honesto e direto nas notas
- Use exemplos e trechos específicos da transcrição, especialmente para identificar as perguntas SPIN
- Se uma categoria SPIN não foi usada na ligação, dê nota 0 e explique o que faltou
- Sugestões devem ser acionáveis imediatamente, incluindo exemplos de perguntas SPIN que poderiam ter sido feitas
- Responda APENAS em JSON válido, sem markdown`;

const PROMPT_MEMORY_EXTRACTION = `Analise a transcrição da call e extraia fatos importantes sobre o cliente que devem ser lembrados para futuras interações.

Para cada fato, classifique o tipo:
- fact: informação factual sobre o cliente/empresa
- preference: preferências pessoais ou da empresa
- objection: objeções ou resistências
- opportunity: oportunidades de negócio
- commitment: compromissos assumidos

Retorne em JSON: { "memories": [{"content": "...", "type": "..."}] }`;serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { meetingId } = await req.json();
    if (!meetingId) {
      return new Response(JSON.stringify({ error: "meetingId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqKey = Deno.env.get("GROQ_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar a reunião e o áudio
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .single();

    if (meetingError || !meeting) {
      throw new Error("Call não encontrada: " + meetingError?.message);
    }

    await supabase.from("meetings").update({ status: "transcribing" }).eq("id", meetingId);

    // 2. Baixar o áudio do storage (com retry)
    const audioPath = meeting.audio_url;
    console.log("DEBUG audioPath:", JSON.stringify(audioPath), "length:", audioPath?.length);

    let audioFile = null;
    let audioError = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
      console.log(`DEBUG tentativa ${attempt}/4 de download do áudio`);

      const result = await supabase.storage.from("audio-uploads").download(audioPath);
      audioFile = result.data;
      audioError = result.error;

      if (!audioError && audioFile) {
        console.log(`DEBUG tentativa ${attempt}/4: sucesso`);
        break;
      }

      console.log(`DEBUG tentativa ${attempt}/4: falhou -`, JSON.stringify(audioError));

      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (audioError || !audioFile) {
      console.log("DEBUG audioError completo:", JSON.stringify(audioError));
      throw new Error("Erro ao baixar áudio: " + audioError?.message);
    }

    // 3. Transcrever com Whisper
    const formData = new FormData();
    formData.append("file", audioFile, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("language", "pt");

    const whisperResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errText = await whisperResponse.text();
      throw new Error("Erro na transcrição: " + errText);
    }

    const whisperData = await whisperResponse.json();
    const transcription = whisperData.text;

    // 4. Analisar com GPT-4o
    const analysisResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: PROMPT_ANALYZE_MEETING },
          { role: "user", content: transcription },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      throw new Error("Erro na análise: " + errText);
    }

    const analysisData = await analysisResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    // 5. Extrair memórias
    const memoryResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: PROMPT_MEMORY_EXTRACTION },
          { role: "user", content: transcription },
        ],
        response_format: { type: "json_object" },
      }),
    });

    let memories: { content: string; type: string }[] = [];
    if (memoryResponse.ok) {
      const memoryData = await memoryResponse.json();
      const parsed = JSON.parse(memoryData.choices[0].message.content);
      memories = parsed.memories || [];
    }

    // 6. Salvar transcrição + análise na reunião
    await supabase
      .from("meetings")
      .update({
        transcription,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        status: "analyzed",
      })
      .eq("id", meetingId);

    // 7. Salvar avaliação
    await supabase.from("evaluations").insert({
      meeting_id: meetingId,
      overall_score: analysis.overall_score,
      rapport: analysis.evaluation.rapport,
      active_listening: analysis.evaluation.active_listening,
      empathy: analysis.evaluation.empathy,
      discovery: analysis.evaluation.discovery,
      control: analysis.evaluation.control,
      argumentation: analysis.evaluation.argumentation,
      objections_handling: analysis.evaluation.objections_handling,
      clarity: analysis.evaluation.clarity,
      confidence: analysis.evaluation.confidence,
      closing: analysis.evaluation.closing,
      next_steps: analysis.evaluation.next_steps,
      feedback: analysis.feedback,
    });

    // 8. Salvar tarefas, se houver
    if (analysis.tasks?.length) {
      const tasksToInsert = analysis.tasks.map((title: string) => ({
        user_id: meeting.user_id,
        meeting_id: meetingId,
        title,
      }));
      await supabase.from("tasks").insert(tasksToInsert);
    }

    // 9. Salvar memórias, se houver cliente vinculado
    if (memories.length && meeting.client_id) {
      const memoriesToInsert = memories.map((m) => ({
        user_id: meeting.user_id,
        client_id: meeting.client_id,
        content: m.content,
        type: m.type,
      }));
      await supabase.from("memories").insert(memoriesToInsert);
    }

    return new Response(
      JSON.stringify({ success: true, meetingId, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar reunião:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
