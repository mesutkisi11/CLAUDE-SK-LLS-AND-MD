import { getServices } from "@/lib/actions/services";
import { ServiceList } from "@/components/dashboard/service-list";
import { ServiceForm } from "@/components/dashboard/service-form";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hizmetler</h1>
          <p className="text-muted-foreground mt-1">
            Sunduğunuz hizmetleri ve fiyatları tanımlayın
          </p>
        </div>
        <ServiceForm />
      </div>
      <ServiceList services={services} />
    </div>
  );
}
