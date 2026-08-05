"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface GenerateLeadsParams {
  nicho: string;
  cidade: string;
  meta: number;
}

export function useGenerateLeads() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ nicho, cidade, meta }: GenerateLeadsParams) => {
      const { data, error } = await supabase.functions.invoke("generate-leads", {
        body: { nicho, cidade, meta },
      });
      if (error) throw error;

      return data.leads as unknown[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return {
    generateLeads: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
