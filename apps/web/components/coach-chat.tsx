"use client";

import { useState } from "react";
import { useCoachChat, type ChatMessage } from "@/hooks/use-coach-chat";
import { Send, Loader2, Sparkles } from "lucide-react";

export function CoachChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage, isSending, error } = useCoachChat();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const reply = await sendMessage(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      // erro já exposto via `error` do hook
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Coach IA
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Pergunte sobre suas calls, peça feedback ou tire dúvidas com o seu coach comercial.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-secondary px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">Erro ao falar com o coach: {error.message}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          placeholder="Escreva sua mensagem..."
          className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
