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
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'crypto-js': ['crypto-js'],
              'element-plus': ['element-plus'],
              tinymce: ['tinymce'],
              'tinymce-icons': ['tinymce/icons/default/icons'],
              'tinymce-plugin': [
                'tinymce/plugins/image',
                'tinymce/plugins/advlist',
                'tinymce/plugins/anchor',
                'tinymce/plugins/autolink',
                'tinymce/plugins/autosave',
                'tinymce/plugins/code',
                'tinymce/plugins/codesample',
                'tinymce/plugins/directionality',
                'tinymce/plugins/fullscreen',
                'tinymce/plugins/hr',
                'tinymce/plugins/insertdatetime',
                'tinymce/plugins/link',
                'tinymce/plugins/lists',
                'tinymce/plugins/media',
                'tinymce/plugins/nonbreaking',
                'tinymce/plugins/noneditable',
                'tinymce/plugins/pagebreak',
                'tinymce/plugins/paste',
                'tinymce/plugins/preview',
                'tinymce/plugins/print',
                'tinymce/plugins/save',
                'tinymce/plugins/searchreplace',
                'tinymce/plugins/tabfocus',
                'tinymce/plugins/table',
                'tinymce/plugins/template',
                'tinymce/plugins/textpattern',
                'tinymce/plugins/visualblocks',
                'tinymce/plugins/visualchars',
                'tinymce/plugins/wordcount',
              ],
              'tinymce-theme': ['tinymce/themes/silver'],
              vben: [
                '@vben/access',
                '@vben/constants',
                '@vben/stores',
                '@vben/hooks',
                '@vben/icons',
                '@vben/preferences',
                '@vben/locales',
              ],
              'vben-layouts': ['@vben/layouts'],
              'vben-styles': ['@vben/styles'],
              'vben-ui': ['@vben/common-ui'],
              'vben-utils': ['@vben/utils', '@vben/request', '@vben/types'],
              'vxe-table': ['vxe-table'],
              'vxe-ui': ['vxe-pc-ui'],
              'zen-utils': ['lodash-es', 'ua-parser-js', 'dayjs', 'mitt'],
            },
          },
        },
      },
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
