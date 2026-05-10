"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createMenu } from "@/lib/actions/menus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

const THEME_COLORS = [
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Kırmızı" },
  { value: "#10b981", label: "Yeşil" },
  { value: "#3b82f6", label: "Mavi" },
  { value: "#8b5cf6", label: "Mor" },
  { value: "#ec4899", label: "Pembe" },
];

export function MenuForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#f59e0b");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    try {
      const fd = new FormData(formRef.current);
      fd.set("theme_color", selectedColor);
      await createMenu(fd);
      setOpen(false);
      formRef.current.reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Yeni Menü
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Yeni Menü Oluştur</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Menü Adı</Label>
                <Input id="name" name="name" placeholder="Yaz Menüsü" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="restaurant_name">Restoran Adı</Label>
                <Input id="restaurant_name" name="restaurant_name" placeholder="Lezzet Cafe" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Açıklama (opsiyonel)</Label>
                <Input id="description" name="description" placeholder="Kısa bir tanıtım..." />
              </div>

              <div className="space-y-2">
                <Label>Tema Rengi</Label>
                <div className="flex gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      className="h-8 w-8 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c.value,
                        borderColor: selectedColor === c.value ? "#000" : "transparent",
                        transform: selectedColor === c.value ? "scale(1.2)" : "scale(1)",
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
