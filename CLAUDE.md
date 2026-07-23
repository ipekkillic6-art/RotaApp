@AGENTS.md

# Rota — Kurye ve Teslimat Uygulaması

React Native (Expo SDK 57, managed + prebuild/CNG). Tasarım sistemi hazır:
`src/design-system/` (kaynak repo: `~/Desktop/kuryeApp`).

## Değiştirilemez kurallar
1. Ham renk/boşluk yasak. `theme.colors.*` ve `theme.spacing.*` kullan.
   Ham hex yalnızca `src/design-system/tokens/palette.ts` içinde olabilir.
2. `<Text>` yasak → `<Typography variant="body">`
3. Emoji ikon yasak → `<Icon icon={Truck} />` (lucide-react-native)
4. Çıplak `fetch` yasak → `src/utils/api.ts`
5. Ekranlar saftır: içinde fetch, store mutasyonu, iş mantığı olmaz.
   Veri prop'tan gelir; bağlama işini Container yapar.
6. Rota adı string yazılmaz → `ROUTES.CUSTOMER_HOME`
7. `any` yasak. Tipler `src/types/` altında.
8. Boolean prop yığını yerine variant enum'u.
9. Durum yalnızca renkle anlatılmaz: ikon + metin + renk.
10. Tıklanabilir kartın içine buton konmaz (bkz. DeliveryCard).

## Native paket kuralı (prebuild / CNG)
- Native paket kurarken `npx expo install` kullan (npm install DEĞİL).
- `ios/` ve `android/` gitignore'da — ELLE DÜZENLEME, repoya EKLEME.
- Native taraf tek kaynaktan yönetilir: `app.json` + config plugin.
- Native değişince: `npx expo prebuild --clean` → development build yeniden alınır.
- Reanimated 4 babel plugin'i: `react-native-worklets/plugin` (listede en son).

## Her ekranda
loading · errorText · boş durum (STATE_PRESETS'ten metin al) · offline
accessibilityLabel'lar · dokunma hedefi >= 44pt

## İş bitince
`npx tsc --noEmit` ve `npm run lint:guard` temiz olmalı.
`app.json` / config plugin değiştiyse: development build yeniden alınmalı.

## Yol haritası
`~/Desktop/kuryeApp/docs/RN_UYGULAMA_YOL_HARITASI.md`
