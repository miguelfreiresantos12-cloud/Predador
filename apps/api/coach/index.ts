import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

serve(async (req) => {
  const { question, userId } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Search memories
  const { data: memories } = await supabase.from("memories")
    .select("content, type, created_at, clients(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const context = memories?.map(m => `[${m.type}] ${m.content}`).join("\n") || "";

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é um coach comercial sênior. Use o contexto das memórias do usuário para responder de forma personalizada e estratégica." },
        { role: "user", content: `Contexto das memórias:\n${context}\n\nPergunta: ${question}` },
      ],
      temperature: 0.5,
    }),
  });

  const data = await gptRes.json();
  return new Response(JSON.stringify({ answer: data.choices[0].message.content }), { headers: { "Content-Type": "application/json" } });
});
