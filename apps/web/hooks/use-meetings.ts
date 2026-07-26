"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useMeetings() {
  const { data, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("meetings")
        .select("*, evaluation:evaluations(*), client:clients(name, company)")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return { meetings: data, isLoading };
}
