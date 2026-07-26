"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useBriefing() {
  const { data, isLoading } = useQuery({
    queryKey: ["briefing"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("briefings")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  return { briefing: data, isLoading };
}
