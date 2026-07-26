import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

serve(async (req) => {
  const { meetingId, audioUrl } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Download audio
  const audioRes = await fetch(audioUrl);
  const audioBlob = await audioRes.blob();

  // Transcribe with Whisper
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.mp3");
  formData.append("model", "whisper-1");
  formData.append("language", "pt");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
    body: formData,
  });
  const { text: transcription } = await whisperRes.json();

  // Save transcription
  await supabase.from("meetings").update({ transcription }).eq("id", meetingId);

  // Trigger analysis
  await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
    body: JSON.stringify({ meetingId, transcription }),
  });

  return new Response(JSON.stringify({ transcription }), { headers: { "Content-Type": "application/json" } });
});
