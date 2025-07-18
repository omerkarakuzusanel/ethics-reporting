# Ethics Reporting (Etik Bildirim Uygulaması)

Bu proje, etik ihlallerin anonim veya kimlikli olarak bildirilmesini ve bu bildirimlerin yönetilmesini sağlayan bir web uygulamasıdır. Şirket çalışanları veya dış kullanıcılar, karşılaştıkları etik ihlalleri kolayca raporlayabilir ve bildirimlerinin durumunu takip edebilirler. Yönetici paneli sayesinde adminler gelen bildirimleri inceleyebilir, not ekleyebilir ve durum güncelleyebilir.

## Özellikler

- **Anonim veya Kimlikli Bildirim:** Kullanıcılar isterlerse kimlik bilgisi vermeden bildirimde bulunabilir.
- **Bildirim Takibi:** Kullanıcıya özel erişim kodu ile bildirim durumu takip edilebilir.
- **Dosya Yükleme:** Bildirime ek olarak dosya (görsel, belge vb.) eklenebilir.
- **Yönetici Paneli:**
  - Bildirimleri listeleme ve detaylarını görüntüleme
  - Bildirim durumunu güncelleme, not ekleme
  - Sadece görüntüleyici (readonly) ve tam yetkili admin hesapları desteği
- **Çoklu Dil Desteği:** Türkçe ve İngilizce arayüz
- **E-posta Bildirimi:** Yeni bildirim geldiğinde adminlere e-posta gönderimi

## Kurulum

1. **Depoyu klonlayın:**
   ```
   git clone <repo-url>
   cd ethics-reporting
   ```
2. **Bağımlılıkları yükleyin:**
   ```
   npm install
   ```
3. **.env dosyasını oluşturun:**
   Proje kök dizinine aşağıdaki gibi bir `.env` dosyası ekleyin:

   ```
   READONLY_EMAIL=etik01@sanel.com.tr
   ADMIN_EMAIL_UPDATE=etikadmin@sanel.com.tr
   NEXT_PUBLIC_READONLY_EMAIL=etik01@sanel.com.tr
   NEXT_PUBLIC_ADMIN_EMAIL_UPDATE=etikadmin@sanel.com.tr
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

   Supabase anahtarlarını kendi projenizden alın.

4. **Geliştirme sunucusunu başlatın:**
   ```
   npm run dev
   ```

## Kullanım

- Ana sayfadan yeni bildirim oluşturabilir veya mevcut bildiriminizi takip edebilirsiniz.
- Admin paneline giriş yaparak bildirimleri yönetebilirsiniz.
- Sadece admin olarak tanımlanan e-posta adresleri bildirim güncelleyebilir, readonly kullanıcılar sadece görüntüleyebilir.

## Notlar

- Ortam değişkenleri (özellikle e-posta yetkileri) hem backend hem frontend için ayrı ayrı tanımlanmalıdır.
- Supabase kurulumu ve veritabanı şeması için `setup_database.sql` ve `setup_admin_auth.sql` dosyalarını inceleyin.

---

Her türlü katkı ve geri bildirime açıktır!

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
