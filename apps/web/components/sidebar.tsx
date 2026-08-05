"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, Sparkles, Target, FileText, Settings, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/meetings", label: "Calls", icon: Phone },
  { href: "/coach", label: "Coach IA", icon: Sparkles },
  { href: "/prospection", label: "Prospecção", icon: Target },
  { href: "/reports", label: "Relatórios", icon: FileText },
  { href: "/settings", label: "Config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-16 flex flex-col items-center py-4 border-r border-border bg-card">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
        AI
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                active ? "bg-accent text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title="Sair"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </aside>
  );
}
