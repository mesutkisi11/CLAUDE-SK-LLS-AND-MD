"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Settings, LogOut, LayoutDashboard, QrCode } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Randevular", icon: Calendar },
  { href: "/dashboard/services", label: "Hizmetler", icon: Clock },
  { href: "/dashboard/menus", label: "QR Menüler", icon: QrCode },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const fullName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "K";
  const initials = fullName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">RandevuPro</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
