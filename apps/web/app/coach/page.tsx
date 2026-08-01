"use client";

import { Sidebar } from "@/components/sidebar";
import { CoachChat } from "@/components/coach-chat";

export default function CoachPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Coach IA</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Converse com seu mentor comercial, com base no seu histórico de calls
          </p>
        </header>
        <div className="h-[calc(100vh-12rem)]">
          <CoachChat />
        </div>
      </main>
    </div>
  );
}
