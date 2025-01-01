import type { BaseSimple, PageResult } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { CMS } = ModuleEnum;

export namespace CategoryApi {
  export interface Simple extends BaseSimple {
    parentId: number;
  }

  export interface Query {
    name?: string;
    status?: number;
  }

  export interface Category {
    id: number;
    parentId: number;
    name: string;
    code: string;
    sort: number;
    status: number;
    createTime: number;
  }

  export interface AddModel {
    parentId: number;
    name: string;
    code: string;
    sort: number;
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 删除分类
 */
export function deleteCmsCategoryApi(id: number) {
  return requestClient.delete<boolean>(`${CMS}/category/${id}`);
}

/**
 * 更新分类
 */
export function updateCmsCategoryApi(data: CategoryApi.UpdateModel) {
  return requestClient.put<boolean>(`${CMS}/category`, data);
}

/**
 * 创建分类
 */
export function addCmsCategoryApi(data: CategoryApi.AddModel) {
  return requestClient.post<number>(`${CMS}/category`, data);
}

/**
 * 获取分类信息
 */
export function getCmsCategoryApi(id: number) {
  return requestClient.get<CategoryApi.Category>(`${CMS}/category/${id}`);
}

/**
 * 获取分类分页列表
 */
export function getCmsCategoryListApi(params: CategoryApi.Query) {
  return requestClient.get<PageResult<CategoryApi.Category>>(
    `${CMS}/category`,
    { params },
  );
}

/**
 * 获取分类精简列表
 */
export function getCmsCategorySimpleApi() {
  return requestClient.get<CategoryApi.Simple[]>(`${CMS}/category/simple`);
}
