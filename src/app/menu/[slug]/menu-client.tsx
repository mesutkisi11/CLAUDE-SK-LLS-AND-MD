"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { submitOrder, type CartItem } from "@/lib/actions/orders";
import { ShoppingCart, Plus, Minus, X, Send, UtensilsCrossed, ChevronRight } from "lucide-react";

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

const BRAND = {
  brown: "#3d1a08",
  orange: "#f07c10",
  lightBrown: "#7a3b1e",
  bg: "#fdf8f4",
};

export function MenuClient({
  menuId, restaurantName, description, themeColor, logoUrl, categories,
}: {
  menuId: string; restaurantName: string; description: string;
  themeColor: string; logoUrl?: string; categories: Category[];
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
  const color = themeColor || BRAND.orange;

  function addToCart(item: MenuItem, station = "mutfak") {
    setCart((prev) => {
      const existing = prev.find((e) => e.menu_item_id === item.id);
      if (existing) return prev.map((e) => e.menu_item_id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { key: item.id, menu_item_id: item.id, item_name: item.name, item_price: item.price, quantity: 1, note: "", station }];
    });
    toast.success(`${item.name} sepete eklendi`, { duration: 1200 });
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: BRAND.bg }}>
        <div className="text-7xl mb-5">🎉</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND.brown }}>Siparişiniz Alındı!</h1>
        <p className="text-gray-500 mb-8 text-sm">Mutfağa iletildi, kısa süre içinde hazırlanacak.</p>
        <button onClick={() => setDone(false)} className="px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg" style={{ backgroundColor: color }}>
          Yeni Sipariş Ver
        </button>
      </div>
    );
  }

  const currentCat = categories.find(c => c.id === activeCat);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND.bg, paddingBottom: totalItems > 0 ? "96px" : "40px" }}>

      {/* ── HEADER ── */}
      <header style={{ background: `linear-gradient(135deg, ${BRAND.brown} 0%, ${BRAND.lightBrown} 100%)` }} className="sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={restaurantName} className="h-12 w-12 rounded-full object-cover border-2 border-white/30 shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: BRAND.orange }}>
              🍽️
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-white font-bold text-base leading-tight truncate">{restaurantName}</h1>
            {description && <p className="text-white/60 text-xs mt-0.5 truncate">{description}</p>}
          </div>
        </div>

        {/* Kategori nav */}
        {categories.length > 1 && (
          <div
            ref={navRef}
            className="flex gap-2 px-3 pb-3 overflow-x-auto"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {categories.map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => selectCat(cat.id)}
                  className="shrink-0 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    padding: "8px 16px",
                    minHeight: "36px",
                    ...(isActive
                      ? { backgroundColor: BRAND.orange, color: "#fff", boxShadow: "0 2px 8px rgba(240,124,16,0.5)" }
                      : { backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }),
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ── ÜRÜN LİSTESİ ── */}
      <main className="max-w-2xl mx-auto px-3 pt-4">
        {categories.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <UtensilsCrossed className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Menü henüz hazır değil</p>
          </div>
        )}

        {currentCat && (
          <section>
            {/* Kategori başlığı */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: BRAND.orange }} />
              <h2 className="font-bold text-base" style={{ color: BRAND.brown }}>{currentCat.name}</h2>
              <span className="text-xs text-gray-400 ml-auto">{currentCat.menu_items.length} ürün</span>
            </div>

            <div className="space-y-2.5">
              {currentCat.menu_items.map((item) => {
                const inCart = cart.find((e) => e.menu_item_id === item.id);
                const itemOptions = item.options ? item.options.split(",").map(o => o.trim()).filter(Boolean) : [];

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{ boxShadow: "0 1px 8px rgba(61,26,8,0.08)" }}
                  >
                    {/* Ana satır */}
                    <div className="flex items-center gap-3 p-3">
                      {item.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug" style={{ color: BRAND.brown }}>{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className="font-extrabold text-lg" style={{ color: BRAND.orange }}>
                            {fmt(Number(item.price))}
                          </span>
                          {inCart ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 rounded-full flex items-center justify-center border-2"
                                style={{ borderColor: BRAND.orange, color: BRAND.orange }}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="font-bold text-base w-6 text-center" style={{ color: BRAND.brown }}>{inCart.quantity}</span>
                              <button
                                onClick={() => addToCart(item, currentCat.station)}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: BRAND.orange }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item, currentCat.station)}
                              className="h-9 px-5 rounded-full text-white text-sm font-bold shrink-0 flex items-center gap-1"
                              style={{ backgroundColor: BRAND.orange }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Ekle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seçenekler + Not */}
                    {inCart && (
                      <div className="border-t px-3 py-3 space-y-3" style={{ backgroundColor: "#fef9f5", borderColor: "#f5e8d8" }}>
                        {itemOptions.length > 0 && (
                          <div>
                            <p className="text-xs font-bold mb-2" style={{ color: BRAND.lightBrown }}>Nasıl hazırlansın?</p>
                            <div className="flex flex-wrap gap-2">
                              {itemOptions.map((opt) => {
                                const active = (selectedOptions[item.id] ?? []).includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      const current = selectedOptions[item.id] ?? [];
                                      const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                      setSelectedOptions(prev => ({ ...prev, [item.id]: updated }));
                                      const freeNote = notes[item.id] ?? "";
                                      const note = [updated.join(", "), freeNote].filter(Boolean).join(" | ");
                                      setCart(prev => prev.map(e => e.menu_item_id === item.id ? { ...e, note } : e));
                                    }}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                                    style={active
                                      ? { backgroundColor: BRAND.orange, borderColor: BRAND.orange, color: "#fff" }
                                      : { backgroundColor: "#fff", borderColor: "#e5c9a8", color: BRAND.lightBrown }
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
                          <p className="text-xs font-bold mb-1.5" style={{ color: BRAND.lightBrown }}>Özel istek / not</p>
                          <textarea
                            className="w-full text-sm border rounded-xl p-2.5 resize-none focus:outline-none bg-white"
                            style={{ borderColor: "#e5c9a8" }}
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

      {/* ── SEPET BUTONU ── */}
      {totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-30 px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center justify-between px-5 py-4 rounded-2xl text-white w-full max-w-sm font-bold"
            style={{ backgroundColor: BRAND.brown, boxShadow: "0 4px 20px rgba(61,26,8,0.4)" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: BRAND.orange }}>{totalItems}</span>
              <span>Sepeti Gör</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base">{fmt(totalPrice)}</span>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </div>
          </button>
        </div>
      )}

      {/* ── SEPET DRAWER ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col" style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}>

            {/* Drawer handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#f5e8d8" }}>
              <h2 className="font-bold text-lg" style={{ color: BRAND.brown }}>Sepetim</h2>
              <button onClick={() => setCartOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: "#f5e8d8" }}>
                <X className="h-4 w-4" style={{ color: BRAND.brown }} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {cart.map((entry) => (
                <div key={entry.menu_item_id} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: "#f5e8d8" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: BRAND.brown }}>{entry.item_name}</p>
                    {entry.note && <p className="text-xs text-gray-400 mt-0.5 italic">"{entry.note}"</p>}
                    <p className="text-sm font-bold mt-1" style={{ color: BRAND.orange }}>{fmt(entry.item_price * entry.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => removeFromCart(entry.menu_item_id)} className="h-7 w-7 rounded-full border-2 flex items-center justify-center" style={{ borderColor: BRAND.orange, color: BRAND.orange }}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center" style={{ color: BRAND.brown }}>{entry.quantity}</span>
                    <button onClick={() => {
                      const found = categories.flatMap(c => c.menu_items.map(i => ({ item: i, station: c.station }))).find(x => x.item.id === entry.menu_item_id);
                      if (found) addToCart(found.item, found.station);
                    }} className="h-7 w-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: BRAND.orange }}>
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteFromCart(entry.menu_item_id)} className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-red-400 ml-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 space-y-3" style={{ backgroundColor: "#fef9f5", borderTop: "1px solid #f5e8d8" }}>
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold shrink-0" style={{ color: BRAND.brown }}>Masa No</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="örn: 5"
                  className="flex-1 border-2 rounded-xl px-3 py-2.5 text-base font-semibold focus:outline-none bg-white"
                  style={{ borderColor: BRAND.orange }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: BRAND.brown }}>Toplam</span>
                <span className="text-2xl font-extrabold" style={{ color: BRAND.orange }}>{fmt(totalPrice)}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: BRAND.brown, boxShadow: "0 4px 16px rgba(61,26,8,0.3)" }}
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
