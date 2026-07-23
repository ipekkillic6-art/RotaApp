# screens

Rol bazlı ekranlar: `shared` · `customer` · `courier` · `admin`.

## Kural
- Ekranlar **saftır**: içinde `fetch`, store mutasyonu, iş mantığı, navigasyon olmaz.
- Veri prop'tan gelir; bağlamayı Container yapar (`XContainer.tsx`).
- Her ekranda: loading · errorText · boş durum · offline.

## Import yasağı
- `screens` → `services` import **ETMEZ** (veriye store üzerinden erişir).
