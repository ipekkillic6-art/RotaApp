// Tam lint: tip/hook kuralları + mimari guard'lar.
// CI yalnızca guard'ı zorunlu tutar (npm run lint:guard); bu tam set geliştirme içindir.
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const guard = require('./eslint.config.guard.js');

module.exports = [
  {
    ignores: ['node_modules/**', 'ios/**', 'android/**', '.expo/**', '*.config.js', 'babel.config.js'],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'App.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin, 'react-hooks': reactHooks },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // Mimari guard'ları da ekle (ignores objesi hariç).
  ...guard.slice(1),
];
