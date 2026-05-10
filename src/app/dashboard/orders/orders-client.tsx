"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, RefreshCw } from "lucide-react";

const STATUS = {
  new:       { label: "🔴 Yeni",        next: "preparing", nextLabel: "Hazırlanıyor",  variant: "destructive" as const },
  preparing: { label: "🟡 Hazırlanıyor", next: "ready",     nextLabel: "Hazır",        variant: "default" as const },
  ready:     { label: "🟢 Hazır",        next: "delivered", nextLabel: "Teslim Edildi", variant: "secondary" as const },
  delivered: { label: "✓ Teslim",        next: null,        nextLabel: null,            variant: "outline" as const },
};

type OrderItem = { id: string; item_name: string; quantity: number; item_price: number; note: string | null };
type Order = {
  id: string; table_number: string; status: string;
  total_price: number; created_at: string;
  order_items: OrderItem[];
  menus: { restaurant_name: string } | null;
};

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function advance(id: string, nextStatus: string) {
    start(async () => {
      await updateOrderStatus(id, nextStatus);
      toast.success("Durum güncellendi");
      router.refresh();
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
        <Button variant="outline" size="sm" onClick={() => router.refresh()} disabled={pending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
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

                  <div className="space-y-1.5 border-t pt-3">
                    {order.order_items.map((item) => (
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
                  {order.order_items.map(i => `${i.quantity}x ${i.item_name}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
