import { notFound } from "next/navigation";
import { getPublicMenu } from "@/lib/actions/menus";
import { MenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { slug } = await params;
  const { table: tableParam = "" } = await searchParams;
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();

  const categories = (menu.menu_categories as {
    id: string; name: string; sort_order: number; station: string;
    menu_items: { id: string; name: string; description: string | null; price: number; image_url: string | null; is_available: boolean; sort_order: number; options: string | null }[]
  }[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => ({ ...cat, menu_items: cat.menu_items.filter(i => i.is_available).sort((a, b) => a.sort_order - b.sort_order) }));

  const logoUrl = menu.slug?.startsWith("wix-garden") ? "/wix-garden-logo.jpg" : undefined;

  return (
    <MenuClient
      menuId={menu.id}
      restaurantName={menu.restaurant_name}
      description={menu.description ?? ""}
      themeColor={menu.theme_color}
      logoUrl={logoUrl}
      categories={categories}
      initialTable={tableParam}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) return {};
  return {
    title: `${menu.restaurant_name} — Menü`,
    description: menu.description ?? `${menu.restaurant_name} dijital menüsü`,
  };
}
