import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const SYSTEM_PROMPT = `Você é um coach comercial sênior com 20 anos de experiência. Analise a transcrição da call de vendas e retorne um JSON estrito com:

{
  "summary": "resumo em português em 3 parágrafos",
  "sentiment": "positive|neutral|negative",
  "objections": ["objeção 1", "objeção 2"],
  "opportunities": ["oportunidade 1"],
  "tasks": ["tarefa 1"],
  "evaluation": {
    "rapport": 0-10,
    "active_listening": 0-10,
    "empathy": 0-10,
    "discovery": 0-10,
    "control": 0-10,
    "argumentation": 0-10,
    "objections_handling": 0-10,
    "clarity": 0-10,
    "confidence": 0-10,
    "closing": 0-10,
    "next_steps": 0-10
  },
  "overall_score": 0-10,
  "feedback": {
    "excellent": "o que foi excelente",
    "improve": "o que precisa melhorar",
    "next_steps": "próximos passos recomendados"
  }
}

Critérios de avaliação:
- Rapport: conexão inicial com o cliente
- Escuta ativa: quanto o vendedor ouviu vs falou
- Empatia: demonstração de compreensão
- Descoberta: qualidade das perguntas
- Controle: direcionamento da conversa
- Argumentação: clareza dos argumentos
- Objeções: como lidou com resistências
- Clareza: comunicação objetiva
- Segurança: confiança transmitida
- Fechamento: tentativas de avançar
- Próximos passos: definição clara de ações

Responda APENAS em JSON válido, sem markdown.`;

serve(async (req) => {
  const { meetingId, transcription } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcription },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  const gptData = await gptRes.json();
  const result = JSON.parse(gptData.choices[0].message.content);

  // Update meeting
  await supabase.from("meetings").update({
    summary: result.summary,
    sentiment: result.sentiment,
    status: "analyzed",
  }).eq("id", meetingId);

  // Save evaluation
  await supabase.from("evaluations").insert({
    meeting_id: meetingId,
    overall_score: result.overall_score,
    ...result.evaluation,
    feedback: result.feedback,
  });

  // Save memories
  const { data: meeting } = await supabase.from("meetings").select("user_id, client_id").eq("id", meetingId).single();
  if (meeting) {
    const memories = [
      ...result.objections.map((o: string) => ({ user_id: meeting.user_id, client_id: meeting.client_id, content: o, type: "objection" })),
      ...result.opportunities.map((o: string) => ({ user_id: meeting.user_id, client_id: meeting.client_id, content: o, type: "opportunity" })),
    ];
    await supabase.from("memories").insert(memories);
  }

  // Save tasks
  if (result.tasks?.length) {
    await supabase.from("tasks").insert(
      result.tasks.map((t: string) => ({ meeting_id: meetingId, user_id: meeting?.user_id, title: t, status: "todo" }))
    );
  }

  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
});
