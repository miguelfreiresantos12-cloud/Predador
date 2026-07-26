import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

serve(async (req) => {
  const { userId, industry } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Search web for news (simplified - use a real news API in production)
  const searchQuery = `${industry} notícias hoje`;

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `Você é um analista de mercado. Gere um briefing diário para um profissional de vendas do setor de ${industry}. Inclua: resumo, impacto, oportunidades, riscos e sugestões de abordagem. Responda em JSON.` },
        { role: "user", content: `Gere o briefing de hoje para o setor ${industry}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const data = await gptRes.json();
  const result = JSON.parse(data.choices[0].message.content);

  const today = new Date().toISOString().split("T")[0];
  await supabase.from("briefings").upsert({
    user_id: userId,
    date: today,
    summary: result.summary,
    impact: result.impact,
    opportunities: result.opportunities,
    risks: result.risks,
    suggestions: result.suggestions,
  }, { onConflict: "user_id,date" });

  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
});
