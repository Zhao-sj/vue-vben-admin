import type { Nullable } from '@vben/types';

import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace TenantApi {
  export interface PageQuery {
    name?: string;
    contactName?: string;
    contactMobile?: string;
    status?: number;

    /**
     * @example 2024-05-20 00:00:00,2024-05-21 23:59:59
     */
    createTime?: string;
  }

  export interface Tenant {
    id: number;
    name: string;
    contactName: string;
    contactMobile: Nullable<string>;
    status: number;
    website: Nullable<string>;
    packageId: number;
    expireTime: number;
    accountCount: number;
    createTime: number;
  }

  export interface AddModel {
    name: string;
    contactName: string;
    contactMobile: string;
    status: number;
    website?: string;
    packageId: number;
    expireTime: number;
    accountCount: number;
    username: string;

    /** 使用SHA256消息摘要 */
    password: string;
  }

  export interface UpdateModel extends Omit<AddModel, 'password' | 'username'> {
    id: number;
  }

  export interface PackagePageQuery {
    name?: string;
    remark?: string;
    status?: number;
    createTime?: string;
  }

  export interface Package {
    id: number;
    name: string;
    status: number;
    remark: Nullable<string>;
    menuIds: number[];
    createTime: number;
  }

  export interface AddPackageModel {
    name: string;
    status: number;
    remark?: string;
    menuIds: number[];
  }

  export type UpdatePackageModel = { id: number } & TenantApi.AddPackageModel;
}

/**
 * 批量删除租户套餐
 */
export function batchDeleteTenantPackageApi(ids: number[]) {
  return requestClient.delete<boolean>(`${SYSTEM}/tenant/package`, {
    data: { ids },
  });
}

/**
 * 删除租户套餐
 */
export function deleteTenantPackageApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/tenant/package/${id}`);
}

/**
 * 更新租户套餐
 */
export function updateTenantPackageApi(data: TenantApi.UpdatePackageModel) {
  return requestClient.put<boolean>(`${SYSTEM}/tenant/package`, data);
}

/**
 * 创建租户套餐
 */
export function addTenantPackageApi(data: TenantApi.AddPackageModel) {
  return requestClient.post<number>(`${SYSTEM}/tenant/package`, data);
}

/**
 * 获取租户套餐
 */
export function getTenantPackageApi(id: number) {
  return requestClient.get<TenantApi.Package>(`${SYSTEM}/tenant/package/${id}`);
}

/**
 * 获取租户套餐分页列表
 */
export function getTenantPackagePageListApi(
  params: PageParam & TenantApi.PackagePageQuery,
) {
  return requestClient.get<PageResult<TenantApi.Package>>(
    `${SYSTEM}/tenant/package`,
    {
      params,
    },
  );
}

/**
 * 获取租户套餐精简列表
 */
export function getTenantPackageSimpleListApi() {
  return requestClient.get<BaseSimple[]>(`${SYSTEM}/tenant/package/simple`);
}

/**
 * 批量删除租户
 */
export function batchDeleteTenantApi(ids: number[]) {
  return requestClient.delete<boolean>(`${SYSTEM}/tenant`, { data: { ids } });
}

/**
 * 删除租户
 */
export function deleteTenantApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/tenant/${id}`);
}

/**
 * 更新租户
 */
export function updateTenantApi(data: TenantApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/tenant`, data);
}

/**
 * 创建租户
 */
export function addTenantApi(data: TenantApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/tenant`, data);
}

/**
 * 导出租户
 */
export function exportTenantApi(params: TenantApi.PageQuery) {
  return requestClient.download(`${SYSTEM}/tenant/export`, {
    params,
  });
}

/**
 * 获取租户信息
 */
export function getTenantApi(id: number) {
  return requestClient.get<TenantApi.Tenant>(`${SYSTEM}/tenant/${id}`);
}

/**
 * 获取租户分页列表
 */
export function getTenantPageListApi(params: PageParam & TenantApi.PageQuery) {
  return requestClient.get<PageResult<TenantApi.Tenant>>(`${SYSTEM}/tenant`, {
    params,
  });
}

/**
 * 获取租户精简列表
 */
export function getTenantSimpleListApi() {
  return requestClient.get<BaseSimple[]>(`${SYSTEM}/tenant/simple`);
}

/**
 * 获取租户列表（登录页面）
 */
export function getTenantListByNameApi(name: string) {
  return requestClient.get<BaseSimple[]>(`${SYSTEM}/tenant/search`, {
    params: { name },
  });
}
