// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    files: ['apps/zen-vison/**'],
    rules: {
      '@typescript-eslint/no-invalid-void-type': 'off',
      'no-undef': 'off',
      'unicorn/no-array-callback-reference': 'off',
    },
  },
]);
