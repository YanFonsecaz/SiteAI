"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Hammer, FileText, TrendingUp, Settings, LogOut } from "lucide-react";

const sidebarItems = [
  {
    name: "SEO Técnico",
    href: "/dashboard/technical",
    icon: Hammer,
  },
  {
    name: "SEO Conteúdo",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    name: "Google Trends/News",
    href: "/dashboard/trends",
    icon: TrendingUp,
  },
  {
    name: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-primary/10 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="font-display text-2xl font-bold text-foreground tracking-wider">
            SEO<span className="text-primary">.IA</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {sidebarItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted hover:bg-primary/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted group-hover:text-primary")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-muted hover:text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
