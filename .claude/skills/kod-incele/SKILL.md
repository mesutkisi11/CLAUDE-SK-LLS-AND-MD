---
name: kod-incele
description: Müşteriye teslim öncesi kod kalite kontrolü, güvenlik incelemesi ve performans denetimi yapar. Production-ready check listesi.
---

# Kod İnceleme Uzmanı (teslim öncesi)

Bu skill aktifken, müşteriye iş teslim etmeden önce aşağıdaki kontrol listesi izlenecek.

## Neden bu kritik

Müşteriye teslim ettikten sonra ortaya çıkan bug:
- İtibar hasarı
- Para kaybı (refund, geri yapım)
- Sonraki müşteri kapısı kapanması

Teslim öncesi 1 saatlik kontrol = 10 saatlik düzeltme tasarrufu.

## Genel kontrol listesi

Her teslim öncesi:

### Kod kalite

- [ ] `npm run lint` çalıştır, 0 error olsun
- [ ] `npm run typecheck` çalıştır (TypeScript), 0 error
- [ ] `npm run test` çalıştır (varsa testler), hepsi geçsin
- [ ] Console.log/print debug satırlarını kaldır
- [ ] Yorum satırı olarak bırakılmış kod blok'ları (TODO, kapatılmış kod) sil
- [ ] Magic number/string'ler için constant/config kullanılmış mı

### Güvenlik

- [ ] API key'ler `.env`'de, asla hard-code yok
- [ ] `.env` `.gitignore`'da
- [ ] Eski/sızdırılmış key'ler revoke edildi mi
- [ ] Authentication doğru çalışıyor (test login + logout + protected routes)
- [ ] CORS doğru ayarlı
- [ ] SQL injection/XSS riskine karşı sanitize var mı (form girişleri)
- [ ] Rate limit var mı (public API'larda)
- [ ] HTTPS aktif (Vercel'de varsayılan)

### Performans

- [ ] Lighthouse skoru 80+ (mobile)
- [ ] Görseller optimize (next/image ya da WebP)
- [ ] Lazy load ağır component'lerde
- [ ] Bundle size makul (300kb altı initial JS)
- [ ] Database query'leri N+1 problemi yok (Supabase Studio'dan kontrol et)
- [ ] Cache stratejisi var (gerekiyorsa)

### Kullanıcı deneyimi

- [ ] Mobile'da test edildi (gerçek telefon)
- [ ] Tablet boyutunda kırılmıyor
- [ ] Loading state'ler var (boş ekran yerine spinner)
- [ ] Error state'ler var (404, 500, network error)
- [ ] Form validation kullanıcı dostu (hangi alan hatalı)
- [ ] Boş state'ler bilgilendirici (boş liste yerine "henüz X yok")
- [ ] Dark mode düzgün geçiyor
- [ ] Keyboard navigation çalışıyor (Tab ile gez)

### SEO + meta

- [ ] Title tag her sayfada
- [ ] Meta description her sayfada
- [ ] Open Graph tags (Facebook, Twitter share için)
- [ ] Favicon var
- [ ] robots.txt + sitemap.xml
- [ ] Schema.org structured data (e-ticaret/blog için)

### Erişilebilirlik (a11y)

- [ ] Alt text görsellerde
- [ ] Heading hierarchy düzgün (h1 → h2 → h3)
- [ ] Renk kontrastı yeterli (WCAG AA)
- [ ] ARIA labels gerekiyorsa
- [ ] Form etiketleri input'larla bağlı

### Yayın hazırlığı

- [ ] Production environment variables ayarlandı
- [ ] Custom domain bağlandı (varsa)
- [ ] SSL sertifikası aktif
- [ ] Analytics kuruldu (Plausible/GA4)
- [ ] Error tracking aktif (Sentry/basic logging)
- [ ] Backup stratejisi var (Supabase otomatik backup yapıyor mu)

## Müşteriye teslim paketi

Tüm kontrol bitince müşteriye şunları gönder:

1. **Live URL** + admin login bilgileri (gerekiyorsa)
2. **GitHub repo erişimi** (müşteri sahip olacaksa)
3. **README** — proje ne yapar, nasıl çalıştırılır, deploy nasıl
4. **Kullanım rehberi** — müşteri için 1-2 sayfa, ekran görüntülü
5. **Loom videosu** (opsiyonel, 5 dk) — proje turu
6. **Backup** — kod, database snapshot, asset'ler ZIP'li
7. **Geçiş dokümanı** — credentials, hosting, domain bilgileri
8. **30 gün support koşulları** — hangi bug'lar dahil, neler ek işlem

## Müşteri eğitimi

Teslim Zoom toplantısında:
- Site/app tour (5 dk)
- Admin panel kullanımı (10 dk)
- Sık karşılaşılan işlemler (10 dk)
- Soru-cevap (5 dk)
- Bonus: değişiklik rica ederse nasıl iletişim kuracağı

## Yaygın teslim hataları

- **"Localhost'ta çalışıyor" deme** — production'da test etmeden teslim etme
- **Test data ile teslim etme** — database'i temizle, gerçek/anlamlı data koy
- **Müşterinin email/şifresini hard-code etme** — dinamik form yap
- **`console.log("BURASI ÇALIŞIYOR")` bırakma** — gerçek olay
- **`TODO: production'da düzelt` yorumlarını bırakma** — production zaten geldi

## Post-launch ilk 7 gün

İlk hafta:
- Daily check: error rate, kullanım, müşteri mesajı
- 24 saat response süresi taahhüt et
- 7. gün sonunda 1 saatlik check-in toplantısı
- Müşteriden testimonial iste (memnunsa)
- Referans iste (müşteri tanıdığı diğer işletmeler)
