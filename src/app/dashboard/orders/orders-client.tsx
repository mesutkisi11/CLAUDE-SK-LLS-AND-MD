"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/client";
import { UtensilsCrossed } from "lucide-react";

const ORANGE = "#f07c10";
const CREAM = "#f7f3ef";
const CARD = "#1c1107";
const BORDER = "rgba(240,124,16,0.15)";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    next: string | null;
    nextLabel: string | null;
    bg: string;
    color: string;
  }
> = {
  new:       { label: "Yeni",         next: "preparing", nextLabel: "Hazırlanıyor", bg: "rgba(240,124,16,0.15)", color: ORANGE },
  pending:   { label: "Yeni",         next: "preparing", nextLabel: "Hazırlanıyor", bg: "rgba(240,124,16,0.15)", color: ORANGE },
  preparing: { label: "Hazırlanıyor", next: "ready",     nextLabel: "Hazır",        bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  ready:     { label: "Hazır",        next: "delivered", nextLabel: "Teslim Et",    bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  delivered: { label: "Teslim",       next: null,        nextLabel: null,           bg: "rgba(107,114,128,0.15)", color: "#9ca3af" },
};

type OrderItem = {
  id: string;
  item_name: string;
  quantity: number;
  item_price: number;
  note: string | null;
  station: string | null;
};

type Order = {
  id: string;
  table_number: string;
  status: string;
  total_price: number;
  created_at: string;
  order_items: OrderItem[];
  menus: { name: string; restaurant_name: string } | null;
};

function showBrowserNotification(masa: string, items: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(`Yeni Sipariş — Masa ${masa}`, {
      body: items,
      icon: "/favicon.ico",
    });
  }
}

export function OrdersClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [connected, setConnected] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const knownIds = useRef<Set<string>>(new Set(initial.map((o) => o.id)));
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playBeep() {
    try {
      if (
        !audioCtxRef.current ||
        audioCtxRef.current.state === "closed"
      ) {
        const Ctx =
          window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      [0, 0.25].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.4, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + t + 0.2
        );
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.2);
      });
    } catch {}
  }

  function flashOrder(id: string) {
    setFlashIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1000);
  }

  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          if (knownIds.current.has(payload.new.id)) return;
          knownIds.current.add(payload.new.id);

          const { data: newOrder } = await supabase
            .from("orders")
            .select("*, order_items(*), menus(name, restaurant_name)")
            .eq("id", payload.new.id)
            .single();

          if (newOrder) {
            setOrders((prev) => [newOrder as Order, ...prev]);
            flashOrder(newOrder.id);
            playBeep();
            const itemNames =
              (newOrder as Order).order_items
                ?.map((i) => `${i.quantity}x ${i.item_name}`)
                .join(", ") ?? "";
            showBrowserNotification(newOrder.table_number, itemNames);
            toast.success(
              `Masa ${newOrder.table_number} — yeni sipariş!`,
              { duration: 5000 }
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id
                ? { ...o, status: payload.new.status }
                : o
            )
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      audioCtxRef.current?.close();
    };
  }, []);

  function advance(id: string, nextStatus: string) {
    start(async () => {
      await updateOrderStatus(id, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
      );
    });
  }

  const active = orders.filter((o) => o.status !== "delivered");
  const done = orders.filter((o) => o.status === "delivered");

  return (
    <>
      <style>{`
        @keyframes newOrderFlash {
          0%   { border-color: #f07c10; box-shadow: 0 0 12px rgba(240,124,16,0.4); }
          100% { border-color: rgba(240,124,16,0.15); box-shadow: none; }
        }
        .order-flash { animation: newOrderFlash 1s ease-out forwards; }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .dot-pulse { animation: dotPulse 2s infinite; }
      `}</style>

      {/* Connection indicator */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(28,17,7,0.9)",
          border: `1px solid ${BORDER}`,
          borderRadius: "999px",
          padding: "4px 12px",
          backdropFilter: "blur(8px)",
          fontSize: "12px",
        }}
      >
        <span
          className={connected ? "dot-pulse" : ""}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: connected ? "#4ade80" : "#f87171",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span style={{ color: connected ? "#4ade80" : "#f87171" }}>
          {connected ? "Canlı" : "Bağlantı Kesik"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h1
            style={{ fontSize: "1.75rem", fontWeight: 700, color: CREAM }}
          >
            Siparişler
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#8b7355",
              marginTop: "4px",
            }}
          >
            Canlı sipariş takibi
          </p>
        </div>

        {active.length === 0 && done.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "96px 0",
              color: "#8b7355",
              gap: "12px",
              textAlign: "center",
            }}
          >
            <UtensilsCrossed size={48} style={{ opacity: 0.2 }} />
            <p style={{ fontWeight: 500 }}>Henüz sipariş yok</p>
            <p style={{ fontSize: "0.875rem" }}>
              Müşteriler menüden sipariş verdiğinde burada görünür
            </p>
          </div>
        )}

        {active.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: CREAM,
                marginBottom: "16px",
              }}
            >
              Aktif Siparişler ({active.length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {active.map((order) => {
                const s = STATUS_MAP[order.status];
                if (!s) return null;
                const isFlashing = flashIds.has(order.id);
                return (
                  <div
                    key={order.id}
                    className={isFlashing ? "order-flash" : ""}
                    style={{
                      background: CARD,
                      border: `1px solid ${BORDER}`,
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            color: CREAM,
                          }}
                        >
                          Masa {order.table_number}
                        </p>
                        <p style={{ fontSize: "12px", color: "#8b7355" }}>
                          {new Date(order.created_at).toLocaleTimeString(
                            "tr-TR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                      <span
                        style={{
                          background: s.bg,
                          color: s.color,
                          borderRadius: "999px",
                          padding: "2px 10px",
                          fontSize: "11px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* Items by station */}
                    <div
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        paddingTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {(["mutfak", "bar"] as const).map((station) => {
                        const stationItems = order.order_items.filter(
                          (i) => (i.station || "mutfak") === station
                        );
                        if (stationItems.length === 0) return null;
                        return (
                          <div key={station}>
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#8b7355",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {station === "mutfak" ? "Mutfak" : "Bar"}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              {stationItems.map((item) => (
                                <div key={item.id}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "12px",
                                      color: "#8b7355",
                                    }}
                                  >
                                    <span>
                                      • {item.quantity}x {item.item_name}
                                    </span>
                                    <span>
                                      {(
                                        item.item_price * item.quantity
                                      ).toFixed(2)}{" "}
                                      ₺
                                    </span>
                                  </div>
                                  {item.note && (
                                    <p
                                      style={{
                                        fontSize: "11px",
                                        color: "#f59e0b",
                                        background:
                                          "rgba(245,158,11,0.1)",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        marginTop: "2px",
                                      }}
                                    >
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        paddingTop: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: CREAM }}>
                        {Number(order.total_price).toFixed(2)} ₺
                      </span>
                      {s.next && (
                        <button
                          onClick={() => advance(order.id, s.next!)}
                          disabled={pending}
                          style={{
                            border: `1px solid ${ORANGE}`,
                            color: ORANGE,
                            background: "transparent",
                            borderRadius: "999px",
                            padding: "4px 14px",
                            fontSize: "12px",
                            cursor: pending ? "not-allowed" : "pointer",
                            opacity: pending ? 0.5 : 1,
                          }}
                        >
                          {s.nextLabel}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#8b7355",
                marginBottom: "16px",
              }}
            >
              Teslim Edilenler ({done.length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {done.slice(0, 12).map((order) => (
                <div
                  key={order.id}
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: "12px",
                    padding: "12px",
                    opacity: 0.5,
                    fontSize: "13px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500, color: CREAM }}>
                      Masa {order.table_number}
                    </span>
                    <span style={{ color: "#8b7355" }}>
                      {Number(order.total_price).toFixed(2)} ₺
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#8b7355",
                      marginTop: "4px",
                    }}
                  >
                    {order.order_items
                      .map((i) => `${i.quantity}x ${i.item_name}`)
                      .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
