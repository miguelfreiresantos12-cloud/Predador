"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useLead(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return { lead: data, isLoading };
}
