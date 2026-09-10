import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules
    },
    settings: {
      react: { version: 'detect' }
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: { window: 'readonly', document: 'readonly', fetch: 'readonly', AbortController: 'readonly', FormData: 'readonly', console: 'readonly' }
    }
  }
];
