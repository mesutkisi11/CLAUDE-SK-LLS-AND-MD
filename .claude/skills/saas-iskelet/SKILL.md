---
name: saas-iskelet
description: Mini SaaS uygulaması için authentication, ödeme, dashboard ve veritabanı entegrasyonu hazır iskelet kurar. Next.js + Supabase + Stripe stack'i kullanır.
---

# SaaS İskelet Uzmanı

Bu skill aktifken, SaaS uygulaması kurarken aşağıdaki standart stack ve yapı kullanılacak.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (Postgres + Auth + Storage)
- **Payments:** Stripe (Checkout + Subscriptions)
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Deploy:** Vercel
- **DNS:** Cloudflare (opsiyonel)

## Bir hafta MVP planı

### Gün 1: Setup + Auth
- Next.js + TypeScript projesi
- Supabase projesi aç, env değişkenlerini ayarla
- Login/signup sayfaları (Supabase Auth UI ya da custom)
- Protected routes middleware

### Gün 2: Database schema
- Kullanıcı tablosu (Supabase Auth ile bağlı)
- Ana entity tablosu (ürünün konusu — projeler, müşteriler, postlar vs)
- Row Level Security (RLS) policies — kullanıcı sadece kendi datasını görsün

### Gün 3: Core feature
- Ana feature'ı CRUD olarak kur
- List page + detail page + create/edit form
- Optimistic updates ile fast UX

### Gün 4: Stripe
- Stripe hesap aç, products + prices kur
- Checkout flow: button → Stripe Checkout → webhook → DB güncelle
- Subscription status kontrolü middleware'de

### Gün 5: Dashboard + UI polish
- Dashboard sayfası (kullanıcı istatistikleri)
- Settings sayfası (profile, billing, çıkış)
- Marketing landing page (ayrı route)
- Dark mode

### Gün 6: Email + onboarding
- Welcome email (signup sonrası)
- Password reset flow
- Trial bittiğinde reminder
- Resend ile basit transactional emails

### Gün 7: Deploy + test
- Vercel deploy
- Custom domain
- Stripe live mode'a geç (test mode'dan)
- 5 farklı senaryoyu manuel test et
- Sentry ya da basit error tracking

## Standart klasör yapısı

```
src/
├── app/
│   ├── (marketing)/        # public sayfalar (landing, pricing, blog)
│   ├── (auth)/             # login, signup, reset
│   ├── (dashboard)/        # protected, kullanıcı paneli
│   │   ├── layout.tsx      # sidebar, topbar
│   │   ├── page.tsx        # ana dashboard
│   │   ├── settings/
│   │   └── [feature]/
│   └── api/
│       ├── webhooks/stripe/
│       └── ...
├── components/
│   ├── ui/                 # shadcn
│   └── ...
├── lib/
│   ├── supabase/           # server + client
│   ├── stripe/
│   └── utils.ts
└── middleware.ts           # auth + redirect
```

## Pricing modelleri (önerilenler)

- **Freemium:** 14 gün ücretsiz → $19-49/ay
- **Tek seviye:** Yıllık $99-299
- **3 seviye:** Free / $19 / $49 / $99
- **Use-based:** Per kullanım (örn $0.01 per API call)

İlk SaaS için: **freemium + tek seviye** ($29/ay) en kolay.

## Kritik checklist (launch öncesi)

- [ ] Login/signup çalışıyor (3 farklı email ile test)
- [ ] Stripe checkout çalışıyor (test card 4242...)
- [ ] Webhook subscription oluşturuyor (Stripe CLI ile test)
- [ ] Trial bitince user limited mode'a geçiyor
- [ ] Email gönderiliyor (welcome, billing, reset)
- [ ] Mobile'da kullanılabilir
- [ ] Privacy + Terms sayfaları (basit ama var)
- [ ] Cookie banner (AB için)
- [ ] Domain bağlandı, SSL aktif
- [ ] Error tracking aktif

## Sıkça unutulan şeyler

- **Email deliverability:** Resend ile bile SPF/DKIM ayarlamadan spam'a düşersin
- **Webhook idempotency:** Aynı webhook 2 kere gelirse 2 kere abone olma
- **Refund flow:** Stripe'da refund butonu yok mu, manuel mi? Müşteri sorduğunda hazır ol
- **Cancel flow:** Subscription iptal edebilmek lazım, gizleme
- **GDPR:** EU'lulara veri silme hakkı vermek zorundasın

## Yaygın yanlışlar

- Authentication'ı kendin yazma — Supabase Auth ya da Clerk kullan
- Database'i Postgres olmadan başlatma (NoSQL ile başlama)
- Kendi payment sistemi yazma — Stripe yeter
- Email'i SMTP ile uğraşma — Resend ya da Loops kullan
- Marketing site ile app'i aynı projede tutma (ya monorepo ya ayrı domain)
