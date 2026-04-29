import { getAppointments } from "@/lib/actions/appointments";
import { getServices } from "@/lib/actions/services";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { AppointmentForm } from "@/components/dashboard/appointment-form";

export default async function AppointmentsPage() {
  const [appointments, services] = await Promise.all([
    getAppointments(),
    getServices(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Randevular</h1>
          <p className="text-muted-foreground mt-1">
            Tüm randevularınızı yönetin
          </p>
        </div>
        <AppointmentForm services={services} />
      </div>
      <AppointmentList appointments={appointments} />
    </div>
  );
}
