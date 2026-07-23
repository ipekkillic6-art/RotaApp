# RotaApp — Çalıştırılan komutlar (Claude Code oturumu)

Bu dosya, projeyi kurarken çalıştırılan komutların kaydıdır.
Terminalde görmek için:  `cat ~/Desktop/RotaApp/YAPILAN-KOMUTLAR.md`

---

## FAZ 1 — Proje kurulumu

```bash
# 1.2 Projeyi oluştur
cd ~/Desktop
npx create-expo-app@latest RotaApp --template blank-typescript
cd RotaApp

# 1.3 Native bağımlılıklar (expo install)
npx expo install \
  react-native-screens react-native-safe-area-context \
  react-native-gesture-handler react-native-reanimated \
  react-native-svg \
  @react-native-async-storage/async-storage @react-native-community/netinfo \
  @shopify/flash-list react-native-keyboard-controller \
  expo-secure-store expo-constants expo-splash-screen expo-font

# Saf JS bağımlılıkları (npm)
npm install \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  lucide-react-native zustand

# ESLint dev bağımlılıkları
npm install -D \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react-hooks

# reanimated 4 peer bağımlılığı
npx expo install react-native-worklets

# Dosya düzenlemeleri (elle/editörle):
#  - babel.config.js oluşturuldu  -> react-native-worklets/plugin (en son)
#  - index.ts        ilk satır    -> import 'react-native-gesture-handler';
#  - tsconfig.json                -> strict + "@/*": ["./src/*"] paths

# 1.4 Klasör yapısı
mkdir -p \
  src/design-system \
  src/screens/shared src/screens/customer src/screens/courier src/screens/admin \
  src/navigation src/stores src/services src/utils src/hooks src/types src/constants src/mocks
# (her klasöre README.md yazıldı)

# 1.5 CLAUDE.md oluşturuldu (değiştirilemez kurallar)

# Doğrulama + commit
npx tsc --noEmit
git add -A && git commit -m "chore(faz1): proje kurulumu"
```

---

## FAZ 2 — Tasarım sistemi

```bash
# 2.1 Tasarım sistemini kopyala
cp -R ~/Desktop/kuryeApp/src/design-system/. src/design-system/
cp    ~/Desktop/kuryeApp/src/fixtures/types.ts src/types/index.ts
cp -R ~/Desktop/kuryeApp/src/mocks/. src/mocks/
cp    ~/Desktop/kuryeApp/src/utils/format.ts src/utils/format.ts

# Story dosyalarını sil
find src -name "*.stories.tsx" -delete

# Import düzeltmesi: fixtures/types -> types
grep -rl "fixtures/types" src --include="*.ts" --include="*.tsx" \
  | xargs sed -i '' 's#fixtures/types#types#g'

# RN 0.86 uyumu: StyleSheet.absoluteFillObject -> absoluteFill
grep -rl "absoluteFillObject" src --include="*.ts" --include="*.tsx" \
  | xargs sed -i '' 's#StyleSheet\.absoluteFillObject#StyleSheet.absoluteFill#g'

npx tsc --noEmit
git add -A && git commit -m "feat(faz2): tasarım sistemi taşındı"

# --- Aşağıdakiler HENÜZ COMMIT'LENMEDİ ---

# 2.2 Safe area: Containers.tsx -> useSafeAreaInsets() (elle düzenleme)

# 2.3 Fontlar
npx expo install @expo-google-fonts/inter expo-font
#  typography.ts  -> interFontFamily haritası (ağırlık -> Inter adı)
#  Typography.tsx -> ağırlığa göre Inter ailesi seçimi
#  tokens/index.ts -> interFontFamily export

# Ekranları kopyala (demo hariç) — Faz 2.4 için gerekli
for d in _shared shared customer courier admin; do
  cp -R ~/Desktop/kuryeApp/src/screens/$d/. src/screens/$d/
done
find src/screens -name "*.stories.tsx" -delete
grep -rl "fixtures/types" src/screens | xargs sed -i '' 's#fixtures/types#types#g'

# 2.4 App.tsx -> provider ağacı + font yükleme + geçici CustomerHomeScreen (elle)

npx tsc --noEmit   # ✅ temiz
```

---

## Faydalı kontrol komutları

```bash
cd ~/Desktop/RotaApp
git log --oneline        # commit geçmişi
git status --short       # değişen/eklenen dosyalar
git diff --stat          # dosya başına değişiklik boyutu
npx tsc --noEmit         # tip kontrolü
```
