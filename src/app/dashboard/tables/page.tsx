import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TablesClient from "./tables-client";

export default async function TablesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: menu } = await supabase
    .from("menus")
    .select("restaurant_name")
    .limit(1)
    .single();

  const restaurantName = menu?.restaurant_name ?? "Wix Garden";

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#f7f3ef",
          }}
        >
          Masa QR Kodları
        </h1>
        <p style={{ color: "#8b7355", fontSize: "14px", marginTop: "4px" }}>
          Her masa için QR kodu indir veya yazdır
        </p>
      </div>
      <TablesClient restaurantName={restaurantName} />
    </div>
  );
}
