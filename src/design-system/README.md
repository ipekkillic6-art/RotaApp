# design-system

Token'lar, foundation'lar, bileşenler ve domain görselleri. Kaynağı
`~/Desktop/kuryeApp/src/design-system` (Storybook reposu).

## Import yasağı
- `design-system` → `screens` / `stores` / `services` import **ETMEZ**.
- Ham hex yalnızca `tokens/palette.ts` içinde. Diğer her yer semantik token.

Bileşenler saf sunumdur: veri ve callback prop'tan gelir; navigasyon bilmez.
