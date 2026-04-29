---
name: web-tasarim
description: Müşteriye satılabilir kalitede landing page, kurumsal site veya dashboard tasarlar ve kodlar. Next.js + Tailwind + TypeScript stack'i kullanır.
---

# Web Tasarım Uzmanı

Bu skill aktifken, web tasarım/site yapma görevleri için aşağıdaki davranış izlenecek.

## Stack (varsayılan)

Aksini söylemediğim sürece:
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Component library:** shadcn/ui (gerekirse)
- **Icons:** lucide-react
- **Fonts:** Inter (Google Fonts)
- **Deploy:** Vercel

## Kalite standartları

Her sayfa şunları içermeli:

1. **Mobile-first responsive** — `md:`, `lg:` breakpoint'leri her yerde
2. **Dark mode toggle** — `next-themes` ile
3. **Hero section** — büyük başlık, alt başlık, CTA butonu, opsiyonel görsel
4. **Sosyal kanıt** — testimonial, logo wall ya da rakam göstergesi
5. **Fiyatlandırma** — eğer ürün/hizmet sayfası ise
6. **SEO meta tags** — `metadata` export
7. **Footer** — legal linkler, sosyal, iletişim

## Süreç

Yeni bir site projesi için:

1. **Önce sor:** Sektör nedir? Hedef kitle nedir? Marka rengi var mı?
2. **Plan göster:** Hangi sayfaları yapacağını listele, onayla
3. **Setup:** `npx create-next-app@latest` ile başla, Tailwind + TypeScript seç
4. **Dependency'ler:** shadcn/ui init, lucide-react, next-themes yükle
5. **Sayfaları kur:** Tek tek, her birini ayrı commit
6. **Deploy:** Vercel'e bağla, custom domain rehberi ver
7. **Teslim:** README + ekran görüntüleri + kullanım rehberi

## Yaygın sektör şablonları

Hızlı başlamak için tipik sektör şablonları:

- **Kahveci/restoran:** Menü, lokasyon (harita), rezervasyon formu
- **Diş hekimi/klinik:** Hizmetler, doktor profilleri, online randevu
- **Dijital ajans:** Portfolio, hizmetler, case study, iletişim
- **SaaS/yazılım:** Hero, özellikler, fiyatlandırma, demo formu
- **Butik otel:** Galeri, oda tipleri, rezervasyon, lokasyon
- **Hukuk bürosu:** Uzmanlık alanları, ekip, blog, iletişim
- **Fitness koçu:** Programlar, paketler, dönüşüm hikayeleri, randevu
- **E-ticaret:** Ürün listeleme, sepet, checkout (Stripe)

## Kalite checklist (teslim öncesi)

- [ ] Lighthouse skoru 90+ (performance, accessibility, SEO)
- [ ] Mobile'da test edildi (gerçek telefon, sadece DevTools değil)
- [ ] Dark mode düzgün geçiyor
- [ ] Tüm linkler çalışıyor (404 yok)
- [ ] Form'lar test edildi (gerçekten gönderiyor mu)
- [ ] Görseller optimize (next/image kullanılmış)
- [ ] Custom domain bağlandı (eğer müşteri istedi)
- [ ] Analytics kuruldu (Plausible önerilen, GA4 opsiyonel)

## Anti-patterns (yapma)

- Lorem ipsum bırakma — gerçek metin koy ya da müşteriden iste
- Stock görsel kullanma — Unsplash'tan ücretsiz, AI ile üretebilirsin
- Animasyonu abartma — basit, akıcı, yanıltıcı değil
- 5 farklı font kullanma — 1 ana, max 1 vurgu font
- Çok fazla renk — primary + accent + neutral yeter
- "Coming soon" sayfaları — eksik içerik teslim etme
