import type { Nullable } from '@vben/types';

import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace RoleApi {
  export interface PageQuery extends PageParam {
    name?: string;
    code?: string;
    status?: number;
    createTime?: string;
  }

  export interface Role {
    id: number;
    name: string;
    code: string;
    sort: number;
    status: number;
    type: number;
    remark: Nullable<string>;
    dataScope: number;
    dataScopeDeptIds: number[];
    createTime: number;
  }

  export interface AddModel {
    name: string;
    code: string;
    sort: number;
    remark?: string;
  }

  export interface AssignDataScope {
    roleId: number;
    dataScope: number;
    dataScopeDeptIds?: number[];
  }

  export interface AssignMenu {
    roleId: number;
    menuIds: number[];
  }
}

/**
 * 赋予角色菜单
 */
export function assignRoleMenuApi(data: RoleApi.AssignMenu) {
  return requestClient.post<boolean>(
    `${SYSTEM}/permission/assign-role-menu`,
    data,
  );
}

/**
 * 赋予角色数据权限
 */
export function assignRoleDataScopeApi(data: RoleApi.AssignDataScope) {
  return requestClient.post<boolean>(
    `${SYSTEM}/permission/assign-role-data-scope`,
    data,
  );
}

/**
 * 获取角色拥有的菜单编号
 */
export function getRoleMenuListApi(roleId: number) {
  return requestClient.get<number[]>(`${SYSTEM}/permission/role-menu-list`, {
    params: { roleId },
  });
}

/**
 * 删除角色
 */
export function deleteRoleApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/role/${id}`);
}

/**
 * 更新角色
 */
export function updateRoleApi(data: { id: number } & RoleApi.AddModel) {
  return requestClient.put<boolean>(`${SYSTEM}/role`, data);
}

/**
 * 创建角色
 */
export function addRoleApi(data: RoleApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/role`, data);
}

/**
 * 导出角色
 */
export function exportRoleApi(params: RoleApi.PageQuery) {
  return requestClient.get<void>(`${SYSTEM}/role/export`, {
    params,
  });
}

/**
 * 获取角色信息
 */
export function getRoleApi(id: number) {
  return requestClient.get<RoleApi.Role>(`${SYSTEM}/role/${id}`);
}

/**
 * 获取角色分页列表
 */
export function getRolePageListApi(params: RoleApi.PageQuery) {
  return requestClient.get<PageResult<RoleApi.Role>>(`${SYSTEM}/role`, {
    params,
  });
}

/**
 * 获取角色精简列表
 */
export function getRoleSimpleListApi() {
  return requestClient.get<BaseSimple[]>(`${SYSTEM}/role/simple`);
}
