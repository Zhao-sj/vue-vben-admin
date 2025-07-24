import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { cloneDeep, resetStaticRoutes } from '@vben/utils';

import { createRouterGuard } from './guard';
import { routes } from './routes';

/**
 *  @zh_CN 创建vue-router实例
 */
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
  // 是否应该禁止尾部斜杠。
  // strict: true,
});

const defaultRoutes = cloneDeep(routes);
const resetRoutes = () => resetStaticRoutes(router, defaultRoutes);

// 创建路由守卫
createRouterGuard(router);

export { resetRoutes, router };
