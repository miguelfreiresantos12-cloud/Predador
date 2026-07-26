"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface Evaluation {
  rapport: number;
  active_listening: number;
  empathy: number;
  discovery: number;
  control: number;
  argumentation: number;
  objections_handling: number;
  clarity: number;
  confidence: number;
  closing: number;
  next_steps: number;
}

export function EvaluationRadar({ evaluation }: { evaluation: Evaluation }) {
  const data = [
    { subject: "Rapport", A: evaluation.rapport },
    { subject: "Escuta", A: evaluation.active_listening },
    { subject: "Empatia", A: evaluation.empathy },
    { subject: "Descoberta", A: evaluation.discovery },
    { subject: "Controle", A: evaluation.control },
    { subject: "Argumentação", A: evaluation.argumentation },
    { subject: "Objeções", A: evaluation.objections_handling },
    { subject: "Clareza", A: evaluation.clarity },
    { subject: "Segurança", A: evaluation.confidence },
    { subject: "Fechamento", A: evaluation.closing },
    { subject: "Próximos", A: evaluation.next_steps },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <Radar name="Você" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
