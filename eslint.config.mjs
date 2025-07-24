// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    files: ['apps/zhi-simple/**'],
    rules: {
      '@typescript-eslint/no-invalid-void-type': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'vue/require-default-prop': 'off',
    },
  },
]);
