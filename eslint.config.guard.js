// Mimari guard'lar — CI bunu çalıştırır (npm run lint:guard).
// Amaç: kuralları insan hafızasına değil derlemeye bağlamak.
const tsParser = require('@typescript-eslint/parser');

const NO_FETCH = {
  selector: "CallExpression[callee.name='fetch']",
  message: 'Çıplak fetch yasak → src/utils/api.ts kullan.',
};
const NO_HEX = {
  selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
  message: 'Ham hex yasak → theme.colors.* (yalnızca tokens/ içinde serbest).',
};

const TEXT_IMPORT_BAN = {
  paths: [
    {
      name: 'react-native',
      importNames: ['Text'],
      message: '"react-native"den Text import etme → <Typography> kullan.',
    },
  ],
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'ios/**',
      'android/**',
      '.expo/**',
      '*.config.js',
      'babel.config.js',
    ],
  },

  // Taban: tüm src — çıplak fetch + ham hex yasak.
  {
    files: ['src/**/*.{ts,tsx}', 'App.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: {
      'no-restricted-syntax': ['error', NO_FETCH, NO_HEX],
    },
  },

  // Muaf: api.ts tek fetch kapısı (hex yine yasak).
  {
    files: ['src/utils/api.ts'],
    rules: { 'no-restricted-syntax': ['error', NO_HEX] },
  },

  // Muaf: tokens ham hex tanımlayabilir (fetch yine yasak).
  {
    files: ['src/design-system/tokens/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', NO_FETCH] },
  },

  // screens → services import YASAK + Text import yasak.
  {
    files: ['src/screens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...TEXT_IMPORT_BAN,
          patterns: [
            {
              group: ['**/services', '**/services/*', '@/services', '@/services/*'],
              message: 'screens → services import ETMEZ (veriye store üzerinden eriş).',
            },
          ],
        },
      ],
    },
  },

  // design-system → screens/stores/services import YASAK (Text serbest — burada tanımlı).
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/screens', '**/screens/*',
                '**/stores', '**/stores/*',
                '**/services', '**/services/*',
                '@/screens', '@/screens/*', '@/stores', '@/stores/*', '@/services', '@/services/*',
              ],
              message: 'design-system → screens/stores/services import ETMEZ.',
            },
          ],
        },
      ],
    },
  },

  // Geri kalan katmanlar (stores, services, navigation, hooks, utils, App): Text import yasak.
  {
    files: [
      'src/stores/**/*.{ts,tsx}',
      'src/services/**/*.{ts,tsx}',
      'src/navigation/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
      'App.tsx',
    ],
    rules: {
      'no-restricted-imports': ['error', TEXT_IMPORT_BAN],
    },
  },
];
