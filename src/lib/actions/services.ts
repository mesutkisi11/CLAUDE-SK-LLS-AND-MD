"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getServices() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase.from("services").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    duration: Number(formData.get("duration")),
    price: Number(formData.get("price")),
    description: formData.get("description") as string || null,
  });

  revalidatePath("/dashboard/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase
    .from("services")
    .update({
      name: formData.get("name") as string,
      duration: Number(formData.get("duration")),
      price: Number(formData.get("price")),
      description: formData.get("description") as string || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/services");
}

export async function toggleService(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapılmamış");

  await supabase
    .from("services")
    .update({ is_active })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/services");
}
