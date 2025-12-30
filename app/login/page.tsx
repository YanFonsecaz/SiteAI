"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const signIn = async (provider: "google" | "azure") => {
    setLoading(provider);
    const supabase = getBrowserSupabase();
    await supabase.auth.signInWithOAuth({
      provider: provider === "google" ? "google" : "azure",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(null);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-surface p-8 rounded-xl border border-primary/10 shadow-sm">
      <h1 className="text-2xl font-display font-bold mb-4 text-foreground">Entrar</h1>
      <p className="text-sm text-muted mb-6">
        Use um provedor confiável para autenticar. E-mails temporários não são permitidos.
      </p>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className={cn("w-full", loading === "google" ? "opacity-50" : "")}
        >
          Entrar com Google
        </Button>
        <Button
          onClick={() => signIn("azure")}
          disabled={loading !== null}
          className={cn("w-full", loading === "azure" ? "opacity-50" : "")}
        >
          Entrar com Microsoft
        </Button>
      </div>
    </div>
  );
}

