import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getAppointments } from "@/lib/actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0];

  const [stats, appointments] = await Promise.all([
    getDashboardStats(),
    getAppointments(),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments
    .filter((a) => a.appointment_date >= today && a.status !== "cancelled")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hoş geldin, {fullName} 👋</h1>
        <p className="text-muted-foreground mt-1">Bugünün randevu özetine göz at</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugünkü Randevular
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.today === 0 ? "Bugün randevu yok" : "randevu var"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bu Hafta
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">toplam randevu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Müşteri
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground mt-1">kayıtlı randevu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mb-3 opacity-25" />
                <p className="text-sm">Yaklaşan randevu yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{appt.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appt.appointment_date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · {formatTime(appt.appointment_time)}
                        {appt.services && ` · ${appt.services.name}`}
                      </p>
                    </div>
                    <Badge variant={appt.status === "confirmed" ? "default" : "outline"}>
                      {appt.status === "confirmed" ? "Onaylandı" : "Bekliyor"}
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
              { href: "/dashboard/appointments", icon: Calendar, title: "Randevu Ekle", desc: "Manuel randevu oluştur" },
              { href: "/dashboard/services", icon: TrendingUp, title: "Hizmet Ekle", desc: "Sunduğunuz hizmetleri tanımlayın" },
              { href: "/dashboard/settings", icon: Users, title: "Profili Düzenle", desc: "İşletme bilgilerinizi güncelleyin" },
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
