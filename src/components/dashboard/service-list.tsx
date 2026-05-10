"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteService, toggleService } from "@/lib/actions/services";
import type { Service } from "@/lib/types";
import { ServiceForm } from "./service-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";

export function ServiceList({ services }: { services: Service[] }) {
  const [isPending, startTransition] = useTransition();

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Clock className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-base font-medium">Henüz hizmet eklenmedi</p>
          <p className="text-sm mt-2">
            İlk hizmetinizi ekleyin — örn. &quot;Saç Kesimi — 30dk — ₺150&quot;
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card key={service.id} className={service.is_active ? "" : "opacity-60"}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-base">{service.name}</h3>
                {service.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {service.description}
                  </p>
                )}
              </div>
              <Badge
                variant={service.is_active ? "default" : "secondary"}
                className="cursor-pointer shrink-0 ml-2"
                onClick={() =>
                  startTransition(async () => {
                    await toggleService(service.id, !service.is_active);
                    toast.success(service.is_active ? "Hizmet pasif yapıldı" : "Hizmet aktif yapıldı");
                  })
                }
              >
                {service.is_active ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service.duration} dk
              </span>
              <span className="font-semibold text-foreground text-base">
                ₺{Number(service.price).toLocaleString("tr-TR")}
              </span>
            </div>
            <div className="flex gap-2">
              <ServiceForm service={service} />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteService(service.id);
                    toast.success("Hizmet silindi");
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
