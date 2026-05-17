"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Wifi } from "lucide-react";

const STATUS = {
  new:       { label: "🔴 Yeni",         next: "preparing", nextLabel: "Hazırlanıyor", variant: "destructive" as const },
  pending:   { label: "🔴 Yeni",         next: "preparing", nextLabel: "Hazırlanıyor", variant: "destructive" as const },
  preparing: { label: "🟡 Hazırlanıyor", next: "ready",     nextLabel: "Hazır",        variant: "default"     as const },
  ready:     { label: "🟢 Hazır",        next: "delivered", nextLabel: "Teslim Edildi", variant: "secondary"  as const },
  delivered: { label: "✓ Teslim",        next: null,        nextLabel: null,            variant: "outline"    as const },
};

type OrderItem = { id: string; item_name: string; quantity: number; item_price: number; note: string | null; station: string | null };
type Order = {
  id: string; table_number: string; status: string;
  total_price: number; created_at: string;
  order_items: OrderItem[];
  menus: { name: string; restaurant_name: string } | null;
};

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.25].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.2);
    });
  } catch {}
}

function showBrowserNotification(masa: string, items: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(`🛎️ Yeni Sipariş — Masa ${masa}`, {
      body: items,
      icon: "/favicon.ico",
    });
  }
}

export function OrdersClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [connected, setConnected] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const knownIds = useState<Set<string>>(() => new Set(initial.map(o => o.id)))[0];

  // Server refresh sonrası yeni siparişleri yakala, bip çal
  useEffect(() => {
    const newOrders = initial.filter(o => !knownIds.has(o.id));
    if (newOrders.length > 0) {
      newOrders.forEach(o => {
        knownIds.add(o.id);
        playBeep();
        const itemNames = o.order_items.map(i => `${i.quantity}x ${i.item_name}`).join(", ");
        showBrowserNotification(o.table_number, itemNames);
        toast.success(`🛎️ Masa ${o.table_number} — yeni sipariş!`, { duration: 5000 });
      });
    }
    setOrders(initial);
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  // Her 8 saniyede bir server'dan güncel veri çek
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 8000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
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
          const { data: newOrder } = await supabase
            .from("orders")
            .select("*, order_items(*), menus(name, restaurant_name)")
            .eq("id", payload.new.id)
            .single();

          if (newOrder) {
            setOrders((prev) => [newOrder as Order, ...prev]);
            playBeep();
            const itemNames = (newOrder as any).order_items
              ?.map((i: OrderItem) => `${i.quantity}x ${i.item_name}`)
              .join(", ") ?? "";
            showBrowserNotification(newOrder.table_number, itemNames);
            toast.success(`🛎️ Masa ${newOrder.table_number} — yeni sipariş!`, { duration: 5000 });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, status: payload.new.status } : o
            )
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Siparişler</h1>
          <p className="text-muted-foreground mt-1">Canlı sipariş takibi</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wifi className={`h-4 w-4 ${connected ? "text-green-500" : "text-gray-300"}`} />
          <span className={connected ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {connected ? "Canlı bağlantı aktif" : "Bağlanıyor..."}
          </span>
        </div>
      </div>

      {active.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <UtensilsCrossed className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">Henüz sipariş yok</p>
          <p className="text-sm mt-1">Müşteriler menüden sipariş verdiğinde burada görünür</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Aktif Siparişler ({active.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((order) => {
              const s = STATUS[order.status as keyof typeof STATUS];
              if (!s) return null;
              return (
                <div key={order.id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">Masa {order.table_number}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>

                  <div className="border-t pt-3 space-y-3">
                    {(["mutfak", "bar"] as const).map((station) => {
                      const stationItems = order.order_items.filter((i) => (i.station || "mutfak") === station);
                      if (stationItems.length === 0) return null;
                      return (
                        <div key={station}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                            {station === "mutfak" ? "🍽️ Mutfak" : "🍹 Bar"}
                          </p>
                          <div className="space-y-1.5">
                            {stationItems.map((item) => (
                              <div key={item.id} className="text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">{item.quantity}x {item.item_name}</span>
                                  <span className="text-muted-foreground">₺{(item.item_price * item.quantity).toFixed(2)}</span>
                                </div>
                                {item.note && (
                                  <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-0.5 mt-0.5 italic">
                                    ⚠️ {item.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-bold">₺{Number(order.total_price).toFixed(2)}</span>
                    {s.next && (
                      <Button size="sm" onClick={() => advance(order.id, s.next!)} disabled={pending}>
                        {s.nextLabel}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Teslim Edilenler ({done.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {done.slice(0, 12).map((order) => (
              <div key={order.id} className="border rounded-xl p-3 opacity-60 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Masa {order.table_number}</span>
                  <span className="text-muted-foreground">₺{Number(order.total_price).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.order_items.map((i) => `${i.quantity}x ${i.item_name}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
