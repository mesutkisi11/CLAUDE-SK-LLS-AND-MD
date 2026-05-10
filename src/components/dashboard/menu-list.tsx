"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteMenu } from "@/lib/actions/menus";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, QrCode, Pencil, Trash2, UtensilsCrossed } from "lucide-react";

type Menu = {
  id: string;
  name: string;
  restaurant_name: string;
  slug: string;
  theme_color: string;
  is_active: boolean;
  created_at: string;
};

export function MenuList({ menus }: { menus: Menu[] }) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" menüsünü silmek istediğinize emin misiniz?`)) return;
    await deleteMenu(id);
    router.refresh();
  }

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <UtensilsCrossed className="h-12 w-12 mb-4 opacity-20" />
        <p className="font-medium">Henüz menü yok</p>
        <p className="text-sm mt-1">Yukarıdan yeni bir menü oluşturun</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {menus.map((menu) => (
        <Card key={menu.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-2" style={{ backgroundColor: menu.theme_color }} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-base">{menu.restaurant_name}</h3>
                <p className="text-sm text-muted-foreground">{menu.name}</p>
              </div>
              <Badge variant={menu.is_active ? "default" : "outline"} className="ml-2 shrink-0">
                {menu.is_active ? "Aktif" : "Pasif"}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-4 truncate">
              /menu/{menu.slug}
            </p>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/menus/${menu.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Düzenle
              </Link>
              <Link
                href={`/menu/${menu.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Görüntüle
              </Link>
              <Link
                href={`/dashboard/menus/${menu.id}#qr`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
              >
                <QrCode className="h-3 w-3" />
                QR
              </Link>
              <button
                onClick={() => handleDelete(menu.id, menu.name)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
