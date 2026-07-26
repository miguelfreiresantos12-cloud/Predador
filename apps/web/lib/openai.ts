const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function transcribeAudio(audioUrl: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: new FormData(), // Simplified - actual implementation needs file blob
  });
  const data = await response.json();
  return data.text;
}

export async function analyzeMeeting(transcription: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_ANALYZE },
        { role: "user", content: transcription },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

const SYSTEM_PROMPT_ANALYZE = `Você é um coach comercial sênior. Analise a transcrição da reunião e retorne um JSON com:
- summary: resumo em 3 parágrafos
- sentiment: "positive", "neutral" ou "negative"
- objections: array de objeções identificadas
- opportunities: array de oportunidades
- tasks: array de tarefas pendentes
- evaluation: objeto com notas de 0-10 para: rapport, active_listening, empathy, discovery, control, argumentation, objections_handling, clarity, confidence, closing, next_steps
- overall_score: média das notas
- feedback: { excellent: string, improve: string, next_steps: string }
Responda APENAS em JSON válido.`;
