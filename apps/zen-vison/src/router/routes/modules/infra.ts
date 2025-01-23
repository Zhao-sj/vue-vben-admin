import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:wrench',
      order: 12,
      title: $t('menu.infra.title'),
    },
    name: 'InfraManage',
    path: '/infra',
    children: [
      {
        name: 'FileManage',
        path: '/infra/file',
        meta: {
          icon: 'lucide:folder-cog',
          title: $t('menu.infra.file.title'),
        },
        children: [
          {
            name: 'FileConfig',
            path: '/infra/file/config',
            component: () => import('#/views/infra/file/config/index.vue'),
            meta: {
              icon: 'lucide:file-cog',
              title: $t('menu.infra.file.config.title'),
            },
          },
          {
            name: 'FileList',
            path: '/infra/file/list',
            component: () => import('#/views/infra/file/list/index.vue'),
            meta: {
              icon: 'lucide:file-chart-column-increasing',
              title: $t('menu.infra.file.list.title'),
            },
          },
        ],
      },
    ],
  },
];

export default routes;
