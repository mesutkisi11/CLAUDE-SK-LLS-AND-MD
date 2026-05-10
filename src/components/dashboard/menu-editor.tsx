"use client";

import { useState, useTransition } from "react";
import {
  createCategory, updateCategory, deleteCategory,
  createMenuItem, updateMenuItem, deleteMenuItem,
} from "@/lib/actions/menus";
import { QRCodeDownload } from "@/components/qr/QRCode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type Category = {
  id: string;
  name: string;
  menu_items: MenuItem[];
};

type Menu = {
  id: string;
  name: string;
  restaurant_name: string;
  slug: string;
  theme_color: string;
  is_active: boolean;
  menu_categories: Category[];
};

function ItemForm({
  categoryId,
  menuId,
  onDone,
  initial,
}: {
  categoryId: string;
  menuId: string;
  onDone: () => void;
  initial?: MenuItem;
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price?.toString() ?? "",
    image_url: initial?.image_url ?? "",
    is_available: initial?.is_available ?? true,
  });

  function set(k: keyof typeof form, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url,
      is_available: form.is_available,
    };
    start(async () => {
      if (initial) {
        await updateMenuItem(initial.id, menuId, data);
      } else {
        await createMenuItem(categoryId, menuId, data);
      }
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Ürün Adı *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Adana Kebap"
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fiyat (₺) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Durum</Label>
          <select
            value={form.is_available ? "true" : "false"}
            onChange={(e) => set("is_available", e.target.value === "true")}
            className="h-8 w-full rounded-md border bg-background px-2 text-sm"
          >
            <option value="true">Mevcut</option>
            <option value="false">Tükendi</option>
          </select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Açıklama</Label>
          <Input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Kısa açıklama..."
            className="h-8 text-sm"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Görsel URL (opsiyonel)</Label>
          <Input
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://..."
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          <X className="h-3.5 w-3.5 mr-1" />
          İptal
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check className="h-3.5 w-3.5 mr-1" />
          {pending ? "Kaydediliyor..." : initial ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </form>
  );
}

function CategorySection({
  category,
  menuId,
  themeColor,
}: {
  category: Category;
  menuId: string;
  themeColor: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [catName, setCatName] = useState(category.name);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function saveCatName() {
    start(async () => {
      await updateCategory(category.id, catName, menuId);
      setEditingName(false);
    });
  }

  function handleDeleteCat() {
    if (!confirm(`"${category.name}" kategorisini silmek istiyor musunuz?`)) return;
    start(async () => {
      await deleteCategory(category.id, menuId);
    });
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="h-7 text-sm max-w-xs"
              autoFocus
            />
            <button onClick={saveCatName} disabled={pending} className="text-green-600 hover:text-green-700">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => { setEditingName(false); setCatName(category.name); }} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{category.name}</span>
            <span className="text-xs text-muted-foreground">({category.menu_items.length} ürün)</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleDeleteCat}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-2">
          {category.menu_items.map((item) => (
            <div key={item.id}>
              {editingItemId === item.id ? (
                <ItemForm
                  categoryId={category.id}
                  menuId={menuId}
                  initial={item}
                  onDone={() => setEditingItemId(null)}
                />
              ) : (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-sm font-semibold" style={{ color: themeColor }}>
                      ₺{Number(item.price).toFixed(2)}
                    </span>
                    {!item.is_available && (
                      <Badge variant="outline" className="text-xs">Tükendi</Badge>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button
                        onClick={() => setEditingItemId(item.id)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(`"${item.name}" silinsin mi?`)) return;
                          start(async () => {
                            await deleteMenuItem(item.id, menuId);
                          });
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddItem ? (
            <ItemForm
              categoryId={category.id}
              menuId={menuId}
              onDone={() => setShowAddItem(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Ürün Ekle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MenuEditor({ menu, appUrl }: { menu: Menu; appUrl: string }) {
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [pending, start] = useTransition();

  const publicUrl = `${appUrl}/menu/${menu.slug}`;

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    start(async () => {
      await createCategory(menu.id, newCatName.trim());
      setNewCatName("");
      setShowAddCat(false);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kategoriler & Ürünler</h2>
          {!showAddCat && (
            <Button size="sm" variant="outline" onClick={() => setShowAddCat(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Kategori Ekle
            </Button>
          )}
        </div>

        {showAddCat && (
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Kategori adı (örn. Başlangıçlar)"
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={pending || !newCatName.trim()}>
              Ekle
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddCat(false)}>
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        {menu.menu_categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border rounded-lg border-dashed">
            <p className="font-medium">Henüz kategori yok</p>
            <p className="text-sm mt-1">Yukarıdan kategori ekleyerek başlayın</p>
          </div>
        ) : (
          <div className="space-y-4">
            {menu.menu_categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                menuId={menu.id}
                themeColor={menu.theme_color}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4" id="qr">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR Kod</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDownload
              url={publicUrl}
              restaurantName={menu.restaurant_name}
              color={menu.theme_color}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Menü Linki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-3 break-all text-xs font-mono text-muted-foreground">
              {publicUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="mt-2 w-full py-1.5 px-3 rounded-md border text-xs hover:bg-accent transition-colors"
            >
              Kopyala
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Menü Bilgisi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restoran</span>
              <span className="font-medium">{menu.restaurant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durum</span>
              <Badge variant={menu.is_active ? "default" : "outline"}>
                {menu.is_active ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori</span>
              <span className="font-medium">{menu.menu_categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toplam Ürün</span>
              <span className="font-medium">
                {menu.menu_categories.reduce((s, c) => s + c.menu_items.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Renk</span>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: menu.theme_color }} />
                <span className="font-mono text-xs">{menu.theme_color}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
