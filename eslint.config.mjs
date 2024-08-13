// @ts-check

import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    files: ['apps/zen-vison/**'],
    rules: {
      'no-undef': 'off',
    },
  },
]);
