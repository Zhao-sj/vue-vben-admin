import { defineConfig } from '@vben/vite-config';

import AutoImport from 'unplugin-auto-import/vite';
import ElementPlus from 'unplugin-element-plus/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import Mkcert from 'vite-plugin-mkcert';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        Mkcert(),
        AutoImport({
          dts: './src/types/auto-imports.d.ts',
          imports: ['vue', 'vue-router'],
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          deep: false,
          dts: './src/types/components.d.ts',
          resolvers: [ElementPlusResolver()],
        }),
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        open: true,
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:8008/api/admin',
            ws: true,
          },
        },
      },
    },
  };
});
