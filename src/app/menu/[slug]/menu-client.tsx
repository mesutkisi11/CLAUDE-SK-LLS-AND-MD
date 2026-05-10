"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitOrder, type CartItem } from "@/lib/actions/orders";
import { ShoppingCart, Plus, Minus, X, ChevronDown, Send, UtensilsCrossed } from "lucide-react";

type MenuItem = {
  id: string; name: string; description: string | null;
  price: number; image_url: string | null;
  is_available: boolean; sort_order: number;
};
type Category = { id: string; name: string; sort_order: number; menu_items: MenuItem[] };

type CartEntry = CartItem & { key: string };

export function MenuClient({
  menuId, restaurantName, description, themeColor, categories,
}: {
  menuId: string; restaurantName: string; description: string;
  themeColor: string; categories: Category[];
}) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [done, setDone] = useState(false);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.item_price * i.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((e) => e.menu_item_id === item.id);
      if (existing) return prev.map((e) => e.menu_item_id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { key: item.id, menu_item_id: item.id, item_name: item.name, item_price: item.price, quantity: 1, note: "" }];
    });
    toast.success(`${item.name} sepete eklendi`, { duration: 1500 });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((e) => e.menu_item_id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((e) => e.menu_item_id !== itemId);
      return prev.map((e) => e.menu_item_id === itemId ? { ...e, quantity: e.quantity - 1 } : e);
    });
  }

  function deleteFromCart(itemId: string) {
    setCart((prev) => prev.filter((e) => e.menu_item_id !== itemId));
  }

  function saveNote(itemId: string) {
    const note = notes[itemId] ?? "";
    setCart((prev) => prev.map((e) => e.menu_item_id === itemId ? { ...e, note } : e));
    setNoteFor(null);
    if (note) toast.success("Not kaydedildi");
  }

  async function handleOrder() {
    if (!tableNumber.trim()) { toast.error("Masa numarası girin"); return; }
    if (cart.length === 0) { toast.error("Sepet boş"); return; }
    setOrdering(true);
    try {
      await submitOrder(menuId, tableNumber.trim(), cart);
      setDone(true);
      setCart([]);
      setCartOpen(false);
    } catch {
      toast.error("Sipariş gönderilemedi, tekrar deneyin");
    } finally {
      setOrdering(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h1>
        <p className="text-gray-500 mb-6">Mutfağa iletildi. Kısa süre içinde hazırlanacak.</p>
        <button
          onClick={() => setDone(false)}
          className="px-6 py-3 rounded-xl text-white font-medium"
          style={{ backgroundColor: themeColor }}
        >
          Yeni Sipariş Ver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="text-white py-6 px-4 text-center sticky top-0 z-20 shadow-md" style={{ backgroundColor: themeColor }}>
        <h1 className="text-2xl font-bold">{restaurantName}</h1>
        {description && <p className="mt-1 text-white/80 text-sm">{description}</p>}
      </header>

      {/* Kategori nav */}
      {categories.length > 1 && (
        <nav className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto sticky top-[72px] z-10">
          {categories.map((cat) => (
            <a key={cat.id} href={`#cat-${cat.id}`}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{ borderColor: themeColor, color: themeColor }}>
              {cat.name}
            </a>
          ))}
        </nav>
      )}

      {/* Ürünler */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold">{cat.name}</h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-3">
              {cat.menu_items.map((item) => {
                const inCart = cart.find((e) => e.menu_item_id === item.id);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="flex">
                      {item.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover shrink-0" />
                      )}
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-base" style={{ color: themeColor }}>
                            ₺{Number(item.price).toFixed(2)}
                          </span>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(item.id)}
                                className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                style={{ borderColor: themeColor, color: themeColor }}>
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-bold text-sm w-4 text-center">{inCart.quantity}</span>
                              <button onClick={() => addToCart(item)}
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: themeColor }}>
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item)}
                              className="h-8 px-4 rounded-full text-white text-sm font-medium"
                              style={{ backgroundColor: themeColor }}>
                              Ekle
                            </button>
                          )}
                        </div>
                        {inCart && (
                          <button
                            onClick={() => { setNoteFor(item.id); setNotes((p) => ({ ...p, [item.id]: inCart.note || "" })); }}
                            className="mt-1 text-xs text-left underline-offset-2"
                            style={{ color: themeColor }}>
                            {inCart.note ? `Not: ${inCart.note}` : "+ Not ekle (mantar olmasın, iyi pişsin...)"}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Not modal */}
                    {noteFor === item.id && (
                      <div className="border-t p-3 bg-gray-50">
                        <textarea
                          className="w-full text-sm border rounded-lg p-2 resize-none focus:outline-none"
                          rows={2}
                          placeholder="örn: mantar olmasın, et iyi pişsin, az acılı..."
                          value={notes[item.id] ?? ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [item.id]: e.target.value }))}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => saveNote(item.id)}
                            className="px-4 py-1.5 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: themeColor }}>
                            Kaydet
                          </button>
                          <button onClick={() => setNoteFor(null)}
                            className="px-4 py-1.5 rounded-lg border text-sm">
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Menü henüz hazır değil</p>
          </div>
        )}
      </main>

      {/* Sepet butonu */}
      {totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white shadow-2xl font-medium text-sm w-full max-w-sm justify-between"
            style={{ backgroundColor: themeColor }}>
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {totalItems} ürün
            </span>
            <span>₺{totalPrice.toFixed(2)}</span>
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Sepet drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">Sepetim</h2>
              <button onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {cart.map((entry) => (
                <div key={entry.menu_item_id} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{entry.item_name}</p>
                    {entry.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{entry.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold" style={{ color: themeColor }}>
                      ₺{(entry.item_price * entry.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeFromCart(entry.menu_item_id)}
                        className="h-6 w-6 rounded-full border flex items-center justify-center text-xs"
                        style={{ borderColor: themeColor, color: themeColor }}>
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{entry.quantity}</span>
                      <button onClick={() => {
                        const item = categories.flatMap(c => c.menu_items).find(i => i.id === entry.menu_item_id);
                        if (item) addToCart(item);
                      }}
                        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: themeColor }}>
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    <button onClick={() => deleteFromCart(entry.menu_item_id)} className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium shrink-0">Masa No:</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="örn: 5"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ focusRingColor: themeColor } as React.CSSProperties}
                />
              </div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Toplam</span>
                <span style={{ color: themeColor }}>₺{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: themeColor }}>
                <Send className="h-4 w-4" />
                {ordering ? "Gönderiliyor..." : "Siparişi Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
