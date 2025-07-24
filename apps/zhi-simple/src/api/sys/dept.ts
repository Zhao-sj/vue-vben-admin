import type { Nullable } from '@vben/types';

import type { BaseSimple } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace DeptApi {
  export interface Simple extends BaseSimple {
    parentId: number;
  }

  export interface Query {
    name?: string;
    status?: string;
  }

  export interface Dept {
    id: number;
    name: string;
    parentId: number;
    sort: number;
    leaderId: Nullable<number>;
    phone: Nullable<string>;
    email: Nullable<string>;
    status: number;
    createTime: number;
  }

  export interface AddModel {
    name: string;
    parentId?: number;
    sort: number;
    leaderId?: number;
    phone?: string;
    email?: string;
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 删除部门
 */
export function deleteDeptApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/dept/${id}`);
}

/**
 * 更新部门
 */
export function updateDeptApi(data: DeptApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/dept`, data);
}

/**
 * 创建部门
 */
export function addDeptApi(data: DeptApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/dept`, data);
}

/**
 * 获取部门信息
 */
export function getDeptApi(id: number) {
  return requestClient.get<DeptApi.Dept>(`${SYSTEM}/dept/${id}`);
}

/**
 * 获取部门列表
 */
export function getDeptListApi(params: DeptApi.Query) {
  return requestClient.get<DeptApi.Dept[]>(`${SYSTEM}/dept`, {
    params,
  });
}

/**
 * 获取部门精简列表
 */
export function getDeptSimpleListApi() {
  return requestClient.get<DeptApi.Simple[]>(`${SYSTEM}/dept/simple`);
}
