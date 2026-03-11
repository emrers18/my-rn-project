---
trigger: always_on
---

# TravelBot MVP - Proje Fazları & Yol Haritası

---

## Genel Bakış

| Faz | İsim | Süre (Tahmini) | Çıktı |

| --- | ----------------------- | -------------- | ----------------------------------------- |

| 1 | Temel & Altyapı | 1-2 hafta | Çalışan iskelet, auth akışı |

| 2 | Domain & Core Mimari | 1-2 hafta | Tüm domain katmanı, repository interfaces |

| 3 | Supabase Entegrasyonu | 1-2 hafta | Gerçek veri akışı, Edge Functions |

| 4 | AI & GenUI Motoru | 2-3 hafta | Gemini entegrasyonu, dinamik widget'lar |

| 5 | UX Polish & Performance | 1-2 hafta | Animasyonlar, pagination, caching |

| 6 | Test & Yayın Hazırlığı | 1 hafta | Test coverage, store submission |

---

## Faz 1 — Temel & Altyapı Kurulumu

### Ne Yapılır?

- Expo projesi oluşturulur (TypeScript strict mode, Expo SDK 51).

- ESLint + Prettier konfigürasyonu sıfırdan kurulur, sıfır uyarı hedeflenir.

- Expo Router v3 ile sayfa yapısı (`/auth`, `/chat`, `/home`) oluşturulur.

- Supabase projesi açılır; `users`, `chats`, `messages` tabloları ve RLS politikaları tanımlanır.

- Supabase Auth ile email/password login & signup akışı entegre edilir.

- `auth_store.ts` (Zustand) ile oturum durumu yönetimi kurulur.

- Git repo açılır, `main` / `dev` branch stratejisi uygulanır.

### Neden Bu Faz Önce Gelir?

Tüm sonraki fazların üzerine inşa edileceği **zemin** burada atılır. Auth olmadan başka hiçbir özellik test edilemez; linter kuralları baştan kurulmazsa teknik borç birikir ve sonradan düzeltmek çok daha maliyetlidir. Supabase tablolarının ve RLS kurallarının erken tanımlanması, ileride veri modelinin değişmesiyle gelen "her şeyi yeniden yaz" krizini önler.

**Kontrol Noktası:** Kullanıcı kayıt olup giriş yapabiliyor ve oturum korunuyor olmalı.

---

## Faz 2 — Domain Katmanı & Clean Architecture İskeleti

### Ne Yapılır?

- `src/domain/` altındaki tüm entity'ler Zod schema ile yazılır: `Message`, `ChatSession`, `Trip`, `Destination`, `User`.

- Value Object'ler tanımlanır: `Email`, `Password` (validation mantığı burada yaşar).

- Repository interface'leri yazılır: `IChatRepository`, `ITripRepository`, `IUserRepository`.

- `failure.ts` ile tüm Failure type'ları (`AuthFailure`, `NetworkFailure`, vb.) tanımlanır.

- `neverthrow` ile `Result<Success, Failure>` pattern kurulur, use case şablonları yazılır.

- Application katmanında `send_message_usecase.ts`, `get_chat_history_usecase.ts` iskeletleri oluşturulur (henüz mock veriyle çalışır).

### Neden Bu Faz Önce Gelir?

Domain katmanı **saf TypeScript**'tir; ne Supabase'e ne de React Native'e bağımlıdır. Bu katmanı erken yazmak iki kritik fayda sağlar: birincisi, AI ve Supabase entegrasyonundan önce iş mantığını izole edilmiş biçimde test edebilirsiniz; ikincisi, sonraki fazlarda infrastructure veya UI değişse bile domain katmanına dokunmanız gerekmez. Bu olmadan kod, katmanlar arasında sıkışıp "spagetti" haline gelir.

**Kontrol Noktası:** `npx jest` ile domain entity unit testleri geçiyor olmalı, `npx eslint` sıfır hata vermeli.

---

## Faz 3 — Supabase Infrastructure Entegrasyonu

### Ne Yapılır?

- `src/infrastructure/` altında her domain için DataSource'lar yazılır: `supabase_chat_datasource.ts`, `supabase_user_datasource.ts`.

- Repository implementasyonları tamamlanır: Domain interface'leri Supabase çağrılarıyla hayata geçirilir.

- Zod modelleri ile Supabase'den gelen ham JSON parse edilir ve entity'lere dönüştürülür.

- React Query (TanStack Query v5) ile server state yönetimi kurulur: mesaj geçmişi, chat listesi sorgular.

- Supabase Realtime ile yeni mesajların anlık olarak UI'a yansıması sağlanır.

- Mesaj geçmişi için pagination (20 mesaj/sayfa) uygulanır.

- Supabase RLS politikaları test edilir.

### Neden Bu Sırada?

