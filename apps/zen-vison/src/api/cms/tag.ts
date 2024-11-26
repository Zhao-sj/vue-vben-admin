import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { CMS } = ModuleEnum;

export namespace TagApi {
  export interface PageQuery {
    name?: string;
    status?: number;
  }

  export interface Tag {
    id: number;
    name: string;
    status: number;
    createTime: number;
  }

  export interface AddModel {
    name: string;
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 批量删除标签
 */
export function batchDeleteCmsTagApi(ids: number[]) {
  return requestClient.delete<boolean>(`${CMS}/tag`, { data: { ids } });
}

/**
 * 删除标签
 */
export function deleteCmsTagApi(id: number) {
  return requestClient.delete<boolean>(`${CMS}/tag/${id}`);
}

/**
 * 更新标签
 */
export function updateCmsTagApi(data: TagApi.UpdateModel) {
  return requestClient.put<boolean>(`${CMS}/tag`, data);
}

/**
 * 创建标签
 */
export function addCmsTagApi(data: TagApi.AddModel) {
  return requestClient.post<number>(`${CMS}/tag`, data);
}

/**
 * 获取标签信息
 */
export function getCmsTagApi(id: number) {
  return requestClient.get<TagApi.Tag>(`${CMS}/tag/${id}`);
}

/**
 * 获取标签分页列表
 */
export function getCmsTagPageApi(params: PageParam & TagApi.PageQuery) {
  return requestClient.get<PageResult<TagApi.Tag>>(`${CMS}/tag`, {
    params,
  });
}

/**
 * 获取标签精简列表
 */
export function getCmsTagSimpleApi() {
  return requestClient.get<BaseSimple[]>(`${CMS}/tag/simple`);
}
