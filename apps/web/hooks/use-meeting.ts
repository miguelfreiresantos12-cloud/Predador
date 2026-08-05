"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useMeeting(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: async () => {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .select("*, client:clients(name, company:companies(name))")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: evaluation } = await supabase
        .from("evaluations")
        .select("*")
        .eq("meeting_id", id)
        .single();

      return { meeting, evaluation };
    },
    enabled: !!id,
  });

  return { meeting: data?.meeting, evaluation: data?.evaluation, isLoading };
}
