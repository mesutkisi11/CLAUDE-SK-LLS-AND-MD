"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ShoppingBag,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

const ORANGE = "#f07c10";
const CARD = "#1c1107";
const CREAM = "#f7f3ef";
const BORDER = "rgba(240,124,16,0.15)";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Siparişler", icon: ShoppingBag },
  { href: "/dashboard/menus", label: "QR Menüler", icon: QrCode },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
];

function NavLinks({
  expanded,
  pathname,
  onClose,
}: {
  expanded: boolean;
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <nav
      style={{
        flex: 1,
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        overflow: "hidden",
      }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "48px",
              padding: "0 16px",
              borderRadius: "8px",
              borderLeft: isActive
                ? `3px solid ${ORANGE}`
                : "3px solid transparent",
              color: isActive ? ORANGE : "#8b7355",
              background: isActive ? "rgba(240,124,16,0.08)" : "transparent",
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <Icon
              size={20}
              style={{ flexShrink: 0, color: isActive ? ORANGE : CREAM }}
            />
            <span
              style={{
                opacity: expanded ? 1 : 0,
                transition: "opacity 150ms",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          color: CREAM,
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 50,
          padding: "6px",
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: "8px",
          cursor: "pointer",
        }}
        className="md:hidden"
        aria-label="Menü"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay + sidebar */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "220px",
              background: CARD,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                borderBottom: `1px solid ${BORDER}`,
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Image
                src="/wix-garden-logo.jpg"
                alt="Wix Garden"
                width={40}
                height={40}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <button
                onClick={() => setMobileOpen(false)}
                style={{ color: CREAM, cursor: "pointer", background: "none", border: "none" }}
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks expanded pathname={pathname} onClose={() => setMobileOpen(false)} />
            <div
              style={{
                borderTop: `1px solid ${BORDER}`,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <button
                onClick={handleLogout}
                style={{ color: CREAM, cursor: "pointer", background: "none", border: "none", flexShrink: 0 }}
                title="Çıkış Yap"
              >
                <LogOut size={18} />
              </button>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8b7355",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100%",
          width: hovered ? "220px" : "64px",
          background: CARD,
          borderRight: `1px solid ${BORDER}`,
          transition: "width 200ms ease",
          overflow: "hidden",
          zIndex: 50,
          flexDirection: "column",
        }}
        className="hidden md:flex"
      >
        <div
          style={{
            borderBottom: `1px solid ${BORDER}`,
            padding: "12px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Link href="/dashboard">
            <Image
              src="/wix-garden-logo.jpg"
              alt="Wix Garden"
              width={40}
              height={40}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </Link>
        </div>

        <NavLinks expanded={hovered} pathname={pathname} />

        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={handleLogout}
            style={{ color: CREAM, flexShrink: 0, cursor: "pointer", background: "none", border: "none" }}
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
          <p
            style={{
              fontSize: "11px",
              color: "#8b7355",
              opacity: hovered ? 1 : 0,
              transition: "opacity 150ms",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </p>
        </div>
      </aside>
    </>
  );
}
