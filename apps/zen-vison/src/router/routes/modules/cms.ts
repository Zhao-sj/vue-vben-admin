import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'CmsManage',
    path: '/cms',
    meta: {
      icon: 'lucide:book-text',
      order: 13,
      title: $t('menu.cms.title'),
    },
    children: [
      {
        name: 'CmsArticleManage',
        path: '/cms/article',
        component: () => import('#/views/cms/article/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('menu.cms.article.title'),
        },
      },
      {
        name: 'CmsCategoryManage',
        path: '/cms/category',
        component: () => import('#/views/cms/category/index.vue'),
        meta: {
          icon: 'lucide:book-type',
          title: $t('menu.cms.category.title'),
        },
      },
      {
        name: 'CmsTagManage',
        path: '/cms/tag',
        component: () => import('#/views/cms/tag/index.vue'),
        meta: {
          icon: 'lucide:tag',
          title: $t('menu.cms.tag.title'),
        },
      },
    ],
  },
];

export default routes;
