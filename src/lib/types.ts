export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  user_id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Appointment = {
  id: string;
  user_id: string;
  service_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  services?: Pick<Service, "name" | "duration" | "price"> | null;
};
