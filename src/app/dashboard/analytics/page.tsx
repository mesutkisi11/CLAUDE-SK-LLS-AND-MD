import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  BarChart2,
  ShoppingBag,
  Receipt,
} from "lucide-react";

const ORANGE = "#f07c10";
const CREAM = "#f7f3ef";
const CARD = "#1c1107";
const BORDER = "rgba(240,124,16,0.15)";
const DIM = "#8b7355";

type OrderItem = { item_name: string; quantity: number };
type RawOrder = {
  id: string;
  created_at: string;
  total_price: number | null;
  status: string | null;
  table_number: string | null;
  order_items: OrderItem[] | null;
};

function toIstanbul(dateStr: string): Date {
  return new Date(
    new Date(dateStr).toLocaleString("en-US", { timeZone: "Europe/Istanbul" })
  );
}

function isToday(dateStr: string): boolean {
  const d = toIstanbul(dateStr);
  const now = toIstanbul(new Date().toISOString());
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isLast7Days(dateStr: string): boolean {
  const d = toIstanbul(dateStr).getTime();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return d >= cutoff;
}

function fmt(n: number): string {
  return n.toLocaleString("tr-TR");
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, total_price, status, table_number, order_items(item_name, quantity)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) console.error("Analytics fetch error:", error.message);

  const orders = (data as RawOrder[] | null) ?? [];

  const delivered = orders.filter((o) => o.status === "delivered");

  const todayRevenue = delivered
    .filter((o) => isToday(o.created_at))
    .reduce((sum, o) => sum + (o.total_price ?? 0), 0);

  const weekRevenue = delivered
    .filter((o) => isLast7Days(o.created_at))
    .reduce((sum, o) => sum + (o.total_price ?? 0), 0);

  const totalOrders = orders.length;

  const avgOrderValue =
    delivered.length > 0
      ? delivered.reduce((sum, o) => sum + (o.total_price ?? 0), 0) /
        delivered.length
      : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
    const key = d.toDateString();
    const revenue = delivered
      .filter((o) => toIstanbul(o.created_at).toDateString() === key)
      .reduce((sum, o) => sum + (o.total_price ?? 0), 0);
    return { date: label, revenue };
  });

  const itemCounts: Record<string, number> = {};
  for (const order of orders) {
    for (const item of order.order_items ?? []) {
      itemCounts[item.item_name] =
        (itemCounts[item.item_name] ?? 0) + item.quantity;
    }
  }
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const hourCounts: Record<number, number> = {};
  for (const order of orders) {
    const h = toIstanbul(order.created_at).getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  const hourlyDist = Array.from({ length: 16 }, (_, i) => {
    const h = i + 8;
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      count: hourCounts[h] ?? 0,
    };
  });

  const tableMap: Record<string, { count: number; revenue: number }> = {};
  for (const order of orders) {
    const t = order.table_number ?? "?";
    if (!tableMap[t]) tableMap[t] = { count: 0, revenue: 0 };
    tableMap[t].count += 1;
    tableMap[t].revenue += order.total_price ?? 0;
  }
  const tableActivity = Object.entries(tableMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([table, v]) => ({ table, ...v }));

  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);
  const maxItemCount = Math.max(...topItems.map((i) => i.count), 1);
  const maxHour = Math.max(...hourlyDist.map((h) => h.count), 1);

  const stats = [
    { label: "Bugünkü Gelir", value: `${fmt(Math.round(todayRevenue))} ₺`, icon: TrendingUp },
    { label: "Haftalık Gelir", value: `${fmt(Math.round(weekRevenue))} ₺`, icon: BarChart2 },
    { label: "Toplam Sipariş", value: fmt(totalOrders), icon: ShoppingBag },
    { label: "Ort. Sipariş Tutarı", value: `${fmt(Math.round(avgOrderValue))} ₺`, icon: Receipt },
  ];

  const panelStyle: React.CSSProperties = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: "16px",
    padding: "24px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: CREAM }}>
          Analitik
        </h1>
        <p style={{ fontSize: "14px", color: DIM, marginTop: "4px" }}>
          Satış ve sipariş istatistikleri
        </p>
      </div>

      {/* BÖLÜM 1 — 4 Stat Kartı */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} style={panelStyle}>
            <Icon size={28} style={{ color: ORANGE }} />
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: CREAM,
                marginTop: "12px",
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: "0.75rem", color: DIM, marginTop: "6px" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* BÖLÜM 2 — Haftalık Gelir + Top Ürünler */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={panelStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: CREAM, marginBottom: "16px" }}>
            Son 7 Gün Geliri
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {last7Days.map((day) => (
              <div
                key={day.date}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{ fontSize: "12px", color: DIM, minWidth: "48px", flexShrink: 0 }}
                >
                  {day.date}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "10px",
                    background: "rgba(240,124,16,0.1)",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(3, (day.revenue / maxRevenue) * 100)}%`,
                      background: ORANGE,
                      borderRadius: "5px",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: CREAM,
                    textAlign: "right",
                    minWidth: "60px",
                    flexShrink: 0,
                  }}
                >
                  {fmt(Math.round(day.revenue))} ₺
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: CREAM, marginBottom: "16px" }}>
            En Çok Sipariş Edilen Ürünler
          </h2>
          {topItems.length === 0 ? (
            <p style={{ fontSize: "13px", color: DIM }}>Henüz veri yok</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topItems.map((item) => (
                <div
                  key={item.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: DIM,
                      minWidth: "100px",
                      flexShrink: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "120px",
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "10px",
                      background: "rgba(240,124,16,0.1)",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(3, (item.count / maxItemCount) * 100)}%`,
                        background: "rgba(240,124,16,0.7)",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: CREAM,
                      textAlign: "right",
                      minWidth: "52px",
                      flexShrink: 0,
                    }}
                  >
                    {item.count} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BÖLÜM 3 — Saatlik Dağılım + Masa Aktivitesi */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={panelStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: CREAM, marginBottom: "16px" }}>
            Saatlik Sipariş Dağılımı
          </h2>
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "6px",
                minWidth: "fit-content",
                height: "80px",
              }}
            >
              {hourlyDist.map((h) => (
                <div
                  key={h.hour}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    width: "28px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: `${Math.max(4, (h.count / maxHour) * 60)}px`,
                      background: ORANGE,
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "9px",
                      color: DIM,
                      whiteSpace: "nowrap",
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                    }}
                  >
                    {h.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: CREAM, marginBottom: "16px" }}>
            Masa Aktivitesi (Top 5)
          </h2>
          {tableActivity.length === 0 ? (
            <p style={{ fontSize: "13px", color: DIM }}>Henüz veri yok</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Masa", "Sipariş", "Gelir"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: "11px",
                        color: DIM,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        paddingBottom: "8px",
                        textAlign: h === "Gelir" ? "right" : "left",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableActivity.map((row) => (
                  <tr
                    key={row.table}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <td style={{ padding: "10px 0" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "rgba(240,124,16,0.15)",
                          color: ORANGE,
                          borderRadius: "999px",
                          padding: "2px 10px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {row.table}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        fontSize: "14px",
                        color: CREAM,
                      }}
                    >
                      {row.count}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        fontSize: "14px",
                        color: CREAM,
                        textAlign: "right",
                      }}
                    >
                      {fmt(Math.round(row.revenue))} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
