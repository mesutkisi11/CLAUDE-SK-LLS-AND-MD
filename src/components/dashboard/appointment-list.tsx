"use client";

import { useTransition } from "react";
import { updateAppointmentStatus, deleteAppointment } from "@/lib/actions/appointments";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, Phone, Mail, MoreVertical, Trash2 } from "lucide-react";

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Bekliyor", variant: "outline" },
  confirmed: { label: "Onaylandı", variant: "default" },
  completed: { label: "Tamamlandı", variant: "secondary" },
  cancelled: { label: "İptal", variant: "destructive" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const [isPending, startTransition] = useTransition();

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Calendar className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-base font-medium">Henüz randevu bulunmuyor</p>
          <p className="text-sm mt-2">
            Yeni Randevu butonuna tıklayarak ilk randevuyu ekleyin
          </p>
        </CardContent>
      </Card>
    );
  }

  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    const date = a.appointment_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, appts]) => (
        <div key={date}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(date)}
            <Badge variant="secondary" className="ml-1">{appts.length}</Badge>
          </h2>
          <div className="space-y-3">
            {appts.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{appt.customer_name}</span>
                        <Badge variant={statusConfig[appt.status].variant}>
                          {statusConfig[appt.status].label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(appt.appointment_time)}
                        </span>
                        {appt.services && (
                          <span className="flex items-center gap-1">
                            {appt.services.name} · {appt.services.duration}dk · ₺{appt.services.price}
                          </span>
                        )}
                        {appt.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {appt.customer_phone}
                          </span>
                        )}
                        {appt.customer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {appt.customer_email}
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          Not: {appt.notes}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" disabled={isPending} />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {appt.status !== "confirmed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              startTransition(() =>
                                updateAppointmentStatus(appt.id, "confirmed")
                              )
                            }
                          >
                            Onayla
                          </DropdownMenuItem>
                        )}
                        {appt.status !== "completed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              startTransition(() =>
                                updateAppointmentStatus(appt.id, "completed")
                              )
                            }
                          >
                            Tamamlandı
                          </DropdownMenuItem>
                        )}
                        {appt.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() =>
                              startTransition(() =>
                                updateAppointmentStatus(appt.id, "cancelled")
                              )
                            }
                          >
                            İptal Et
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            startTransition(() => deleteAppointment(appt.id))
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
