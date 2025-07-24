import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import type { AuthApi } from '#/api';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { cloneDeep } from 'lodash-es';

import { MenuType } from '#/enums';
import { BasicLayout, IFrameView } from '#/layouts';

import { internalRoutes } from './routes';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(
  options: GenerateMenuAndRoutesOptions,
  menus: AuthApi.Menu[] = [],
) {
  menus.forEach((item) => {
    if (item.type === MenuType.DIR) {
      item.component = item.component || 'BasicLayout';
    }
  });

  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => [
      ...cloneDeep(internalRoutes),
      ...menu2Route(menus),
    ],
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

function menu2Route(menus: AuthApi.Menu[]): RouteRecordStringComponent[] {
  return menus.map((item) => {
    const record = {
      name: item.name,
      path: item.path,
      component:
        item.type === MenuType.EMBEDDED || item.type === MenuType.LINK
          ? 'IFrameView'
          : item.component,
      meta: {
        ...item.meta,
        ...(item.meta?.title ? {} : { title: item.name }),
        activePath: item.meta?.activePath || item.path,
      },
    } as RouteRecordStringComponent;

    if (item.children) {
      record.children = menu2Route(item.children);
    }

    return record;
  });
}

export { generateAccess };
