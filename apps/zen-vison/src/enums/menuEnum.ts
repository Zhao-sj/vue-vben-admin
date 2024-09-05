import type { RouteMeta } from '@vben/types';

export enum MenuType {
  /** 按钮 */
  BUTTON = 3,

  /** 目录 */
  DIR = 1,

  /** 菜单 */
  MENU = 2,
}

export const MENU_ROOT = 0;

export const defaultMeta: RouteMeta = {
  affixTab: false,
  badgeType: 'normal',
  badgeVariants: 'success',
  hideChildrenInMenu: false,
  hideInBreadcrumb: false,
  hideInMenu: false,
  hideInTab: false,
  keepAlive: false,
  menuVisibleWithForbidden: false,
  title: '',
};
