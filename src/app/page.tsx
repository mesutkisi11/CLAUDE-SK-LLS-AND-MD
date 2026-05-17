import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, Clock, Users, Star, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">QR Menü</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/signup">
              <Button>Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Star className="h-3.5 w-3.5" />
          500+ işletme güveniyor
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Randevu yönetimi{" "}
          <span className="text-primary">bu kadar kolay</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Berber, klinik, güzellik salonu — her işletme için online randevu sistemi.
          Kurulum 5 dakika, müşterileriniz 7/24 randevu alabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              14 Gün Ücretsiz Dene
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-8">
              Demo İzle
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Kredi kartı gerekmez</p>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            İşletmenizi büyütün
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "QR Kod ile Menü",
                desc: "Müşterileriniz masadaki QR kodu tarayarak menüye ulaşır. Güncel fiyatlar, fotoğraflar, açıklamalar.",
              },
              {
                icon: Clock,
                title: "Otomatik Hatırlatma",
                desc: "Randevu öncesi müşterilere otomatik SMS/email hatırlatması gönderin. No-show oranını %70 düşürün.",
              },
              {
                icon: Users,
                title: "Müşteri Yönetimi",
                desc: "Tüm müşterilerinizin geçmiş randevularını, notlarını ve ödemelerini tek yerden takip edin.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-background rounded-xl p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Fiyatlandırma</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Başlangıç",
              price: "Ücretsiz",
              period: "sonsuza kadar",
              features: ["50 randevu/ay", "1 çalışan", "Temel takvim", "Email bildirimleri"],
              cta: "Ücretsiz Başla",
              href: "/signup",
              highlight: false,
            },
            {
              name: "Pro",
              price: "₺299",
              period: "/ ay",
              features: ["Sınırsız randevu", "5 çalışan", "SMS hatırlatma", "Online ödeme", "Öncelikli destek"],
              cta: "14 Gün Ücretsiz Dene",
              href: "/signup",
              highlight: true,
            },
            {
              name: "İşletme",
              price: "₺699",
              period: "/ ay",
              features: ["Sınırsız her şey", "Sınırsız çalışan", "Özel domain", "API erişimi", "Özel entegrasyon"],
              cta: "İletişime Geç",
              href: "/signup",
              highlight: false,
            },
          ].map(({ name, price, period, features, cta, href, highlight }) => (
            <div
              key={name}
              className={`rounded-xl p-6 border ${highlight ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {highlight && (
                <div className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 inline-block mb-3">
                  En Popüler
                </div>
              )}
              <h3 className="font-bold text-lg">{name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{price}</span>
                <span className="text-muted-foreground text-sm ml-1">{period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={href}>
                <Button className="w-full" variant={highlight ? "default" : "outline"}>
                  {cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 QR Menü — Made with Claude Code
        </div>
      </footer>
    </div>
  );
}
