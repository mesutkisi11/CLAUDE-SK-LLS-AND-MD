import { Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hizmetler</h1>
          <p className="text-muted-foreground mt-1">
            Sunduğunuz hizmetleri ve fiyatları tanımlayın
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Hizmet Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hizmet Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Clock className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-base font-medium">Henüz hizmet eklenmedi</p>
            <p className="text-sm mt-2">
              İlk hizmetinizi ekleyerek başlayın — örn. &quot;Saç Kesimi — 30dk — ₺150&quot;
            </p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              İlk Hizmetini Ekle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