Domain kontratları (interface'ler) hazır olduğu için infrastructure katmanını yazmak artık mekanik bir işlemdir: interface'in her metodunu Supabase çağrısıyla doldurmak yeterlidir. Eğer bu faz domain fazından önce gelmiş olsaydı, Supabase şeması değiştikçe her şeyi yeniden yazmanız gerekirdi. React Query burada eklenir çünkü artık gerçek async veri akışı vardır ve server/client state ayrımını net tutmak kritiktir.

**Kontrol Noktası:** Gerçek kullanıcı mesaj gönderebiliyor, mesajlar Supabase'e yazılıyor ve geçmiş ekranda listeleniyor olmalı.

---

## Faz 4 — AI Motoru & GenUI Sistemi

### Ne Yapılır?

- Supabase Edge Function olarak `gemini-chat` fonksiyonu yazılır; Gemini API anahtarı burada güvenle saklanır, istemciye asla gönderilmez.

- Edge Function, kullanıcı mesajına göre ya düz metin ya da JSON (tip belirteci + veri) döner.

- `supabase_ai_datasource.ts` ile uygulama bu Edge Function'ı çağırır.

- `generate_itinerary_usecase.ts` tamamlanır.

- **GenUI Renderer** yazılır: Gelen JSON'daki `tip` alanına göre doğru component'ı seçen switch mekanizması.

- GenUI component'ları hayata geçirilir:
  - `DestinationCard` (fotoğraf, hava durumu, "Oraya Git" butonu)

  - `HotelCard` (fiyat, yıldız, rezervasyon butonu)

  - `TicketCard` (saat, fiyat, "Satın Al" butonu)

  - `RouteWidget` (durak listesi görselleştirme)

- Chat ekranında mesaj baloncuğu içine GenUI component'ları gömülür.

- Zod ile AI'dan gelen JSON schema validasyonu yapılır; bozuk yanıt gelirse kullanıcıya hata gösterilir.

### Neden Bu Faz Bu Kadar Kritik?

Bu faz projenin **kalbi**dir ve en riskli kısımdır. Edge Function olmadan API anahtarı istemciye sızar. GenUI sistemi olmadan AI cevabı sadece düz metinden ibarettir ve proje vizyon belgesindeki "etkileşimli kartlar" hedefine ulaşılamaz. Zod validasyonu olmadan AI'ın bozuk JSON döndürdüğü anlarda uygulama çöker. Bu yüzden infrastructure sağlam kurulduktan sonra bu faza girilir.

**Kontrol Noktası:** "Roma'da butik otel bul" yazıldığında ekranda HotelCard component'ları görünüyor olmalı.

---

## Faz 5 — UX Polish, Animasyonlar & Performans

### Ne Yapılır?

- `react-native-reanimated` ile mesaj balonu giriş animasyonları, GenUI kartlarının "açılma" efektleri eklenir.

- `react-native-markdown-display` ile AI'ın düz metin yanıtları markdown olarak render edilir (kalın yazı, liste, link).

- `expo-image` ile DestinationCard ve HotelCard görselleri cache'lenir.

- `FlatList` ile chat geçmişi lazy loading'e alınır, performanslı scroll sağlanır.

- Mesaj gönderme input'una debounce eklenir.

- Loading skeleton'lar eklenir: AI cevabı beklenirken boş kart placeholder'ları gösterilir.

- Hata durumları için kullanıcı dostu `ErrorWidget` bileşenleri tamamlanır.

- Tablet ve büyük ekran desteği kontrol edilir.

### Neden Bunu Erken Yapmak Yanlış Olur?

Animasyon ve polish çalışmaları iş mantığı değişikliklerine karşı en kırılgan kısımdır. Eğer Faz 4'teki AI yanıt formatı değişirse, üzerine eklenen animasyonlar da çöpe gider. Bu yüzden "önce çalışır yap, sonra güzel yap" prensibi uygulanır. Ayrıca performans optimizasyonları (pagination, caching) ancak gerçek veri akışı kurulduktan sonra anlamlı biçimde ölçülüp uygulanabilir.

**Kontrol Noktası:** Uygulama yavaş bağlantıda akıcı çalışıyor, animasyonlar 60fps sabit, büyük chat geçmişi scroll'u kasıntısız olmalı.

---

## Faz 6 — Test Coverage, Güvenlik Denetimi & Yayın Hazırlığı

### Ne Yapılır?

- **Unit testler** tamamlanır: Tüm domain entity ve use case'ler Jest ile test edilir.

- **Component testler** yazılır: React Native Testing Library ile GenUI component'ları test edilir.

- **Integration testler**: Supabase operasyonları için test ortamı kurulur.

- `npx jest --coverage` ile coverage raporu çıkarılır, kritik path'lerde %80+ hedeflenir.

- Supabase RLS politikaları son kez denetlenir; başka kullanıcının mesajlarına erişilemediği doğrulanır.

- Gemini API anahtarının istemci tarafında hiçbir yerde bulunmadığı kontrol edilir.

- Expo EAS Build ile production build alınır.

- App Store / Google Play için gerekli meta veriler, ekran görüntüleri ve açıklamalar hazırlanır.

- `main` branch'e son merge yapılır, tag atılır (`v1.0.0`).

### Neden Ayrı Bir Faz?

Test yazmak "sonradan eklenecek bir şey" değildir ama gerçekte en verimli zaman, core geliştirme tamamlandıktan sonradır; çünkü o noktada neyi test etmeniz gerektiği netleşmiştir. Güvenlik denetimi burada kritiktir: RLS açığı veya sızdırılmış API anahtarıyla canlıya çıkmak telafi edilmesi çok zor sorunlara yol açar. Store submission süreçleri de beklenmedik geri dönüşlerle zaman alabildiğinden ayrı bir buffer olarak planlanmalıdır.

**Kontrol Noktası:** `npx jest` sıfır hata, `npx eslint` sıfır uyarı, production build başarıyla alınmış ve store'a gönderilmiş olmalı.

---

## Faz Bağımlılık Şeması

```

Faz 1 (Altyapı)

    └── Faz 2 (Domain)

            └── Faz 3 (Supabase Infra)

                    └── Faz 4 (AI & GenUI)  ← En kritik faz

                            └── Faz 5 (UX Polish)

                                    └── Faz 6 (Test & Yayın)

```

Her faz bir öncekinin çıktısına bağımlıdır. Faz 4 atlanarak ya da eksik tamamlanarak Faz 5'e geçmek, polish üzerine harcanan emeğin büyük bölümünün israf olmasına neden olur.
