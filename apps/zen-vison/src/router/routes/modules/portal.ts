import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PortalManage',
    path: '/portal',
    meta: {
      icon: 'lucide:globe',
      order: 14,
      title: $t('menu.portal.title'),
    },
    children: [
      {
        name: 'PortalConsultManage',
        path: '/portal/consult',
        component: () => import('#/views/portal/consult/index.vue'),
        meta: {
          icon: 'lucide:message-square-reply',
          title: $t('menu.portal.consult.title'),
        },
      },
    ],
  },
];

export default routes;
