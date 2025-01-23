import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bolt',
      order: 11,
      title: $t('menu.sys.title'),
    },
    name: 'SystemManage',
    path: '/sys',
    children: [
      {
        name: 'TenantManage',
        path: '/sys/tenant',
        meta: {
          icon: 'lucide:users',
          title: $t('menu.sys.tenant.title'),
        },
        children: [
          {
            name: 'TenantList',
            path: '/sys/tenant/list',
            component: () => import('#/views/sys/tenant/list/index.vue'),
            meta: {
              icon: 'lucide:book-user',
              title: $t('menu.sys.tenant.list'),
            },
          },
          {
            name: 'TenantPackage',
            path: '/sys/tenant/package',
            component: () => import('#/views/sys/tenant/package/index.vue'),
            meta: {
              icon: 'lucide:combine',
              title: $t('menu.sys.tenant.package'),
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
          title: $t('menu.sys.user'),
        },
      },
      {
        name: 'RoleManage',
        path: '/sys/role',
        component: () => import('#/views/sys/role/index.vue'),
        meta: {
          icon: 'lucide:contact-round',
          title: $t('menu.sys.role'),
        },
      },
      {
        name: 'MenuManage',
        path: '/sys/menu',
        component: () => import('#/views/sys/menu/index.vue'),
        meta: {
          icon: 'lucide:menu',
          title: $t('menu.sys.menu'),
        },
      },
      {
        name: 'DeptManage',
        path: '/sys/dept',
        component: () => import('#/views/sys/dept/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: $t('menu.sys.dept'),
        },
      },
      {
        name: 'PostManage',
        path: '/sys/post',
        component: () => import('#/views/sys/post/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('menu.sys.post'),
        },
      },
      {
        name: 'DictTypeManage',
        path: '/sys/dict/type',
        component: () => import('#/views/sys/dict/type/index.vue'),
        meta: {
          icon: 'streamline:dictionary-language-book',
          title: $t('menu.sys.dict.title'),
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
          title: $t('menu.sys.dict.data'),
        },
      },
      {
        name: 'MessageManage',
        path: '/sys/message',
        meta: {
          icon: 'lucide:bot-message-square',
          title: $t('menu.sys.message.title'),
        },
        children: [
          {
            name: 'NoticeManage',
            path: '/sys/message/notice',
            component: () => import('#/views/sys/message/notice/index.vue'),
            meta: {
              icon: 'icon-park-outline:volume-notice',
              title: $t('menu.sys.message.notice'),
            },
          },
        ],
      },
      {
        name: 'LogManage',
        path: '/sys/log',
        meta: {
          icon: 'lucide:logs',
          title: $t('menu.sys.log.title'),
        },
        children: [
          {
            name: 'LoginLog',
            path: '/sys/log/login',
            component: () => import('#/views/sys/log/login/index.vue'),
            meta: {
              icon: 'lucide:log-in',
              title: $t('menu.sys.log.login'),
            },
          },
          {
            name: 'AccessLog',
            path: '/sys/log/access',
            component: () => import('#/views/sys/log/access/index.vue'),
            meta: {
              icon: 'lucide:scroll-text',
              title: $t('menu.sys.log.access'),
            },
          },
          {
            name: 'ErrorLog',
            path: '/sys/log/error',
            component: () => import('#/views/sys/log/error/index.vue'),
            meta: {
              icon: 'lucide:triangle-alert',
              title: $t('menu.sys.log.error'),
            },
          },
        ],
      },
      {
        name: 'OAuth2',
        path: '/sys/oauth2',
        meta: {
          icon: 'lucide:shield-check',
          title: $t('menu.sys.oauth2.title'),
        },
        children: [
          {
            name: 'OAuth2Client',
            path: '/sys/oauth2/client',
            component: () => import('#/views/sys/oauth2/client/index.vue'),
            meta: {
              icon: 'lucide:layout-grid',
              title: $t('menu.sys.oauth2.client'),
            },
          },
          {
            name: 'OAuth2Token',
            path: '/sys/oauth2/token',
            component: () => import('#/views/sys/oauth2/token/index.vue'),
            meta: {
              icon: 'lucide:key-round',
              title: $t('menu.sys.oauth2.token'),
            },
          },
        ],
      },
      {
        name: 'AreaManage',
        path: '/sys/area',
        component: () => import('#/views/sys/area/index.vue'),
        meta: {
          icon: 'lucide:map-pinned',
          title: $t('menu.sys.area'),
        },
      },
      {
        name: 'AccountSetting',
        path: '/setting',
        component: () => import('#/views/account/setting/index.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:user-round-pen',
          title: $t('menu.account.profile'),
        },
      },
    ],
  },
];

export default routes;
