"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getMenus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("menus")
    .select("*, menu_categories(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getMenuById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menus")
    .select(`
      *,
      menu_categories (
        id, name, sort_order,
        menu_items (id, name, description, price, image_url, is_available, sort_order)
      )
    `)
    .eq("id", id)
    .order("sort_order", { referencedTable: "menu_categories" })
    .single();

  return data;
}

export async function getPublicMenu(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menus")
    .select(`
      *,
      menu_categories (
        id, name, sort_order,
        menu_items (id, name, description, price, image_url, is_available, sort_order)
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "menu_categories" })
    .single();

  return data;
}

export async function createMenu(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapmalısınız");

  const restaurantName = formData.get("restaurant_name") as string;
  const slug = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s]/g, "")
    .replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c")
    .replace(/\s+/g, "-")
    .slice(0, 50) + "-" + Date.now().toString(36);

  const { error } = await supabase.from("menus").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    slug,
    restaurant_name: restaurantName,
    description: formData.get("description") as string || null,
    theme_color: formData.get("theme_color") as string || "#f59e0b",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menus");
}

export async function updateMenu(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("menus").update({
    name: formData.get("name") as string,
    restaurant_name: formData.get("restaurant_name") as string,
    description: formData.get("description") as string || null,
    theme_color: formData.get("theme_color") as string,
    is_active: formData.get("is_active") === "true",
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menus");
  revalidatePath(`/dashboard/menus/${id}`);
}

export async function deleteMenu(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menus");
}

export async function createCategory(menuId: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("menu_categories").insert({
    menu_id: menuId,
    name,
    sort_order: 0,
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
  return data;
}

export async function updateCategory(id: string, name: string, menuId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function deleteCategory(id: string, menuId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function createMenuItem(
  categoryId: string,
  menuId: string,
  data: { name: string; description: string; price: number; image_url: string }
) {
  const supabase = await createClient();
  const { data: item, error } = await supabase.from("menu_items").insert({
    category_id: categoryId,
    name: data.name,
    description: data.description || null,
    price: data.price,
    image_url: data.image_url || null,
    is_available: true,
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
  return item;
}

export async function updateMenuItem(
  id: string,
  menuId: string,
  data: { name: string; description: string; price: number; image_url: string; is_available: boolean }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").update({
    name: data.name,
    description: data.description || null,
    price: data.price,
    image_url: data.image_url || null,
    is_available: data.is_available,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function deleteMenuItem(id: string, menuId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/menus/${menuId}`);
}
