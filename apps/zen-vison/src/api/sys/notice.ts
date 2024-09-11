import { ModuleEnum, type PageParam, type PageResult } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace NoticeApi {
  export interface PageQuery {
    title?: string;
    status?: number;
  }

  export interface Notice {
    id: number;
    type: number;
    title: string;
    content: string;
    status: number;
    createTime: number;
  }

  export interface AddModel {
    type: number;
    title: string;
    content: string;
    status: number;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }
}

/**
 * 推送通知公告
 */
export function pushNoticeApi(id: number) {
  return requestClient.post<boolean>(
    `${SYSTEM}/notice/push`,
    {},
    { params: { id } },
  );
}

/**
 * 批量删除通知公告
 */
export function batchDeleteNoticeApi(ids: number[]) {
  return requestClient.delete<boolean>(`${SYSTEM}/notice`, { data: { ids } });
}

/**
 * 删除通知公告
 */
export function deleteNoticeApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/notice/${id}`);
}

/**
 * 更新通知公告
 */
export function updateNoticeApi(data: NoticeApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/notice`, data);
}

/**
 * 创建通知公告
 */
export function addNoticeApi(data: NoticeApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/notice`, data);
}

/**
 * 获取通知公告信息
 */
export function getNoticeApi(id: number) {
  return requestClient.get<NoticeApi.Notice>(`${SYSTEM}/notice/${id}`);
}

/**
 * 获取通知公告分页列表
 */
export function getNoticePageListApi(params: NoticeApi.PageQuery & PageParam) {
  return requestClient.get<PageResult<NoticeApi.Notice>>(`${SYSTEM}/notice`, {
    params,
  });
}
