import { getMenus } from "@/lib/actions/menus";
import { MenuForm } from "@/components/dashboard/menu-form";
import { MenuList } from "@/components/dashboard/menu-list";

export default async function MenusPage() {
  const menus = await getMenus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Menüler</h1>
          <p className="text-muted-foreground mt-1">
            Restoranınız için dijital menü oluşturun ve QR kod paylaşın
          </p>
        </div>
        <MenuForm />
      </div>
      <MenuList menus={menus} />
    </div>
  );
}
