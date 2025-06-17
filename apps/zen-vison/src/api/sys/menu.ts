import type { Nullable, RouteMeta } from '@vben/types';

import type { BaseSimple } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace MenuApi {
  export interface Simple extends BaseSimple {
    parentId: number;
    type: number;
    icon: Nullable<string>;
  }

  export interface Query {
    name?: string;
    status?: string;
  }

  export interface Menu {
    id: number;
    name: string;
    permission: Nullable<string>;
    type: number;
    sort: number;
    parentId: number;
    path: Nullable<string>;
    component: Nullable<string>;
    componentName: Nullable<string>;
    meta: Nullable<RouteMeta>;
    status: number;
    createTime: number;
  }

  export interface AddModel {
    name: string;
    permission?: string;
    type: number;
    sort: number;
    parentId: number;
    path?: string;
    component?: string;
    componentName?: string;
    meta?: RouteMeta;
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 获取菜单组件名称是否唯一
 */
export function getMenuUniqueApi(name: string) {
  return requestClient.get<boolean>(`${SYSTEM}/menu/unique/${name}`);
}

/**
 * 删除菜单
 */
export function deleteMenuApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/menu/${id}`);
}

/**
 * 更新菜单
 */
export function updateMenuApi(data: MenuApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/menu`, data);
}

/**
 * 创建菜单
 */
export function addMenuApi(data: MenuApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/menu`, data);
}

/**
 * 获取菜单信息
 */
export function getMenuApi(id: number) {
  return requestClient.get<MenuApi.Menu>(`${SYSTEM}/menu/${id}`);
}

/**
 * 获取菜单列表
 */
export function getMenuListApi(params: MenuApi.Query) {
  return requestClient.get<MenuApi.Menu[]>(`${SYSTEM}/menu`, {
    params,
  });
}

/**
 * 获取菜单精简列表
 */
export function getMenuSimpleListApi() {
  return requestClient.get<MenuApi.Simple[]>(`${SYSTEM}/menu/simple`);
}
