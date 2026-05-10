import { notFound } from "next/navigation";
import { getPublicMenu } from "@/lib/actions/menus";

export const dynamic = "force-dynamic";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
  menu_items: MenuItem[];
};

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();

  const categories = (menu.menu_categories as Category[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => ({
      ...cat,
      menu_items: cat.menu_items.sort((a, b) => a.sort_order - b.sort_order),
    }));

  const totalItems = categories.reduce((s, c) => s + c.menu_items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="text-white py-8 px-4 text-center sticky top-0 z-10 shadow-md"
        style={{ backgroundColor: menu.theme_color }}
      >
        <h1 className="text-3xl font-bold">{menu.restaurant_name}</h1>
        {menu.description && (
          <p className="mt-1 text-white/80 text-sm max-w-md mx-auto">{menu.description}</p>
        )}
        <p className="mt-2 text-xs text-white/60">{totalItems} ürün · {categories.length} kategori</p>
      </header>

      {categories.length > 1 && (
        <nav className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto sticky top-[84px] z-10">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border hover:text-white transition-colors"
              style={{ borderColor: menu.theme_color, color: menu.theme_color }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = menu.theme_color;
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "";
                (e.currentTarget as HTMLElement).style.color = menu.theme_color;
              }}
            >
              {cat.name}
            </a>
          ))}
        </nav>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">{cat.menu_items.length} ürün</span>
            </div>

            <div className="space-y-3">
              {cat.menu_items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden flex ${
                    !item.is_available ? "opacity-50" : ""
                  }`}
                >
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 p-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5 leading-snug">{item.description}</p>
                      )}
                      {!item.is_available && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          Tükendi
                        </span>
                      )}
                    </div>
                    <div
                      className="text-lg font-bold shrink-0"
                      style={{ color: menu.theme_color }}
                    >
                      ₺{Number(item.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl mb-2">Menü henüz hazır değil</p>
            <p className="text-sm">Yakında eklenecek...</p>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        <p>Bu menü QR Menü Sistemi ile oluşturulmuştur</p>
      </footer>
    </div>
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
