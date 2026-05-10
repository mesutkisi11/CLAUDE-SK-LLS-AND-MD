"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function fillDemo() {
    setEmail("demo@randevupro.com");
    setPassword("Demo1234");
  }

  return (
    <div className="space-y-4">
      {/* Demo kutusu */}
      <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 space-y-2">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">Demo Hesabı</p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>📧 <span className="font-mono">demo@randevupro.com</span></p>
          <p>🔑 <span className="font-mono">Demo1234</span></p>
        </div>
        <button
          type="button"
          onClick={fillDemo}
          className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Demo ile Hızlı Giriş
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="siz@örnek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Şifre</Label>
            <Link
              href="/reset-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
            >
              Şifremi unuttum
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </div>
  );
}
