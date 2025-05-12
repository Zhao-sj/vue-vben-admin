import type { Nullable } from '@vben/types';

import type { PageParam, PageResult } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { PORTAL } = ModuleEnum;
const BASE = `${PORTAL}/zeroad`;

export namespace ZDPortalApi {
  export interface ConsultQuery {
    company?: string;
    mobile?: string;
    processStatus?: number;
    createTime?: string;
  }

  export interface Consult {
    id: number;
    company: string;
    content: string;
    name: Nullable<string>;
    email: Nullable<string>;
    mobile: string;
    processStatus: number;
    processTime: Nullable<number>;
    processUserId: Nullable<number>;
    createTime: number;
  }

  export interface UpdateProcessStatusModel {
    id: number;
    processStatus: number;
  }

  export interface BatchUpdateProcessStatusModel {
    ids: number[];
    processStatus: number;
  }
}

/**
 * 批量更新官网业务咨询处理状态
 */
export function batchUpdateZeroadConsultApi(
  data: ZDPortalApi.BatchUpdateProcessStatusModel,
) {
  return requestClient.put<boolean>(`${BASE}/consult/status/batch`, data);
}

/**
 * 更新官网业务咨询处理状态
 */
export function updateZeroadConsultStatusApi(
  data: ZDPortalApi.UpdateProcessStatusModel,
) {
  return requestClient.put<boolean>(`${BASE}/consult/status`, data);
}

/**
 * 导出官网业务咨询
 */
export function exporZeroadConsultApi(params: ZDPortalApi.ConsultQuery) {
  return requestClient.download<{ data: Blob }>(`${BASE}/consult/export`, {
    params,
    timeout: 0,
  });
}

/**
 * 获取官网业务咨询分页
 */
export function getZeroadConsultPageApi(
  params: PageParam & ZDPortalApi.ConsultQuery,
) {
  return requestClient.get<PageResult<ZDPortalApi.Consult>>(`${BASE}/consult`, {
    params,
  });
}
