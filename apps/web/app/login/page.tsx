"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white font-bold text-xl">
            AI
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Predador</h1>
          <p className="text-muted-foreground text-sm mt-2">Sistema de Prospecção DC</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              placeholder="voce@empresa.com" required />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              placeholder="••••••••" required />
          </div>
          {error && <div className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</div>}
          <button type="submit" disabled={isLoading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegister ? "Criar conta" : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-accent hover:underline">
            {isRegister ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
}
