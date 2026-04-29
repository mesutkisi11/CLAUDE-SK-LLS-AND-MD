import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Randevular</h1>
          <p className="text-muted-foreground mt-1">Tüm randevularınızı yönetin</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Yeni Randevu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Randevu Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Calendar className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-base font-medium">Henüz randevu bulunmuyor</p>
            <p className="text-sm mt-2">
              Supabase bağlandıktan sonra randevularınız burada görünecek
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
