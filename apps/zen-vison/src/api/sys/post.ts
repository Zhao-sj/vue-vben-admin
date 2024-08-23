import type { Nullable } from '@vben/types';

import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace PostApi {
  export interface PageQuery {
    name?: string;
    code?: string;
    status?: number;
  }

  export interface Post {
    id: number;
    name: string;
    code: string;
    sort: number;
    status: number;
    remark: Nullable<string>;
    createTime: number;
  }

  export interface AddModel {
    name: string;
    code: string;
    sort: number;
    status: number;
    remark?: string;
  }
}

/**
 * 删除岗位
 */
export function deletePostApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/post/${id}`);
}

/**
 * 更新岗位
 */
export function updatePostApi(data: { id: number } & PostApi.AddModel) {
  return requestClient.put<boolean>(`${SYSTEM}/post`, data);
}

/**
 * 创建岗位
 */
export function addPostApi(data: PostApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/post`, data);
}

/**
 * 导出岗位
 */
export function exportPostApi(params: PostApi.PageQuery) {
  return requestClient.download(`${SYSTEM}/post/export`, {
    params,
  });
}

/**
 * 获取岗位信息
 */
export function getPostApi(id: number) {
  return requestClient.get<PostApi.Post>(`${SYSTEM}/post/${id}`);
}

/**
 * 获取岗位分页列表
 */
export function getPostPageListApi(params: PageParam & PostApi.PageQuery) {
  return requestClient.get<PageResult<PostApi.Post>>(`${SYSTEM}/post`, {
    params,
  });
}

/**
 * 获取岗位精简列表
 */
export function getPostSimpleListApi() {
  return requestClient.get<BaseSimple[]>(`${SYSTEM}/post/simple`);
}
