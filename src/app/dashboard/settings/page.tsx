import { createClient } from "@/lib/supabase/server";
import { SettingsForms } from "./settings-forms";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">Hesap ve işletme bilgilerinizi yönetin</p>
      </div>
      <SettingsForms
        fullName={user?.user_metadata?.full_name ?? ""}
        email={user?.email ?? ""}
        businessName={profile?.business_name ?? ""}
        phone={profile?.phone ?? ""}
        address={profile?.address ?? ""}
      />
    </div>
  );
}
