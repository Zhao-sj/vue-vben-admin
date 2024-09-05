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
    path: '/sys',
    children: [
      {
        name: 'TenantManage',
        path: '/sys/tenant',
        meta: {
          icon: 'majesticons:users-line',
          title: $t('zen.menu.manage.tenant'),
        },
        children: [
          {
            name: 'TenantList',
            path: '/sys/tenant/list',
            component: () => import('#/views/sys/tenant/list/index.vue'),
            meta: {
              icon: 'hugeicons:user-list',
              title: $t('zen.menu.manage.tenantList'),
            },
          },
          {
            name: 'TenantPackage',
            path: '/sys/tenant/package',
            component: () => import('#/views/sys/tenant/package/index.vue'),
            meta: {
              icon: 'hugeicons:package',
              title: $t('zen.menu.manage.tenantPackage'),
            },
          },
        ],
      },
      {
        name: 'UserManage',
        path: '/sys/user',
        component: () => import('#/views/sys/user/index.vue'),
        meta: {
          icon: 'ep:user',
          title: $t('zen.menu.manage.user'),
        },
      },
      {
        name: 'RoleManage',
        path: '/sys/role',
        component: () => import('#/views/sys/role/index.vue'),
        meta: {
          icon: 'icon-park-outline:user-positioning',
          title: $t('zen.menu.manage.role'),
        },
      },
      {
        name: 'MenuManage',
        path: '/sys/menu',
        component: () => import('#/views/sys/menu/index.vue'),
        meta: {
          icon: 'ep:menu',
          title: $t('zen.menu.manage.menu'),
        },
      },
      {
        name: 'DeptManage',
        path: '/sys/dept',
        component: () => import('#/views/sys/dept/index.vue'),
        meta: {
          icon: 'carbon:layers',
          title: $t('zen.menu.manage.dept'),
        },
      },
      {
        name: 'PostManage',
        path: '/sys/post',
        component: () => import('#/views/sys/post/index.vue'),
        meta: {
          icon: 'mdi:account-tie',
          title: $t('zen.menu.manage.post'),
        },
      },
      {
        name: 'LogManage',
        path: '/sys/log',
        meta: {
          icon: 'ph:read-cv-logo-bold',
          title: $t('zen.menu.manage.log'),
        },
        children: [
          {
            name: 'LoginLog',
            path: '/sys/log/login',
            component: () => import('#/views/sys/log/login/index.vue'),
            meta: {
              icon: 'ri:login-box-line',
              title: $t('zen.menu.manage.loginLog'),
            },
          },
          {
            name: 'AccessLog',
            path: '/sys/log/access',
            component: () => import('#/views/sys/log/access/index.vue'),
            meta: {
              icon: 'solar:clipboard-list-broken',
              title: $t('zen.menu.manage.accessLog'),
            },
          },
          {
            name: 'ErrorLog',
            path: '/sys/log/error',
            component: () => import('#/views/sys/log/error/index.vue'),
            meta: {
              icon: 'ic:round-error-outline',
              title: $t('zen.menu.manage.errorLog'),
            },
          },
        ],
      },
      {
        name: 'DictManage',
        path: '/sys/dict',
        component: () => import('#/views/sys/dict/type/index.vue'),
        meta: {
          icon: 'streamline:dictionary-language-book',
          title: $t('zen.menu.manage.dict'),
        },
      },
      {
        name: 'NoticeManage',
        path: '/sys/notice',
        component: () => import('#/views/sys/notice/index.vue'),
        meta: {
          icon: 'icon-park-outline:volume-notice',
          title: $t('zen.menu.manage.notice'),
        },
      },
    ],
  },
];

export default routes;
