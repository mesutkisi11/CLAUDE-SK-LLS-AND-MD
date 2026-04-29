"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/types";

export async function getAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("appointments")
    .select("*, services(name, duration, price)")
    .eq("user_id", user.id)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  return data ?? [];
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { today: 0, thisWeek: 0, customers: 0 };

  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const [{ count: todayCount }, { count: weekCount }, { count: customerCount }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("appointment_date", today)
        .neq("status", "cancelled"),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("appointment_date", weekStartStr)
        .neq("status", "cancelled"),
      supabase
        .from("appointments")
        .select("customer_name", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  return {
    today: todayCount ?? 0,
    thisWeek: weekCount ?? 0,
    customers: customerCount ?? 0,
  };
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  const service_id = formData.get("service_id") as string;

  await supabase.from("appointments").insert({
    user_id: user.id,
    service_id: service_id || null,
    customer_name: formData.get("customer_name") as string,
    customer_phone: formData.get("customer_phone") as string || null,
    customer_email: formData.get("customer_email") as string || null,
    appointment_date: formData.get("appointment_date") as string,
    appointment_time: formData.get("appointment_time") as string,
    notes: formData.get("notes") as string || null,
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}
