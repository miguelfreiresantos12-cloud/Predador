"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useCoachChat() {
  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: { userId: user.id, message },
      });
      if (error) throw error;

      return data.reply as string;
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
