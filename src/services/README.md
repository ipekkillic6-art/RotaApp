# services

API çağrıları. `utils/api.ts` kullanır, `types/`'tan tip döner.
authService · deliveryService · courierService · opsService · addressService ·
notificationService.

## Import yasağı
- `services` → `screens` import **ETMEZ**.
- Servisler React bilmez; sadece veri getirir/gönderir.
