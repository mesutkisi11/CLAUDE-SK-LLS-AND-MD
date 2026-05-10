"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createAppointment } from "@/lib/actions/appointments";
import type { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus } from "lucide-react";

export function AppointmentForm({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    if (serviceId) formData.set("service_id", serviceId);
    else formData.delete("service_id");
    startTransition(async () => {
      try {
        await createAppointment(formData);
        toast.success("Randevu oluşturuldu");
        setOpen(false);
        setServiceId(null);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <CalendarPlus className="h-4 w-4 mr-2" />
        Yeni Randevu
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Ekle</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Müşteri Adı</Label>
            <Input
              id="customer_name"
              name="customer_name"
              placeholder="Ad Soyad"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                placeholder="+90 555 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">E-posta</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                placeholder="müşteri@email.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hizmet</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Hizmet seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {services.filter((s) => s.is_active).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.duration}dk — ₺{s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Tarih</Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                min={today}
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Saat</Label>
              <Input
                id="appointment_time"
                name="appointment_time"
                type="time"
                defaultValue="09:00"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Not (opsiyonel)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Müşteri notu..."
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Randevu Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
