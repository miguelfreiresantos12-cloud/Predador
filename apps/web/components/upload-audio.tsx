"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Upload, Mic, Loader2 } from "lucide-react";

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : "";

  const sanitizedBase = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos (marcas diacríticas)
    .replace(/\s+/g, "-") // espaços viram hífen
    .replace(/[^a-zA-Z0-9._-]/g, ""); // mantém só letras, números, -, _ e .

  return `${sanitizedBase}${ext}`;
}

export function UploadAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const fileName = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("audio-uploads")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      // audio-uploads é um bucket privado: guardamos o path do storage
      // (não uma public URL, que não funcionaria e nem é o que
      // process-meeting espera ao chamar storage.download()).
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""),
          audio_url: fileName,
          source: "upload",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (meetingError) throw meetingError;

      // Transcrever e analisar via Edge Function (Groq Whisper + Llama)
      const { error: processError } = await supabase.functions.invoke("process-meeting", {
        body: { meetingId: meeting.id },
      });
      if (processError) throw processError;

      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Nova call
      </h2>
      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload de áudio
        </button>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            isRecording
              ? "bg-destructive text-white hover:bg-destructive/90"
              : "border border-border bg-secondary hover:bg-secondary/80"
          }`}
        >
          <Mic className="h-4 w-4" />
          {isRecording ? "Parar gravação" : "Gravar agora"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadMutation.isPending && (
        <p className="mt-3 text-sm text-muted-foreground">
          Processando áudio e gerando transcrição...
        </p>
      )}
      {uploadMutation.isError && (
        <p className="mt-3 text-sm text-destructive">
          Erro ao processar call: {(uploadMutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
