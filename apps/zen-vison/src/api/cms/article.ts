import type { Nullable } from '@vben/types';

import {
  type BaseSimple,
  ModuleEnum,
  type PageParam,
  type PageResult,
} from '#/api/common';
import { requestClient } from '#/api/request';

const { CMS } = ModuleEnum;

export namespace ArticleApi {
  export interface PageQuery {
    title?: string;
    description?: string;
    categoryId?: number;
    tagIds?: number[];
    createTime?: [Date, Date] | [string, string];
  }

  export interface Article {
    id: number;
    title: string;
    description: Nullable<string>;
    content: string;
    categoryId: number;
    categoryName: string;
    creator: string;
    creatorName: string;
    tagList: BaseSimple[];
    status: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    favoriteCount: number;
    forwardCount: number;
    createTime: number;
  }

  export interface AddModel {
    banner: string;
    title: string;
    description?: string;
    content: string;
    categoryId: number;
    tagIds?: number[];
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 删除文章
 */
export function deleteCmsArticleApi(id: number) {
  return requestClient.delete<boolean>(`${CMS}/article/${id}`);
}

/**
 * 更新文章
 */
export function updateCmsArticleApi(data: ArticleApi.UpdateModel) {
  return requestClient.put<boolean>(`${CMS}/article`, data);
}

/**
 * 创建文章
 */
export function addCmsArticleApi(data: ArticleApi.AddModel) {
  return requestClient.post<number>(`${CMS}/article`, data);
}

/**
 * 获取文章信息
 */
export function getCmsArticleApi(id: number) {
  return requestClient.get<ArticleApi.Article>(`${CMS}/article/${id}`);
}

/**
 * 获取文章分页列表
 */
export function getCmsArticlePageApi(params: ArticleApi.PageQuery & PageParam) {
  return requestClient.get<PageResult<ArticleApi.Article>>(`${CMS}/article`, {
    params,
  });
}
