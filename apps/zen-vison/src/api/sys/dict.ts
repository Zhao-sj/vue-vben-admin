import type { Nullable } from '@vben/types';

import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace DictApi {
  export type Color = 'danger' | 'info' | 'primary' | 'success' | 'warning';

  export interface TypeSimple extends BaseSimple {
    type: string;
  }

  export interface TypePageQuery {
    name?: string;
    type?: string;
    status?: number;
    createTime?: string;
  }

  export interface Type {
    id: number;
    name: string;
    type: string;
    status: number;
    remark: Nullable<string>;
    createTime: number;
  }

  export interface TypeAddModel {
    name: string;
    type: string;
    status: number;
    remark?: string;
  }

  export interface DataSimple {
    id: number;
    dictTypeId: number;
    label: string;
    value: string;
    color: DictApi.Color;
  }

  export interface DataPageQuery {
    dictTypeId: number;
    label?: string;
    status?: number;
  }

  export interface Data {
    id: number;
    dictTypeId: number;
    label: string;
    value: string;
    color: DictApi.Color;
    sort: number;
    remark: Nullable<string>;
    status: number;
    createTime: number;
  }

  export interface DataAddModel {
    dictTypeId: number;
    label: string;
    value: string;
    color?: DictApi.Color;
    sort: number;
    remark?: string;
    status: number;
  }
}

/**
 * 删除字典数据
 */
export function deleteDictDataApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/dict/data/${id}`);
}

/**
 * 更新字典数据
 */
export function updateDictDataApi(data: { id: number } & DictApi.DataAddModel) {
  return requestClient.put<boolean>(`${SYSTEM}/dict/data`, data);
}

/**
 * 创建字典数据
 */
export function addDictDataApi(data: DictApi.DataAddModel) {
  return requestClient.post<number>(`${SYSTEM}/dict/data`, data);
}

/**
 * 导出字典数据
 */
export function exportDictDataApi(params: DictApi.DataPageQuery) {
  return requestClient.download(`${SYSTEM}/dict/data/export`, {
    params,
  });
}

/**
 * 获取字典数据信息
 */
export function getDictDataApi(id: number) {
  return requestClient.get<DictApi.Data>(`${SYSTEM}/dict/data/${id}`);
}

/**
 * 获取字典数据分页列表
 */
export function getDictDataPageListApi(
  params: DictApi.DataPageQuery & PageParam,
) {
  return requestClient.get<PageResult<DictApi.Data>>(`${SYSTEM}/dict/data`, {
    params,
  });
}

/**
 * 获取字典数据精简列表
 */
export function getDictDataSimpleListApi(type: string) {
  return requestClient.get<DictApi.DataSimple[]>(
    `${SYSTEM}/dict/data/simple/${type}`,
  );
}

/**
 * 删除字典类型
 */
export function deleteDictTypeApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/dict/type/${id}`);
}

/**
 * 更新字典类型
 */
export function updateDictTypeApi(data: { id: number } & DictApi.TypeAddModel) {
  return requestClient.put<boolean>(`${SYSTEM}/dict/type`, data);
}

/**
 * 创建字典类型
 */
export function addDictTypeApi(data: DictApi.TypeAddModel) {
  return requestClient.post<number>(`${SYSTEM}/dict/type`, data);
}

/**
 * 导出字典类型
 */
export function exportDictTypeApi(params: DictApi.TypePageQuery) {
  return requestClient.download(`${SYSTEM}/dict/type/export`, {
    params,
  });
}

/**
 * 获取字典类型信息
 */
export function getDictTypeApi(id: number) {
  return requestClient.get<DictApi.Type>(`${SYSTEM}/dict/type/${id}`);
}

/**
 * 获取字典类型分页列表
 */
export function getDictTypePageListApi(
  params: DictApi.TypePageQuery & PageParam,
) {
  return requestClient.get<PageResult<DictApi.Type>>(`${SYSTEM}/dict/type`, {
    params,
  });
}

/**
 * 获取字典类型精简列表
 */
export function getDictTypeSimpleListApi() {
  return requestClient.get<DictApi.TypeSimple[]>(`${SYSTEM}/dict/type/simple`);
}
