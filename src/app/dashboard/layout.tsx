import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "#0f0a06" }}
    >
      <Sidebar user={user} />
      <main
        style={{ background: "#0f0a06", padding: "24px", minHeight: "100vh" }}
        className="flex-1 md:ml-16 pt-20 md:pt-6"
      >
        {children}
      </main>
    </div>
  );
}
