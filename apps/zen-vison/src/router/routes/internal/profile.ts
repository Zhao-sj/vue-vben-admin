import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '#/locales';

const routes: RouteRecordStringComponent[] = [
  {
    component: 'BasicLayout',
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    redirect: '/dashboard/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: $t('menu.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          icon: 'carbon:workspace-import',
          title: $t('menu.dashboard.workspace'),
        },
      },
      {
        name: 'Profile',
        path: '/profile',
        component: '/_core/profile/index',
        meta: {
          icon: 'lucide:user-round-pen',
          title: $t('menu.dashboard.profile'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
