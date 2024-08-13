import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { type AuthApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(
  options: GenerateMenuAndRoutesOptions,
  menus: AuthApi.Menu[] = [],
) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => menu2Route(menus),
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

function menu2Route(
  menus: AuthApi.Menu[],
  path = '',
): RouteRecordStringComponent[] {
  return menus.map(
    (item) =>
      ({
        ...(item.component ? { component: item.component } : {}),
        ...(item.children
          ? { children: menu2Route(item.children, path + item.path) }
          : {}),
        meta: {
          ...item.meta,
          ...(item.meta?.title ? {} : { title: item.name }),
        },
        name: item.componentName,
        path: `${path === '/' ? '' : path}${item.path}`,
      }) as RouteRecordStringComponent,
  );
}

export { generateAccess };
