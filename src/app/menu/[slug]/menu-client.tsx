"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { submitOrder, type CartItem } from "@/lib/actions/orders";
import { ShoppingCart, Plus, Minus, X, Send, UtensilsCrossed } from "lucide-react";

type MenuItem = {
  id: string; name: string; description: string | null;
  price: number; image_url: string | null;
  is_available: boolean; sort_order: number;
  options: string | null;
};
type Category = { id: string; name: string; sort_order: number; station: string; menu_items: MenuItem[] };
type CartEntry = CartItem & { key: string };

function fmt(n: number) {
  return n % 1 === 0
    ? `${n.toLocaleString("tr-TR")} ₺`
    : `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

export function MenuClient({
  menuId, restaurantName, description, themeColor, categories,
}: {
  menuId: string; restaurantName: string; description: string;
  themeColor: string; categories: Category[];
}) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [done, setDone] = useState(false);
  const [activeCat, setActiveCat] = useState<string>(() => categories[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.item_price * i.quantity, 0);

  function addToCart(item: MenuItem, station = "mutfak") {
    setCart((prev) => {
      const existing = prev.find((e) => e.menu_item_id === item.id);
      if (existing) return prev.map((e) => e.menu_item_id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { key: item.id, menu_item_id: item.id, item_name: item.name, item_price: item.price, quantity: 1, note: "", station }];
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

  function selectCat(id: string) {
    setActiveCat(id);
    // Seçili butonu nav'ın ortasına kaydır
    const btn = navRef.current?.querySelector(`[data-cat="${id}"]`) as HTMLElement;
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <button onClick={() => setDone(false)} className="px-6 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: themeColor }}>
          Yeni Sipariş Ver
        </button>
      </div>
    );
  }

  const currentCat = categories.find(c => c.id === activeCat);

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: totalItems > 0 ? "100px" : "32px" }}>

      {/* Header — sabit yükseklik */}
      <header
        className="text-white px-4 text-center sticky top-0 z-20 shadow-md flex flex-col items-center justify-center"
        style={{ backgroundColor: themeColor, minHeight: "64px" }}
      >
        <h1 className="text-xl font-bold leading-tight">{restaurantName}</h1>
        {description && <p className="text-white/80 text-xs mt-0.5">{description}</p>}
      </header>

      {/* Kategori nav — header hemen altında, sticky */}
      {categories.length > 1 && (
        <nav
          ref={navRef}
          className="bg-white border-b sticky z-10 flex gap-2 overflow-x-auto px-3 py-2"
          style={{ top: "64px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        >
          {categories.map((cat) => {
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => selectCat(cat.id)}
                className="shrink-0 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap"
                style={{
                  minHeight: "40px",
                  padding: "0 16px",
                  ...(isActive
                    ? { backgroundColor: themeColor, borderColor: themeColor, color: "#fff" }
                    : { backgroundColor: "#fff", borderColor: themeColor, color: themeColor }),
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      )}

      {/* Ürünler — sadece aktif kategori */}
      <main className="max-w-2xl mx-auto px-3 py-4">
        {categories.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Menü henüz hazır değil</p>
          </div>
        )}

        {currentCat && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base font-bold text-gray-800">{currentCat.name}</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{currentCat.menu_items.length} ürün</span>
            </div>

            <div className="space-y-3">
              {currentCat.menu_items.map((item) => {
                const inCart = cart.find((e) => e.menu_item_id === item.id);
                const itemOptions = item.options ? item.options.split(",").map(o => o.trim()).filter(Boolean) : [];
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="flex">
                      {item.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover shrink-0" />
                      )}
                      <div className="flex-1 p-3 min-w-0">
                        <p className="font-semibold text-gray-900 leading-snug text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className="font-extrabold text-lg shrink-0" style={{ color: themeColor }}>
                            {fmt(Number(item.price))}
                          </span>
                          {inCart ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 rounded-full border flex items-center justify-center"
                                style={{ borderColor: themeColor, color: themeColor }}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="font-bold text-base w-5 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => addToCart(item, currentCat.station)}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: themeColor }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item, currentCat.station)}
                              className="h-9 px-5 rounded-full text-white text-sm font-semibold shrink-0"
                              style={{ backgroundColor: themeColor }}
                            >
                              Ekle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seçenekler + Not — sepete eklenince açılır */}
                    {inCart && (
                      <div className="border-t bg-gray-50 px-3 py-3 space-y-3">
                        {itemOptions.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Nasıl hazırlansın?</p>
                            <div className="flex flex-wrap gap-2">
                              {itemOptions.map((opt) => {
                                const active = (selectedOptions[item.id] ?? []).includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      const current = selectedOptions[item.id] ?? [];
                                      const updated = current.includes(opt)
                                        ? current.filter(o => o !== opt)
                                        : [...current, opt];
                                      setSelectedOptions(prev => ({ ...prev, [item.id]: updated }));
                                      const freeNote = notes[item.id] ?? "";
                                      const note = [updated.join(", "), freeNote].filter(Boolean).join(" | ");
                                      setCart(prev => prev.map(e => e.menu_item_id === item.id ? { ...e, note } : e));
                                    }}
                                    className="px-3 py-2 rounded-full text-sm font-medium border transition-colors"
                                    style={active
                                      ? { backgroundColor: themeColor, borderColor: themeColor, color: "#fff" }
                                      : { backgroundColor: "#fff", borderColor: "#d1d5db", color: "#374151" }
                                    }
                                  >
                                    {active ? "✓ " : ""}{opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Özel istek / not</p>
                          <textarea
                            className="w-full text-sm border rounded-xl p-2.5 resize-none focus:outline-none bg-white"
                            rows={2}
                            placeholder="örn: mantar olmasın, et iyi pişsin..."
                            value={notes[item.id] ?? ""}
                            onChange={(e) => {
                              const freeNote = e.target.value;
                              setNotes(prev => ({ ...prev, [item.id]: freeNote }));
                              const opts = selectedOptions[item.id] ?? [];
                              const note = [opts.join(", "), freeNote].filter(Boolean).join(" | ");
                              setCart(prev => prev.map(en => en.menu_item_id === item.id ? { ...en, note } : en));
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Sepet butonu — sabit altta */}
      {totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-30 px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-white shadow-2xl font-semibold text-sm w-full max-w-sm"
            style={{ backgroundColor: themeColor }}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">{totalItems}</span>
              Sepeti Gör
            </span>
            <span className="font-extrabold text-base">{fmt(totalPrice)}</span>
          </button>
        </div>
      )}

      {/* Sepet drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="font-bold text-lg">Sepetim</h2>
              <button onClick={() => setCartOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
              {cart.map((entry) => (
                <div key={entry.menu_item_id} className="flex items-start gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{entry.item_name}</p>
                    {entry.note && <p className="text-xs text-gray-400 mt-0.5 italic">"{entry.note}"</p>}
                    <p className="text-sm font-bold mt-1" style={{ color: themeColor }}>
                      {fmt(entry.item_price * entry.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(entry.menu_item_id)}
                      className="h-7 w-7 rounded-full border flex items-center justify-center"
                      style={{ borderColor: themeColor, color: themeColor }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{entry.quantity}</span>
                    <button
                      onClick={() => {
                        const found = categories.flatMap(c => c.menu_items.map(i => ({ item: i, station: c.station }))).find(x => x.item.id === entry.menu_item_id);
                        if (found) addToCart(found.item, found.station);
                      }}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteFromCart(entry.menu_item_id)} className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 border-t space-y-3 bg-white">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold shrink-0">Masa No</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="örn: 5"
                  className="flex-1 border-2 rounded-xl px-3 py-2.5 text-base focus:outline-none"
                  style={{ borderColor: themeColor }}
                />
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>Toplam</span>
                <span className="text-xl" style={{ color: themeColor }}>{fmt(totalPrice)}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 text-base disabled:opacity-60"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="h-5 w-5" />
                {ordering ? "Gönderiliyor..." : "Siparişi Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
