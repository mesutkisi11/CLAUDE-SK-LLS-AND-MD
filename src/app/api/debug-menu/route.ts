import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "ENV VARS MISSING", url: !!url, key: !!key });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("menus")
    .select("id, slug, is_active, restaurant_name")
    .eq("slug", "demo-restoran")
    .single();

  return NextResponse.json({ data, error: error?.message ?? null, url_set: !!url, key_set: !!key });
}
