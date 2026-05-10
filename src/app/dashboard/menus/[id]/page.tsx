import { notFound } from "next/navigation";
import Link from "next/link";
import { getMenuById } from "@/lib/actions/menus";
import { MenuEditor } from "@/components/dashboard/menu-editor";
import { ChevronLeft, ExternalLink } from "lucide-react";

export default async function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await getMenuById(id);
  if (!menu) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/menus" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{menu.restaurant_name}</h1>
            <p className="text-muted-foreground text-sm">{menu.name}</p>
          </div>
        </div>
        <Link
          href={`/menu/${menu.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border hover:bg-accent transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Menüyü Gör
        </Link>
      </div>

      <MenuEditor menu={menu as any} appUrl={appUrl} />
    </div>
  );
}
