"use server";

import { createClient as createDirectClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function serviceClient() {
  return createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type CartItem = {
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  note: string;
  station: string;
};

export async function submitOrder(
  menuId: string,
  tableNumber: string,
  items: CartItem[]
) {
  const supabase = serviceClient();

  const total = items.reduce((s, i) => s + i.item_price * i.quantity, 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ menu_id: menuId, table_number: tableNumber, total_price: total })
    .select()
    .single();

  if (orderErr) throw new Error(orderErr.message);

  const { error: itemsErr } = await supabase.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menu_item_id,
      item_name: i.item_name,
      item_price: i.item_price,
      quantity: i.quantity,
      note: i.note || null,
      station: i.station || "mutfak",
    }))
  );

  if (itemsErr) throw new Error(itemsErr.message);
  return order.id;
}

export async function getOrders(menuId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("menu_id", menuId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/orders");
}

export async function getAllOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select(`*, order_items(*), menus(name, restaurant_name)`)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}
