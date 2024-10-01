import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:bolt',
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
          icon: 'lucide:users',
          title: $t('zen.menu.manage.tenant'),
        },
        children: [
          {
            name: 'TenantList',
            path: '/sys/tenant/list',
            component: () => import('#/views/sys/tenant/list/index.vue'),
            meta: {
              icon: 'lucide:book-user',
              title: $t('zen.menu.manage.tenantList'),
            },
          },
          {
            name: 'TenantPackage',
            path: '/sys/tenant/package',
            component: () => import('#/views/sys/tenant/package/index.vue'),
            meta: {
              icon: 'lucide:combine',
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
          icon: 'lucide:user-cog',
          title: $t('zen.menu.manage.user'),
        },
      },
      {
        name: 'RoleManage',
        path: '/sys/role',
        component: () => import('#/views/sys/role/index.vue'),
        meta: {
          icon: 'lucide:contact-round',
          title: $t('zen.menu.manage.role'),
        },
      },
      {
        name: 'MenuManage',
        path: '/sys/menu',
        component: () => import('#/views/sys/menu/index.vue'),
        meta: {
          icon: 'lucide:menu',
          title: $t('zen.menu.manage.menu'),
        },
      },
      {
        name: 'DeptManage',
        path: '/sys/dept',
        component: () => import('#/views/sys/dept/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: $t('zen.menu.manage.dept'),
        },
      },
      {
        name: 'PostManage',
        path: '/sys/post',
        component: () => import('#/views/sys/post/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('zen.menu.manage.post'),
        },
      },
      {
        name: 'LogManage',
        path: '/sys/log',
        meta: {
          icon: 'lucide:logs',
          title: $t('zen.menu.manage.log'),
        },
        children: [
          {
            name: 'LoginLog',
            path: '/sys/log/login',
            component: () => import('#/views/sys/log/login/index.vue'),
            meta: {
              icon: 'lucide:log-in',
              title: $t('zen.menu.manage.loginLog'),
            },
          },
          {
            name: 'AccessLog',
            path: '/sys/log/access',
            component: () => import('#/views/sys/log/access/index.vue'),
            meta: {
              icon: 'lucide:scroll-text',
              title: $t('zen.menu.manage.accessLog'),
            },
          },
          {
            name: 'ErrorLog',
            path: '/sys/log/error',
            component: () => import('#/views/sys/log/error/index.vue'),
            meta: {
              icon: 'lucide:triangle-alert',
              title: $t('zen.menu.manage.errorLog'),
            },
          },
        ],
      },
      {
        name: 'DictTypeManage',
        path: '/sys/dict/type',
        component: () => import('#/views/sys/dict/type/index.vue'),
        meta: {
          icon: 'streamline:dictionary-language-book',
          title: $t('zen.menu.manage.dict'),
        },
      },
      {
        name: 'DictDataManage',
        path: '/sys/dict/data/:id',
        component: () => import('#/views/sys/dict/data/index.vue'),
        meta: {
          activePath: '/sys/dict/type',
          hideInMenu: true,
          icon: 'lucide:text-search',
          title: $t('zen.menu.manage.dictData'),
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
      {
        name: 'AreaManage',
        path: '/sys/area',
        component: () => import('#/views/sys/area/index.vue'),
        meta: {
          icon: 'lucide:map-pinned',
          title: $t('zen.menu.manage.area'),
        },
      },
      {
        name: 'AccountSetting',
        path: '/setting',
        component: () => import('#/views/account/setting/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:user-round-pen',
          title: $t('zen.menu.account.profile'),
        },
      },
    ],
  },
];

export default routes;
