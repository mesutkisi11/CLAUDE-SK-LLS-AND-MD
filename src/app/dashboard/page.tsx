import { createClient } from "@/lib/supabase/server";
import { getAllOrders } from "@/lib/actions/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, QrCode, Settings } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending: "Yeni",
  preparing: "Hazırlanıyor",
  ready: "Hazır",
  delivered: "Teslim",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pending: "default",
  preparing: "secondary",
  ready: "outline",
  delivered: "outline",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0];

  const orders = await getAllOrders();

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o: any) => o.created_at?.startsWith(today));
  const pendingOrders = orders.filter((o: any) => o.status === "pending");
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hoş geldin, {fullName} 👋</h1>
        <p className="text-muted-foreground mt-1">Siparişlerine ve menülerine göz at</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugünkü Siparişler
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayOrders.length === 0 ? "Bugün sipariş yok" : "sipariş alındı"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bekleyen Siparişler
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingOrders.length === 0 ? "Bekleyen sipariş yok" : "işlem bekliyor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Sipariş
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">tüm zamanlar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mb-3 opacity-25" />
                <p className="text-sm">Henüz sipariş yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">Masa {order.table_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.menus?.restaurant_name ?? order.menus?.name} · {order.total_price} TL
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/dashboard/orders", icon: ShoppingBag, title: "Siparişleri Görüntüle", desc: "Mutfak ekranı ve sipariş durumları" },
              { href: "/dashboard/menus", icon: QrCode, title: "QR Menü Yönet", desc: "Menü, kategori ve ürün ekle/düzenle" },
              { href: "/dashboard/settings", icon: Settings, title: "Ayarlar", desc: "İşletme bilgilerini güncelle" },
            ].map(({ href, icon: Icon, title, desc }) => (
              <a key={href} href={href} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
