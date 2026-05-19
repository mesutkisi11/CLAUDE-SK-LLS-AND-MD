import { createClient } from "@/lib/supabase/server";
import { getAllOrders } from "@/lib/actions/orders";
import { ShoppingBag, Clock, TrendingUp, QrCode, Settings } from "lucide-react";
import Link from "next/link";

const ORANGE = "#f07c10";
const CREAM = "#f7f3ef";
const CARD = "#1c1107";
const BORDER = "rgba(240,124,16,0.15)";

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: "rgba(240,124,16,0.15)",  color: "#f07c10", label: "Yeni" },
  preparing:  { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", label: "Hazırlanıyor" },
  ready:      { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", label: "Hazır" },
  delivered:  { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", label: "Teslim" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fullName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0];

  const orders = await getAllOrders();

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o: any) =>
    o.created_at?.startsWith(today)
  );
  const pendingOrders = orders.filter(
    (o: any) => o.status === "pending" || o.status === "preparing"
  );
  const totalRevenue = orders
    .filter((o: any) => o.status === "delivered")
    .reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Bugünkü Siparişler", value: todayOrders.length, icon: ShoppingBag },
    { label: "Bekleyen", value: pendingOrders.length, icon: Clock },
    { label: "Toplam Gelir", value: `${totalRevenue.toFixed(0)} ₺`, icon: TrendingUp },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: CREAM }}>
          Hoş geldin, {fullName}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#8b7355", marginTop: "4px" }}>
          Siparişlerine ve menülerine göz at
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Icon size={32} style={{ color: ORANGE }} />
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: CREAM,
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8b7355" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Recent orders */}
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: CREAM,
              marginBottom: "16px",
            }}
          >
            Son Siparişler
          </h2>
          {recentOrders.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 0",
                color: "#8b7355",
                gap: "8px",
              }}
            >
              <ShoppingBag size={40} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: "0.875rem" }}>Henüz sipariş yok</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentOrders.map((order: any, idx: number) => {
                const badge =
                  STATUS_BADGE[order.status] ?? STATUS_BADGE.delivered;
                return (
                  <div
                    key={order.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom:
                        idx < recentOrders.length - 1
                          ? `1px solid ${BORDER}`
                          : "none",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: CREAM,
                        }}
                      >
                        Masa {order.table_number}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#8b7355" }}>
                        {order.menus?.restaurant_name ?? order.menus?.name} ·{" "}
                        {order.total_price} ₺
                      </p>
                    </div>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        borderRadius: "999px",
                        padding: "2px 10px",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: CREAM,
              marginBottom: "16px",
            }}
          >
            Hızlı İşlemler
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              {
                href: "/dashboard/orders",
                icon: ShoppingBag,
                title: "Siparişleri Görüntüle",
                desc: "Mutfak ekranı ve sipariş durumları",
              },
              {
                href: "/dashboard/menus",
                icon: QrCode,
                title: "QR Menü Yönet",
                desc: "Menü, kategori ve ürün ekle/düzenle",
              },
              {
                href: "/dashboard/settings",
                icon: Settings,
                title: "Ayarlar",
                desc: "İşletme bilgilerini güncelle",
              },
            ].map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${BORDER}`,
                  textDecoration: "none",
                }}
                className="hover:bg-[rgba(240,124,16,0.08)] transition-colors"
              >
                <Icon size={18} style={{ color: ORANGE, flexShrink: 0 }} />
                <div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: CREAM,
                    }}
                  >
                    {title}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#8b7355" }}>
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
