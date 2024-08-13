import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ant-design:setting-outlined',
      order: 999,
      title: $t('zen.menu.manage.system'),
    },
    name: 'SystemManage',
    path: '/system',
    children: [
      {
        name: 'TenantManage',
        path: '/system/tenant',
        meta: {
          icon: 'majesticons:users-line',
          title: $t('zen.menu.manage.tenant'),
        },
        children: [
          {
            name: 'TenantList',
            path: '/system/tenant/list',
            component: () => import('#/views/system/tenant/list/index.vue'),
            meta: {
              icon: 'hugeicons:user-list',
              title: $t('zen.menu.manage.tenantList'),
            },
          },
          {
            name: 'TenantPackage',
            path: '/system/tenant/package',
            component: () => import('#/views/system/tenant/package/index.vue'),
            meta: {
              icon: 'hugeicons:package',
              title: $t('zen.menu.manage.tenantPackage'),
            },
          },
        ],
      },
      {
        name: 'UserManage',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          icon: 'ep:user',
          title: $t('zen.menu.manage.user'),
        },
      },
      {
        name: 'RoleManage',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          icon: 'icon-park-outline:user-positioning',
          title: $t('zen.menu.manage.role'),
        },
      },
      {
        name: 'MenuManage',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          icon: 'ep:menu',
          title: $t('zen.menu.manage.menu'),
        },
      },
      {
        name: 'DeptManage',
        path: '/system/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          icon: 'carbon:layers',
          title: $t('zen.menu.manage.dept'),
        },
      },
      {
        name: 'PostManage',
        path: '/system/post',
        component: () => import('#/views/system/post/index.vue'),
        meta: {
          icon: 'mdi:account-tie',
          title: $t('zen.menu.manage.post'),
        },
      },
      {
        name: 'LogManage',
        path: '/system/log',
        meta: {
          icon: 'ph:read-cv-logo-bold',
          title: $t('zen.menu.manage.log'),
        },
        children: [
          {
            name: 'LoginLog',
            path: '/system/log/login',
            component: () => import('#/views/system/log/login/index.vue'),
            meta: {
              icon: 'ri:login-box-line',
              title: $t('zen.menu.manage.loginLog'),
            },
          },
          {
            name: 'AccessLog',
            path: '/system/log/access',
            component: () => import('#/views/system/log/access/index.vue'),
            meta: {
              icon: 'solar:clipboard-list-broken',
              title: $t('zen.menu.manage.accessLog'),
            },
          },
          {
            name: 'ErrorLog',
            path: '/system/log/error',
            component: () => import('#/views/system/log/error/index.vue'),
            meta: {
              icon: 'ic:round-error-outline',
              title: $t('zen.menu.manage.errorLog'),
            },
          },
        ],
      },
      {
        name: 'DictManage',
        path: '/system/dict',
        component: () => import('#/views/system/dict/index.vue'),
        meta: {
          icon: 'streamline:dictionary-language-book',
          title: $t('zen.menu.manage.dict'),
        },
      },
      {
        name: 'NoticeManage',
        path: '/system/notice',
        component: () => import('#/views/system/notice/index.vue'),
        meta: {
          icon: 'icon-park-outline:volume-notice',
          title: $t('zen.menu.manage.notice'),
        },
      },
    ],
  },
];

export default routes;
