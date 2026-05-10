"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapmalısınız");

  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) throw new Error(error.message);

  await supabase.from("profiles").upsert({
    user_id: user.id,
    full_name: fullName,
  }, { onConflict: "user_id" });

  revalidatePath("/dashboard/settings");
}

export async function updateBusinessInfo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapmalısınız");

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    business_name: formData.get("business_name") as string || null,
    phone: formData.get("phone") as string || null,
    address: formData.get("address") as string || null,
  }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}
